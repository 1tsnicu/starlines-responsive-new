// Order validation and builder utilities
// Handles dynamic validation and payload construction for new_order API

import type {
  NewOrderPayload,
  Passenger,
  TripMeta,
  OrderBuilder,
  OrderValidationError,
  PassengerValidationRules,
  TripSeats,
  DiscountMapPerTrip,
  BaggagePerTrip
} from '@/types/newOrder';

/**
 * Validate passenger data based on route requirements
 */
export function validatePassengerData(
  passengers: Passenger[],
  trips: TripMeta[]
): OrderValidationError[] {
  const errors: OrderValidationError[] = [];
  
  // Get combined requirements from all trips
  const combinedRequirements = getCombinedRequirements(trips);
  
  passengers.forEach((passenger, passengerIndex) => {
    // Name validation (always required if orderdata needed)
    if (combinedRequirements.need_orderdata && !passenger.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Name is required',
        passengerIndex
      });
    }
    
    if (combinedRequirements.need_orderdata && !passenger.surname?.trim()) {
      errors.push({
        field: 'surname',
        message: 'Surname is required',
        passengerIndex
      });
    }
    
    // Phone validation (only for first passenger)
    if (combinedRequirements.need_orderdata && passengerIndex === 0 && !passenger.phone?.trim()) {
      errors.push({
        field: 'phone',
        message: 'Phone number is required for main passenger',
        passengerIndex
      });
    }
    
    // Email validation (only for first passenger)
    if (combinedRequirements.need_orderdata && passengerIndex === 0 && !passenger.email?.trim()) {
      errors.push({
        field: 'email',
        message: 'Email is required for main passenger',
        passengerIndex
      });
    }
    
    // Birth date validation
    if (combinedRequirements.need_birth && !passenger.birth_date?.trim()) {
      errors.push({
        field: 'birth_date',
        message: 'Birth date is required',
        passengerIndex
      });
    }
    
    // Document validation
    if (combinedRequirements.need_doc) {
      if (!passenger.document_type?.trim()) {
        errors.push({
          field: 'document_type',
          message: 'Document type is required',
          passengerIndex
        });
      }
      
      if (!passenger.document_number?.trim()) {
        errors.push({
          field: 'document_number',
          message: 'Document number is required',
          passengerIndex
        });
      }
    }
    
    // Gender validation
    if (combinedRequirements.need_sex && !passenger.gender?.trim()) {
      errors.push({
        field: 'gender',
        message: 'Gender is required',
        passengerIndex
      });
    }
    
    // Citizenship validation
    if (combinedRequirements.need_citizenship && !passenger.citizenship?.trim()) {
      errors.push({
        field: 'citizenship',
        message: 'Citizenship is required',
        passengerIndex
      });
    }
    
    // Birth date format validation
    if (passenger.birth_date && !isValidDateFormat(passenger.birth_date)) {
      errors.push({
        field: 'birth_date',
        message: 'Birth date must be in YYYY-MM-DD format',
        passengerIndex
      });
    }
    
    // Email format validation
    if (passenger.email && !isValidEmail(passenger.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        passengerIndex
      });
    }
    
    // Phone format validation
    if (passenger.phone && !isValidPhone(passenger.phone)) {
      errors.push({
        field: 'phone',
        message: 'Invalid phone number format',
        passengerIndex
      });
    }
  });
  
  return errors;
}

/**
 * Validate seat selections
 */
export function validateSeatSelections(
  trips: TripMeta[],
  passengerCount: number
): OrderValidationError[] {
  const errors: OrderValidationError[] = [];
  
  trips.forEach((trip, tripIndex) => {
    // Check if seats are provided
    if (!trip.seatsPerPassenger || trip.seatsPerPassenger.length === 0) {
      errors.push({
        field: 'seats',
        message: 'Seats must be selected',
        routeIndex: tripIndex
      });
      return;
    }
    
    // Check seat count matches passenger count
    if (trip.seatsPerPassenger.length !== passengerCount) {
      errors.push({
        field: 'seats',
        message: `Expected ${passengerCount} seats, got ${trip.seatsPerPassenger.length}`,
        routeIndex: tripIndex
      });
    }
    
    // Validate seat format for transfers
    if (trip.segments && trip.segments > 1) {
      trip.seatsPerPassenger.forEach((seatStr, passengerIndex) => {
        if (!seatStr) return;
        
        const segments = seatStr.split(',');
        if (segments.length !== trip.segments) {
          errors.push({
            field: 'seats',
            message: `Expected ${trip.segments} seat segments, got ${segments.length}`,
            routeIndex: tripIndex,
            passengerIndex
          });
        }
      });
    }
  });
  
  return errors;
}

/**
 * Build seat structure for API payload
 */
export function buildSeatStructure(
  trips: TripMeta[],
  passengerCount: number
): TripSeats[] {
  return trips.map(trip => {
    if (!trip.seatsPerPassenger) {
      return [];
    }
    
    // For transfers, seats are already in "5,9,15" format
    // For simple routes, they're single numbers
    return trip.seatsPerPassenger.slice(0, passengerCount);
  });
}

/**
 * Build discount structure for API payload
 */
export function buildDiscountStructure(
  trips: TripMeta[]
): DiscountMapPerTrip[] {
  return trips.map(trip => {
    const discountMap: DiscountMapPerTrip = {};
    
    if (trip.discounts) {
      Object.entries(trip.discounts).forEach(([passengerIndex, discountId]) => {
        discountMap[passengerIndex] = discountId;
      });
    }
    
    return discountMap;
  });
}

/**
 * Build baggage structure for API payload
 */
export function buildBaggageStructure(
  trips: TripMeta[]
): Record<string, BaggagePerTrip> {
  const baggageStructure: Record<string, BaggagePerTrip> = {};
  
  trips.forEach((trip, tripIndex) => {
    if (trip.baggagePaidIdsPerPassenger) {
      const baggageForTrip: BaggagePerTrip = trip.baggagePaidIdsPerPassenger
        .map(baggageIds => baggageIds || '')
        .filter(ids => ids.length > 0);
      
      if (baggageForTrip.length > 0) {
        baggageStructure[tripIndex.toString()] = baggageForTrip;
      }
    }
  });
  
  return baggageStructure;
}

/**
 * Build complete order payload
 */
export function buildOrderPayload(builder: OrderBuilder): NewOrderPayload {
  const { trips, passengers, commonData } = builder;
  
    const payload: NewOrderPayload = {
    login: commonData?.login || '',
    password: commonData?.password || '',
    date: trips.map(trip => trip.date),
    interval_id: trips.map(trip => trip.interval_id),
    seat: buildSeatStructure(trips, passengers.length)
  };
  
  // Add passenger data if needed
  const combinedRequirements = getCombinedRequirements(trips);
  
  if (combinedRequirements.need_orderdata) {
    payload.name = passengers.map(p => p.name || '');
    payload.surname = passengers.map(p => p.surname || '');
    
    // Phone and email only for first passenger
    if (passengers[0]?.phone) {
      payload.phone = passengers[0].phone;
    }
    if (passengers[0]?.email) {
      payload.email = passengers[0].email;
    }
  }
  
  if (combinedRequirements.need_birth) {
    payload.birth_date = passengers.map(p => p.birth_date || '');
  }
  
  // Add discounts if any
  const discounts = buildDiscountStructure(trips);
  if (discounts.some(d => Object.keys(d).length > 0)) {
    payload.discount_id = discounts;
  }
  
  // Add baggage if any
  const baggage = buildBaggageStructure(trips);
  if (Object.keys(baggage).length > 0) {
    payload.baggage = baggage;
  }
  
  // Add common data
  if (commonData?.promocode_name) {
    payload.promocode_name = commonData.promocode_name;
  }
  if (commonData?.currency) {
    payload.currency = commonData.currency;
  }
  if (commonData?.lang) {
    payload.lang = commonData.lang;
  }
  
  return payload;
}

/**
 * Get combined requirements from all trips
 */
function getCombinedRequirements(trips: TripMeta[]): PassengerValidationRules {
  const combined: PassengerValidationRules = {};
  
  trips.forEach(trip => {
    if (trip.needOrderData) combined.need_orderdata = 1;
    if (trip.needBirth) combined.need_birth = 1;
    if (trip.needDoc) combined.need_doc = 1;
    if (trip.needCitizenship) combined.need_citizenship = 1;
    if (trip.needGender) combined.need_sex = 1;
  });
  
  return combined;
}

/**
 * Validation helper functions
 */
function isValidDateFormat(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && date === parsedDate.toISOString().split('T')[0];
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - at least 7 digits
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Analyze order complexity
 */
export function analyzeOrderComplexity(trips: TripMeta[]): 'simple' | 'transfers' | 'combined' {
  if (trips.length > 1) {
    return 'combined';
  }
  
  if (trips[0]?.segments && trips[0].segments > 1) {
    return 'transfers';
  }
  
  return 'simple';
}

/**
 * Calculate total passengers across all trips
 */
export function calculateTotalPassengers(trips: TripMeta[]): number {
  if (trips.length === 0) return 0;
  
  // All trips should have the same number of passengers
  return trips[0]?.seatsPerPassenger?.length || 0;
}

/**
 * Validate order builder data
 */
export function validateOrderBuilder(builder: OrderBuilder): OrderValidationError[] {
  const errors: OrderValidationError[] = [];
  
  // Basic validation
  if (!builder.trips || builder.trips.length === 0) {
    errors.push({
      field: 'trips',
      message: 'At least one trip is required'
    });
    return errors;
  }
  
  if (!builder.passengers || builder.passengers.length === 0) {
    errors.push({
      field: 'passengers',
      message: 'At least one passenger is required'
    });
    return errors;
  }
  
  // Validate passenger data
  const passengerErrors = validatePassengerData(builder.passengers, builder.trips);
  errors.push(...passengerErrors);
  
  // Validate seat selections
  const seatErrors = validateSeatSelections(builder.trips, builder.passengers.length);
  errors.push(...seatErrors);
  
  return errors;
}
