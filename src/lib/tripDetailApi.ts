/**
 * TRIP DETAIL API FUNCTIONS
 * 
 * API functions for trip detail page including seat selection and plan retrieval
 * Handles get_free_seats and get_plan endpoints with proper error handling
 */

import { 
  GetFreeSeatsRequest, 
  GetPlanRequest, 
  FreeSeatsResponse, 
  PlanResponse,
  TripDetailError,
  DiscountsResponse,
  Discount,
  BaggageItem,
  BookingRequest,
  BookingResponse
} from '@/types/tripDetail';
import { GetAllRoutesResponse, GetAllRoutesRequest } from '@/types/getAllRoutes';

// ===============================
// API Configuration
// ===============================

const API_BASE_URL = import.meta.env.DEV ? '/api/backend' : '/api/backend';

// ===============================
// Error Handling
// ===============================

function createTripDetailError(
  code: TripDetailError['code'],
  message: string,
  details?: Record<string, unknown>,
  retryable = false
): TripDetailError {
  return { code, message, details, retryable };
}

function handleApiError(error: unknown): TripDetailError {
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return createTripDetailError('network_error', 'Network error occurred. Please check your connection.', {}, true);
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return createTripDetailError('route_not_found', 'Route not found or no longer available.', {}, false);
    }
    if (error.message.includes('seats') || error.message.includes('unavailable')) {
      return createTripDetailError('seats_unavailable', 'Seats are no longer available.', {}, false);
    }
    return createTripDetailError('api_error', error.message, {}, true);
  }
  return createTripDetailError('api_error', 'An unexpected error occurred', {}, true);
}

// ===============================
// Free Seats API
// ===============================

export async function apiFreeSeats(payload: GetFreeSeatsRequest): Promise<FreeSeatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/free`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle API error responses
    if (data.error) {
      throw new Error(data.error);
    }

    // Normalize response structure
    if (data.trips && Array.isArray(data.trips)) {
      return data as FreeSeatsResponse;
    }

    // Handle case where response might be wrapped
    if (data.data && data.data.trips) {
      return data.data as FreeSeatsResponse;
    }

    // If no trips array, create empty response
    return { trips: [] };
  } catch (error) {
    console.error('Free seats API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Plan API
// ===============================

export async function apiPlan(payload: GetPlanRequest): Promise<PlanResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/curl/get_plan.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle API error responses
    if (data.error) {
      throw new Error(data.error);
    }

    // Normalize response structure
    if (data.plan_type && data.floors) {
      return data as PlanResponse;
    }

    // Handle case where response might be wrapped
    if (data.data && data.data.plan_type) {
      return data.data as PlanResponse;
    }

    throw new Error('Invalid plan response format');
  } catch (error) {
    console.error('Plan API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Combined Seat Map Data
// ===============================

export interface SeatMapRequest {
  interval_id: string;
  bustype_id: string;
  currency: string;
  lang: string;
}

export interface SeatMapData {
  bustype_id: string;
  plan?: PlanResponse;
  freeSeats: Array<{
    seat_number: number | string;
    seat_free: 0 | 1;
    seat_price?: number;
    seat_curency?: string;
  }>;
  hasPlan: 0 | 1;
}

export async function getSeatMapData(request: SeatMapRequest): Promise<SeatMapData> {
  try {
    // Get free seats first
    const freeSeatsResponse = await apiFreeSeats({
      interval_id: request.interval_id,
      currency: request.currency,
      lang: request.lang,
    });

    // Find the trip with matching bustype_id
    const trip = freeSeatsResponse.trips.find(t => t.bustype_id === request.bustype_id);
    
    if (!trip) {
      throw new Error(`No trip found for bustype_id: ${request.bustype_id}`);
    }

    const seatMapData: SeatMapData = {
      bustype_id: request.bustype_id,
      freeSeats: trip.free_seat || [],
      hasPlan: trip.has_plan,
    };

    // Get plan if available
    if (trip.has_plan === 1) {
      try {
        const planResponse = await apiPlan({
          bustype_id: request.bustype_id,
          position: "h",
          v: "2.0",
        });
        seatMapData.plan = planResponse;
      } catch (planError) {
        console.warn('Failed to get plan, using free seats only:', planError);
        // Continue without plan - we'll use free seats list
      }
    }

    return seatMapData;
  } catch (error) {
    console.error('Seat map data error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Multiple Seat Maps (for transfers)
// ===============================

export interface MultiSeatMapRequest {
  interval_ids: string[];
  bustype_ids: string[];
  currency: string;
  lang: string;
}

export async function getMultiSeatMapData(request: MultiSeatMapRequest): Promise<Record<string, SeatMapData>> {
  try {
    const results: Record<string, SeatMapData> = {};

    // Process each segment
    for (let i = 0; i < request.interval_ids.length; i++) {
      const interval_id = request.interval_ids[i];
      const bustype_id = request.bustype_ids[i];

      if (!interval_id || !bustype_id) {
        console.warn(`Missing interval_id or bustype_id for segment ${i}`);
        continue;
      }

      try {
        const seatMapData = await getSeatMapData({
          interval_id,
          bustype_id,
          currency: request.currency,
          lang: request.lang,
        });
        
        results[bustype_id] = seatMapData;
      } catch (error) {
        console.error(`Failed to get seat map for segment ${i} (${bustype_id}):`, error);
        // Continue with other segments
      }
    }

    return results;
  } catch (error) {
    console.error('Multi seat map data error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Utility Functions
// ===============================

export function normalizeSeatNumber(seatNumber: number | string): string {
  return String(seatNumber);
}

export function isSeatAvailable(
  seatNumber: string, 
  freeSeats: Array<{ seat_number: number | string; seat_free: 0 | 1 }>
): boolean {
  const normalizedSeat = normalizeSeatNumber(seatNumber);
  const seat = freeSeats.find(s => normalizeSeatNumber(s.seat_number) === normalizedSeat);
  return seat ? seat.seat_free === 1 : false;
}

export function getSeatPrice(
  seatNumber: string,
  freeSeats: Array<{ seat_number: number | string; seat_free: 0 | 1; seat_price?: number }>
): number | undefined {
  const normalizedSeat = normalizeSeatNumber(seatNumber);
  const seat = freeSeats.find(s => normalizeSeatNumber(s.seat_number) === normalizedSeat);
  console.log(`Looking for seat ${seatNumber} (normalized: ${normalizedSeat})`, seat);
  return seat?.seat_price;
}

// ===============================
// Cache Management
// ===============================

const seatMapCache = new Map<string, { data: SeatMapData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedSeatMap(cacheKey: string): SeatMapData | null {
  const cached = seatMapCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedSeatMap(cacheKey: string, data: SeatMapData): void {
  seatMapCache.set(cacheKey, { data, timestamp: Date.now() });
}

export function clearSeatMapCache(): void {
  seatMapCache.clear();
}

// ===============================
// Get All Routes API
// ===============================

export async function apiGetAllRoutes(payload: GetAllRoutesRequest): Promise<GetAllRoutesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/curl/get_all_routes.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/xml',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for errors
    const errorElement = xmlDoc.querySelector('error');
    if (errorElement) {
      const errorCode = errorElement.textContent;
      const detailElement = xmlDoc.querySelector('detal');
      const errorDetail = detailElement?.textContent;
      
      let errorMessage = 'Unknown error';
      switch (errorCode) {
        case 'dealer_no_activ':
          errorMessage = 'Dealer not active';
          break;
        case 'empty_timetable_id':
          errorMessage = 'Empty timetable ID';
          break;
        case 'empty_route_id':
          errorMessage = 'Route ID not found';
          break;
        case 'route_no_found':
          errorMessage = 'Route not available to dealer';
          break;
        case 'route_data_no_found':
          errorMessage = 'No route information found';
          break;
        default:
          errorMessage = errorDetail || errorCode || 'Unknown error';
      }
      
      throw new Error(errorMessage);
    }

    // Parse route items
    const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => {
      const parseElement = (selector: string, defaultValue: any = '') => {
        const element = item.querySelector(selector);
        return element ? element.textContent || defaultValue : defaultValue;
      };

      const parseArray = (selector: string) => {
        return Array.from(item.querySelectorAll(selector)).map(el => {
          const obj: any = {};
          Array.from(el.children).forEach(child => {
            obj[child.tagName] = child.textContent || '';
          });
          return obj;
        });
      };

      return {
        route_id: parseElement('route_id'),
        route_back_id: parseElement('route_back_id'),
        buy: parseElement('buy', '0') as '0' | '1',
        reserve: parseElement('reserve', '0') as '0' | '1',
        request: parseElement('request', '0') as '0' | '1',
        international: parseElement('international', '0') as '0' | '1',
        inland: parseElement('inland', '0') as '0' | '1',
        lock_order: parseElement('lock_order', '0') as '0' | '1',
        lock_min: parseElement('lock_min'),
        reserve_min: parseElement('reserve_min'),
        start_sale_day: parseElement('start_sale_day'),
        stop_sale_hours: parseElement('stop_sale_hours'),
        cancel_free_min: parseElement('cancel_free_min'),
        route_name: parseElement('route_name'),
        carrier: parseElement('carrier'),
        comfort: parseElement('comfort'),
        bustype: parseElement('bustype'),
        baggage: parseArray('baggage item'),
        luggage: parseElement('luggage'),
        route_info: parseElement('route_info'),
        from: {
          point_id: parseElement('from point_id'),
          point_name: parseElement('from point_name'),
        },
        to: {
          point_id: parseElement('to point_id'),
          point_name: parseElement('to point_name'),
        },
        schledules: {
          days: parseElement('schledules days'),
          departure: parseElement('schledules departure'),
          time_in_way: parseElement('schledules time_in_way'),
        },
        stations: parseArray('stations item'),
        intervals: parseArray('intervals item'),
        discounts: parseArray('discounts item'),
        cancel_hours_info: parseArray('cancel_hours_info item'),
        route_foto: Array.from(item.querySelectorAll('route_foto item')).map(el => el.textContent || ''),
        regulations_url: parseElement('regulations_url'),
      };
    });

    return { item: items };
  } catch (error) {
    console.error('Get all routes API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Get Free Seats API
// ===============================

export async function apiGetFreeSeats(request: GetFreeSeatsRequest): Promise<FreeSeatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/curl/get_free_seats.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get free seats API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Get Plan API
// ===============================

export async function apiGetPlan(request: GetPlanRequest): Promise<PlanResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/curl/get_plan.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get plan API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Get Discounts API
// ===============================

export interface GetDiscountsRequest {
  interval_id: string;
  currency: string;
  lang: string;
}

export async function apiGetDiscounts(request: GetDiscountsRequest): Promise<DiscountsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/curl/get_discount.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle API error responses
    if (data.error) {
      throw new Error(data.error);
    }

    // Normalize response structure
    if (data.route_id && data.discounts) {
      return data as DiscountsResponse;
    }

    // Handle case where response might be wrapped
    if (data.data && data.data.route_id) {
      return data.data as DiscountsResponse;
    }

    // If no discounts, return empty response
    return { route_id: request.interval_id, discounts: [] };
  } catch (error) {
    console.error('Get discounts API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Discount Utility Functions
// ===============================

export function calculateDiscountPrice(
  basePrice: number,
  discount: Discount,
  passengers: number
): number {
  const discountPerPassenger = discount.discount_price;
  const maxDiscount = discount.discount_price_max || discountPerPassenger;
  
  // Calculate total discount (capped at max per passenger)
  const totalDiscount = Math.min(discountPerPassenger, maxDiscount) * passengers;
  
  // Return the discount amount (not the final price)
  return totalDiscount;
}

export function calculateFinalPrice(
  basePrice: number,
  discount: Discount,
  passengers: number
): number {
  const discountAmount = calculateDiscountPrice(basePrice, discount, passengers);
  return Math.max(0, (basePrice * passengers) - discountAmount);
}

export function formatDiscountPrice(price: number, currency: string = 'EUR'): string {
  return `${price.toFixed(2)} ${currency}`;
}

// ===============================
// Get Baggage API
// ===============================

export interface GetBaggageRequest {
  interval_id: string;
  station_id_to: string;
  currency: string;
  lang: string;
}

export async function apiGetBaggage(request: GetBaggageRequest): Promise<BaggageItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/curl/get_baggage.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle API error responses
    if (data.error) {
      throw new Error(data.error);
    }

    // Normalize response structure
    if (Array.isArray(data)) {
      return data as BaggageItem[];
    }

    // Handle case where response might be wrapped
    if (data.data && Array.isArray(data.data)) {
      return data.data as BaggageItem[];
    }

    // If no baggage, return empty array
    return [];
  } catch (error) {
    console.error('Get baggage API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Baggage Utility Functions
// ===============================

export function calculateBaggagePrice(
  baggage: BaggageItem,
  quantity: number
): number {
  return baggage.price * quantity;
}

export function calculateTotalBaggagePrice(
  baggageSelections: BaggageSelection[]
): number {
  return baggageSelections.reduce((total, selection) => {
    return total + (selection.price * selection.quantity);
  }, 0);
}

export function formatBaggagePrice(price: number, currency: string = 'EUR'): string {
  return `${price.toFixed(2)} ${currency}`;
}

export function getBaggageDimensions(baggage: BaggageItem): string {
  return `${baggage.length}×${baggage.width}×${baggage.height} cm`;
}

export function getBaggageWeight(baggage: BaggageItem): string {
  return `${baggage.kg} kg`;
}

// ===============================
// Booking API
// ===============================

export async function apiCreateBooking(request: BookingRequest): Promise<BookingResponse> {
  try {
    console.log('Sending booking request to API:', request);
    const response = await fetch(`${API_BASE_URL}/curl/new_order.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    // Handle API error responses
    if (data.error) {
      console.error('API returned error:', data.error);
      throw new Error(data.error);
    }

    // Normalize response structure
    if (data.order_id && data.status) {
      return data as BookingResponse;
    }

    // Handle case where response might be wrapped
    if (data.data && data.data.order_id) {
      return data.data as BookingResponse;
    }

    throw new Error('Invalid booking response format');
  } catch (error) {
    console.error('Create booking API error:', error);
    throw handleApiError(error);
  }
}

// ===============================
// Booking Utility Functions
// ===============================

export function formatBookingPrice(price: number, currency: string = 'EUR'): string {
  return `${price.toFixed(2)} ${currency}`;
}

export function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatBookingTime(timeString: string): string {
  return timeString.substring(0, 5); // Remove seconds
}

export function calculateBookingTotal(
  basePrice: number,
  passengers: number,
  discountAmount: number = 0,
  baggageAmount: number = 0,
  promocodeAmount: number = 0
): number {
  return Math.max(0, (basePrice * passengers) - discountAmount + baggageAmount - promocodeAmount);
}

export function validateBookingData(request: BookingRequest): string[] {
  const errors: string[] = [];

  // Basic required fields
  if (!request.date || request.date.length === 0) {
    errors.push('Trip dates are required');
  }

  if (!request.interval_id || request.interval_id.length === 0) {
    errors.push('Trip intervals are required');
  }

  if (!request.seat || request.seat.length === 0) {
    errors.push('Seat selection is required');
  }

  // Passenger data validation (only if provided)
  if (request.name && request.name.length > 0) {
    if (request.surname.length !== request.name.length) {
      errors.push('Number of surnames must match number of names');
    }
    if (request.birth_date.length !== request.name.length) {
      errors.push('Number of birth dates must match number of names');
    }
  }

  // Contact validation (only if provided)
  if (request.phone) {
    if (!/^\+?[\d\s\-\(\)]+$/.test(request.phone)) {
      errors.push('Invalid phone format');
    }
  }

  if (request.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      errors.push('Invalid email format');
    }
  }

  return errors;
}
