// Main API client for new_order with comprehensive functionality
// Integrates HTTP client, validation, timer management, and error handling

import { createNewOrder } from './newOrderHttp';
import { 
  validateOrderBuilder, 
  buildOrderPayload, 
  analyzeOrderComplexity,
  calculateTotalPassengers 
} from './orderValidation';
import { 
  startReservationTimer, 
  createOrderWithTimer,
  stopReservationTimer 
} from './reservationTimer';

import type {
  OrderBuilder,
  OrderCreationResult,
  NewOrderPayload,
  OrderAnalytics,
  ReservationInfo,
  TripMeta,
  Passenger
} from '@/types/newOrder';

/**
 * Create new order with comprehensive validation and timer management
 */
export async function createOrder(
  builder: OrderBuilder,
  options: {
    validate?: boolean;
    autoStartTimer?: boolean;
    timerCallbacks?: {
      onUpdate?: (minutes: number, seconds: number) => void;
      onExpired?: () => void;
    };
    credentials?: {
      login: string;
      password: string;
    };
  } = {}
): Promise<OrderCreationResult> {
  const {
    validate = true,
    autoStartTimer = true,
    timerCallbacks,
    credentials
  } = options;

  try {
    console.log('Creating order with builder:', {
      trips: builder.trips.length,
      passengers: builder.passengers.length,
      complexity: analyzeOrderComplexity(builder.trips)
    });

    // Validation
    if (validate) {
      const validationErrors = validateOrderBuilder(builder);
      
      if (validationErrors.length > 0) {
        console.warn('Order validation failed:', validationErrors);
        return {
          success: false,
          validation_errors: validationErrors,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order data validation failed'
          }
        };
      }
    }

    // Add credentials to builder
    const builderWithCredentials = {
      ...builder,
      commonData: {
        ...builder.commonData,
        login: credentials?.login || builder.commonData?.login || '',
        password: credentials?.password || builder.commonData?.password || ''
      }
    };

    // Build payload
    const payload = buildOrderPayload(builderWithCredentials);
    
    console.log('Order payload built:', {
      trips: payload.date.length,
      passengers: payload.name?.length || 0,
      hasDiscounts: !!payload.discount_id,
      hasBaggage: !!payload.baggage
    });

    // Create order
    const result = await createNewOrder(payload);

    if (!result.success) {
      return result;
    }

    // Success - start timer if requested
    if (autoStartTimer && result.reservation) {
      const timerResult = createOrderWithTimer(result, {
        ...timerCallbacks,
        autoStart: true
      });
      
      return timerResult;
    }

    return result;

  } catch (error) {
    console.error('Order creation failed:', error);
    
    return {
      success: false,
      error: {
        code: 'CREATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Create simple order (single trip, no transfers)
 */
export async function createSimpleOrder(
  trip: {
    date: string;
    interval_id: string;
    seats: string[]; // one seat per passenger
  },
  passengers: Passenger[],
  options: {
    credentials: { login: string; password: string };
    commonData?: {
      phone?: string;
      email?: string;
      promocode_name?: string;
    };
    timerCallbacks?: {
      onUpdate?: (minutes: number, seconds: number) => void;
      onExpired?: () => void;
    };
  }
): Promise<OrderCreationResult> {
  const tripMeta: TripMeta = {
    date: trip.date,
    interval_id: trip.interval_id,
    seatsPerPassenger: trip.seats,
    segments: 1,
    needOrderData: true // Assume basic data needed
  };

  const builder: OrderBuilder = {
    trips: [tripMeta],
    passengers,
    commonData: {
      ...options.commonData,
      login: options.credentials.login,
      password: options.credentials.password
    }
  };

  return createOrder(builder, {
    validate: true,
    autoStartTimer: true,
    timerCallbacks: options.timerCallbacks,
    credentials: options.credentials
  });
}

/**
 * Create order with transfers (single trip, multiple segments)
 */
export async function createTransferOrder(
  trip: {
    date: string;
    interval_id: string;
    seatsPerSegment: string[][]; // [["5","6"], ["9","10"], ["15","16"]] for 2 passengers, 3 segments
  },
  passengers: Passenger[],
  options: {
    credentials: { login: string; password: string };
    commonData?: {
      phone?: string;
      email?: string;
      promocode_name?: string;
    };
    timerCallbacks?: {
      onUpdate?: (minutes: number, seconds: number) => void;
      onExpired?: () => void;
    };
  }
): Promise<OrderCreationResult> {
  // Convert seats to transfer format: "5,9,15" for each passenger
  const seatsPerPassenger = passengers.map((_, passengerIndex) => {
    return trip.seatsPerSegment.map(segment => segment[passengerIndex]).join(',');
  });

  const tripMeta: TripMeta = {
    date: trip.date,
    interval_id: trip.interval_id,
    seatsPerPassenger,
    segments: trip.seatsPerSegment.length,
    needOrderData: true
  };

  const builder: OrderBuilder = {
    trips: [tripMeta],
    passengers,
    commonData: {
      ...options.commonData,
      login: options.credentials.login,
      password: options.credentials.password
    }
  };

  return createOrder(builder, {
    validate: true,
    autoStartTimer: true,
    timerCallbacks: options.timerCallbacks,
    credentials: options.credentials
  });
}

/**
 * Create combined order (multiple trips)
 */
export async function createCombinedOrder(
  trips: Array<{
    date: string;
    interval_id: string;
    seats: string[]; // one seat per passenger for this trip
    discounts?: Record<number, string>; // passenger index -> discount_id
    baggage?: string[]; // baggage IDs per passenger
  }>,
  passengers: Passenger[],
  options: {
    credentials: { login: string; password: string };
    commonData?: {
      phone?: string;
      email?: string;
      promocode_name?: string;
    };
    timerCallbacks?: {
      onUpdate?: (minutes: number, seconds: number) => void;
      onExpired?: () => void;
    };
  }
): Promise<OrderCreationResult> {
  const tripsMeta: TripMeta[] = trips.map(trip => ({
    date: trip.date,
    interval_id: trip.interval_id,
    seatsPerPassenger: trip.seats,
    segments: 1,
    needOrderData: true,
    discounts: trip.discounts,
    baggagePaidIdsPerPassenger: trip.baggage?.map(baggage => baggage || undefined)
  }));

  const builder: OrderBuilder = {
    trips: tripsMeta,
    passengers,
    commonData: {
      ...options.commonData,
      login: options.credentials.login,
      password: options.credentials.password
    }
  };

  return createOrder(builder, {
    validate: true,
    autoStartTimer: true,
    timerCallbacks: options.timerCallbacks,
    credentials: options.credentials
  });
}

/**
 * Cancel/stop order reservation
 */
export function cancelOrderReservation(orderId: number): boolean {
  return stopReservationTimer(orderId);
}

/**
 * Analyze order before creation
 */
export function analyzeOrder(builder: OrderBuilder): OrderAnalytics {
  const complexity = analyzeOrderComplexity(builder.trips);
  const totalPassengers = calculateTotalPassengers(builder.trips);
  
  // Calculate if order has additional features
  const hasDiscounts = builder.trips.some(trip => 
    trip.discounts && Object.keys(trip.discounts).length > 0
  );
  
  const hasBaggage = builder.trips.some(trip => 
    trip.baggagePaidIdsPerPassenger && 
    trip.baggagePaidIdsPerPassenger.some(baggage => baggage && baggage.length > 0)
  );
  
  const hasPromocode = !!builder.commonData?.promocode_name;

  return {
    total_passengers: totalPassengers,
    total_trips: builder.trips.length,
    total_routes: builder.trips.length, // Same as trips for this implementation
    total_price: 0, // Would need route price data
    currency: builder.commonData?.currency || 'EUR',
    has_discounts: hasDiscounts,
    has_baggage: hasBaggage,
    has_promocode: hasPromocode,
    reservation_duration_minutes: 20, // Default
    complexity
  };
}

/**
 * Validate order before creation (without creating)
 */
export function validateOrder(builder: OrderBuilder): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  analytics: OrderAnalytics;
} {
  const validationErrors = validateOrderBuilder(builder);
  const analytics = analyzeOrder(builder);
  
  const errors = validationErrors.map(error => {
    let message = error.message;
    if (error.passengerIndex !== undefined) {
      message = `Passenger ${error.passengerIndex + 1}: ${message}`;
    }
    if (error.routeIndex !== undefined) {
      message = `Trip ${error.routeIndex + 1}: ${message}`;
    }
    return message;
  });

  const warnings: string[] = [];
  
  // Add warnings for complex orders
  if (analytics.complexity === 'transfers') {
    warnings.push('Order includes transfers - verify all seat segments');
  }
  
  if (analytics.complexity === 'combined') {
    warnings.push('Order includes multiple trips - verify all dates and routes');
  }
  
  if (analytics.has_discounts) {
    warnings.push('Order includes discounts - verify eligibility');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    analytics
  };
}

/**
 * Convert legacy order data to new builder format
 */
export function convertLegacyOrder(legacyData: {
  dates: string[];
  interval_ids: string[];
  seats: string[][];
  passengers: Passenger[];
  discounts?: Record<string, Record<string, string>>;
  baggage?: Record<string, string[]>;
}): OrderBuilder {
  const { dates, interval_ids, seats, passengers, discounts, baggage } = legacyData;
  
  const trips: TripMeta[] = dates.map((date, index) => ({
    date,
    interval_id: interval_ids[index],
    seatsPerPassenger: seats[index] || [],
    segments: 1,
    needOrderData: true,
    discounts: discounts?.[index.toString()] ? 
      Object.fromEntries(
        Object.entries(discounts[index.toString()]).map(([k, v]) => [parseInt(k), v])
      ) : undefined,
    baggagePaidIdsPerPassenger: baggage?.[index.toString()]
  }));

  return {
    trips,
    passengers,
    commonData: {}
  };
}

// Export convenience functions
export {
  validateOrderBuilder,
  buildOrderPayload,
  analyzeOrderComplexity,
  calculateTotalPassengers
} from './orderValidation';

export {
  startReservationTimer,
  stopReservationTimer,
  getRemainingTime,
  formatRemainingTime
} from './reservationTimer';
