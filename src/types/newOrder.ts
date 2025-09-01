// src/types/newOrder.ts - Type definitions for new_order reservation system

export type TripSeats = string[]; // ex. ["3","4"] sau ["5,1","6,2"] pentru 2 pasageri
export type DiscountMapPerTrip = Record<string, string>; // "0": "3196" (pasager index -> discount_id)
export type BaggagePerTrip = string[]; // per pasager: "82,86" (IDs plătite)

export interface NewOrderPayload {
  login: string;
  password: string;
  promocode_name?: string;
  date: string[];           // pe trips
  interval_id: string[];    // pe trips
  seat: TripSeats[];        // pe trips (array de stringuri per pasager)
  name?: string[];          // pe pasageri
  surname?: string[];       // pe pasageri
  birth_date?: string[];    // pe pasageri (YYYY-MM-DD)
  discount_id?: DiscountMapPerTrip[]; // pe trips
  baggage?: Record<string, BaggagePerTrip>; // tripIndex (string) -> array per pasager
  phone?: string;
  email?: string;
  currency?: string;
  lang?: string;
}

export interface NewOrderResponse {
  order_id: number;
  reservation_until: string;     // "YYYY-MM-DD HH:mm:ss"
  reservation_until_min: string; // "30"
  security: string;
  status: "reserve_ok" | string;
  price_total: number;
  currency: string;
  promocode_info?: {
    promocode_valid: 0 | 1;
    promocode_name: string;
    price_promocode: number;
  };
  // plus obiecte "0", "1" pentru fiecare trip, cu detalii pasageri/bagaje
  [tripIndex: string]: unknown; // pentru obiectele "0", "1" etc.
}

// Helper types for building the payload
export interface Passenger {
  name: string;
  surname: string;
  birth_date?: string; // dacă e necesar
  phone?: string;
  email?: string;
  document_type?: string;
  document_number?: string;
  gender?: string;
  citizenship?: string;
}

export interface TripMeta {
  date: string;
  interval_id: string;
  seatsPerPassenger: string[]; // ["3","4"] sau ["5,1","6,2"]
  // discounts: map indexPasager -> discount_id (doar dacă pasagerul a ales)
  discounts?: Record<number, string>;
  // bagaje plătite: array per pasager: "82,86" etc.
  baggagePaidIdsPerPassenger?: (string | undefined)[];
  // metadata pentru validare
  segments?: number; // numărul de segmente pentru trip
  needOrderData?: boolean;
  needBirth?: boolean;
  needDoc?: boolean;
  needGender?: boolean;
  needCitizenship?: boolean;
}

export interface ReservationInfo {
  order_id: number;
  security: string;
  reservation_until: string;
  reservation_until_min: string;
  price_total: number;
  currency: string;
  status: string;
  promocode_info?: {
    promocode_valid: 0 | 1;
    promocode_name: string;
    price_promocode: number;
  };
}

// ===============================
// Extended Types for Full Implementation
// ===============================

export interface PassengerValidationRules {
  need_orderdata?: number;
  need_birth?: number;
  need_doc?: number;
  need_citizenship?: number;
  need_sex?: number;
  need_bonus_card?: number;
}

export interface OrderValidationError {
  field: string;
  message: string;
  passengerIndex?: number;
  routeIndex?: number;
}

export interface ReservationTimer {
  orderId: number;
  endTime: number;
  intervalId: NodeJS.Timeout;
  onExpired?: () => void;
  onUpdate?: (remainingMinutes: number, remainingSeconds: number) => void;
}

export interface OrderCreationResult {
  success: boolean;
  reservation?: ReservationInfo;
  timer?: ReservationTimer;
  validation_errors?: OrderValidationError[];
  error?: {
    code: string;
    message: string;
    detail?: string;
  };
}

export interface OrderBuilder {
  trips: TripMeta[];
  passengers: Passenger[];
  commonData?: {
    phone?: string;
    email?: string;
    promocode_name?: string;
    currency?: string;
    lang?: string;
    login?: string;
    password?: string;
  };
}

export interface OrderAnalytics {
  total_passengers: number;
  total_trips: number;
  total_routes: number;
  total_price: number;
  currency: string;
  has_discounts: boolean;
  has_baggage: boolean;
  has_promocode: boolean;
  reservation_duration_minutes: number;
  complexity: 'simple' | 'transfers' | 'combined';
}

// ===============================
// API Response Wrapper Types
// ===============================

export type NewOrderApiResponse<T> = 
  | { success: true; data: T; cached?: boolean; timestamp?: number }
  | { success: false; error: { code: string; message: string; detail?: string } };

// ===============================
// Constants
// ===============================

export const ORDER_ERROR_CODES = {
  DEALER_NO_ACTIV: 'dealer_no_activ',
  INTERVAL_NO_FOUND: 'interval_no_found',
  ROUTE_NO_ACTIV: 'route_no_activ',
  NO_SEAT: 'no_seat',
  NEW_ORDER: 'new_order',
  NO_NAME: 'no_name',
  NO_PHONE: 'no_phone',
  NO_DOC: 'no_doc',
  NO_BIRTH_DATE: 'no_birth_date',
  NO_EMAIL: 'no_email',
  INVALID_DATA: 'invalid_data',
  SEAT_TAKEN: 'seat_taken',
  ROUTE_FULL: 'route_full'
} as const;

export const DOCUMENT_TYPES = {
  PASSPORT: 'passport',
  ID_CARD: 'id_card',
  DRIVING_LICENSE: 'driving_license',
  BIRTH_CERTIFICATE: 'birth_certificate',
  OTHER: 'other'
} as const;

export const GENDER_TYPES = {
  MALE: 'M',
  FEMALE: 'F'
} as const;

export const ORDER_STATUS = {
  RESERVE_OK: 'reserve_ok',
  RESERVE_PENDING: 'reserve_pending',
  RESERVE_EXPIRED: 'reserve_expired',
  RESERVE_CANCELLED: 'reserve_cancelled'
} as const;
