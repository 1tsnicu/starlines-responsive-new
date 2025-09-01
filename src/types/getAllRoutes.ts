/**
 * GET ALL ROUTES SYSTEM - TypeScript Types
 * 
 * Modele complete pentru sistemul de orar detaliat al rutelor
 * Se apelează doar dacă timetable_id este disponibil din get_routes
 */

// ===============================
// Request Parameters
// ===============================

export interface GetAllRoutesRequest {
  // Authentication (handled by backend proxy)
  login: string;
  password: string;
  
  // Core parameter - OBLIGATORIU
  timetable_id: string;
  
  // Optional parameters
  lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz";
  session?: string; // stability token
  json?: 1; // force JSON response
}

// ===============================
// Baggage System
// ===============================

export interface BaggageItem {
  baggage_id: string;
  baggage_type_id: string;
  baggage_type: string;
  baggage_title: string;
  
  // Physical dimensions
  length?: number;
  width?: number;
  height?: number;
  kg?: number;
  
  // Quantity limits
  max_in_bus?: number;
  max_per_person?: number;
  
  // Pricing
  typ?: string; // "free" | "paid"
  price: number; // 0 for free baggage
  currency?: string;
  
  // Additional info
  description?: string;
  icon?: string;
}

// ===============================
// Schedule & Stations
// ===============================

export interface TransferTime {
  d: number; // days
  h: number; // hours
  m: number; // minutes
}

export interface ScheduleStation {
  // Location identifiers
  point_id: string;
  point_name: string;
  station_name?: string;
  station_lat?: number;
  station_lon?: number;
  
  // Arrival timing
  date_arrival?: string; // YYYY-MM-DD
  arrival?: string;      // HH:MM:SS
  
  // Departure timing
  date_departure?: string; // YYYY-MM-DD
  departure?: string;      // HH:MM:SS
  
  // Multi-day support
  day_in_way?: number; // 0=same day, 1=next day, etc.
  
  // Transfer information
  point_change?: 0 | 1; // whether station change is required
  transfer_time?: TransferTime;
  
  // Additional station info
  platform?: string;
  station_info?: string;
  amenities?: string[]; // ["wifi", "cafe", "wc", "shop"]
}

export interface RouteScheduleInfo {
  days?: number; // how many days the route operates
  departure?: string; // first departure time
  time_in_way?: string; // total journey time "HH:MM"
}

// ===============================
// Discounts & Pricing
// ===============================

export interface RouteDiscount {
  discount_id: string;
  discount_name: string;
  discount_type?: "age" | "student" | "group" | "promo";
  percentage?: number; // if known
  description?: string;
}

// ===============================
// Cancellation Policy
// ===============================

export interface CancelHourInfo {
  hours_after_depar?: number; // hours after departure
  hours_before_depar?: number; // hours before departure
  cancel_rate: number; // % commission rate
  money_back?: number; // fixed amount back (if any)
}

export interface CancelPolicy {
  cancel_free_min?: number; // free cancellation window (minutes)
  cancel_hours_info?: CancelHourInfo[];
  description?: string;
}

// ===============================
// Route Intervals & Variants
// ===============================

export interface RouteInterval {
  interval_id: string;
  from_point_id: string;
  to_point_id: string;
  departure_time?: string;
  arrival_time?: string;
  price?: number;
  currency?: string;
}

// ===============================
// Main Route Schedule Model
// ===============================

export interface RouteSchedule {
  // Route identification
  route_id: string;
  route_back_id?: string;
  route_name?: string;
  timetable_id: string;
  
  // Operator information
  carrier?: string;
  carrier_id?: string;
  logo_url?: string;
  bustype?: string;
  
  // Comfort features
  comfort?: string[]; // parsed from CSV -> array
  
  // Booking capabilities
  buy?: 0 | 1;
  reserve?: 0 | 1;
  request?: 0 | 1;
  
  // Booking constraints
  lock_order?: 0 | 1; // whether order gets locked
  lock_min?: number; // minutes the order stays locked
  reserve_min?: number; // minimum reservation time
  max_seats?: number; // maximum seats per booking
  
  // Sale timing
  start_sale_day?: number; // days before departure when sale starts
  stop_sale_hours?: number; // hours before departure when sale stops
  
  // Baggage information
  baggage?: BaggageItem[];
  luggage?: string; // text description of included luggage
  
  // Schedule details
  schledules?: RouteScheduleInfo;
  stations?: ScheduleStation[];
  intervals?: RouteInterval[];
  
  // Pricing options
  discounts?: RouteDiscount[];
  
  // Policies
  cancel_policy?: CancelPolicy;
  cancel_free_min?: number;
  cancel_hours_info?: CancelHourInfo[];
  
  // Additional information
  route_info?: string; // general route description
  route_foto?: string[]; // array of photo URLs
  regulations_url?: string; // link to terms and conditions
  
  // Metadata
  last_updated?: string; // ISO timestamp
  cache_ttl?: number; // cache time to live in minutes
}

// ===============================
// Raw API Response Types
// ===============================

export interface RawGetAllRoutesResponse {
  result?: 0 | 1;
  error?: string;
  
  // Route basic info
  route_id?: string;
  route_back_id?: string;
  route_name?: string;
  timetable_id?: string;
  carrier?: string;
  carrier_id?: string | number;
  logo_url?: string;
  bustype?: string;
  comfort?: string; // CSV string
  
  // Capabilities
  buy?: 0 | 1;
  reserve?: 0 | 1;
  request?: 0 | 1;
  lock_order?: 0 | 1;
  lock_min?: string | number;
  reserve_min?: string | number;
  max_seats?: string | number;
  start_sale_day?: string | number;
  stop_sale_hours?: string | number;
  cancel_free_min?: string | number;
  
  // Baggage (can be array or object with item property)
  baggage?: {
    item?: RawBaggageItem[] | RawBaggageItem;
  } | RawBaggageItem[];
  luggage?: string;
  
  // Schedule info
  schledules?: {
    days?: string | number;
    departure?: string;
    time_in_way?: string;
  };
  
  // Stations (can be array or object with item property)
  stations?: {
    item?: RawScheduleStation[] | RawScheduleStation;
  } | RawScheduleStation[];
  
  // Intervals
  intervals?: {
    item?: RawRouteInterval[] | RawRouteInterval;
  } | RawRouteInterval[];
  
  // Discounts
  discounts?: {
    item?: RawRouteDiscount[] | RawRouteDiscount;
  } | RawRouteDiscount[];
  
  // Cancel policy
  cancel_hours_info?: {
    item?: RawCancelHourInfo[] | RawCancelHourInfo;
  } | RawCancelHourInfo[];
  
  // Additional info
  route_info?: string;
  route_foto?: string | string[];
  regulations_url?: string;
}

export interface RawBaggageItem {
  baggage_id?: string;
  baggage_type_id?: string;
  baggage_type?: string;
  baggage_title?: string;
  length?: string | number;
  width?: string | number;
  height?: string | number;
  kg?: string | number;
  max_in_bus?: string | number;
  max_per_person?: string | number;
  typ?: string;
  price?: string | number;
  currency?: string;
  description?: string;
  icon?: string;
}

export interface RawScheduleStation {
  point_id?: string | number;
  point_name?: string;
  station_name?: string;
  station_lat?: string | number;
  station_lon?: string | number;
  date_arrival?: string;
  arrival?: string;
  date_departure?: string;
  departure?: string;
  day_in_way?: string | number;
  point_change?: 0 | 1;
  transfer_time?: {
    d?: string | number;
    h?: string | number;
    m?: string | number;
  };
  platform?: string;
  station_info?: string;
  amenities?: string | string[];
}

export interface RawRouteInterval {
  interval_id?: string;
  from_point_id?: string | number;
  to_point_id?: string | number;
  departure_time?: string;
  arrival_time?: string;
  price?: string | number;
  currency?: string;
}

export interface RawRouteDiscount {
  discount_id?: string;
  discount_name?: string;
  discount_type?: string;
  percentage?: string | number;
  description?: string;
}

export interface RawCancelHourInfo {
  hours_after_depar?: string | number;
  hours_before_depar?: string | number;
  cancel_rate?: string | number;
  money_back?: string | number;
}

// ===============================
// UI State Management
// ===============================

export interface RouteScheduleState {
  // Current schedule data
  schedule?: RouteSchedule;
  loading: boolean;
  error?: string;
  
  // UI state
  selected_station?: ScheduleStation;
  show_map: boolean;
  show_photos: boolean;
  show_baggage_details: boolean;
  show_cancel_policy: boolean;
  
  // Selected baggage for booking
  selected_baggage: Array<{
    baggage_id: string;
    quantity: number;
  }>;
  
  // Filters
  show_free_baggage_only: boolean;
  selected_amenities: string[];
}

// ===============================
// Error Types
// ===============================

export interface GetAllRoutesError {
  code: string;
  message: string;
  user_message: string;
  retry_suggested: boolean;
}

export const GET_ALL_ROUTES_ERROR_CODES = {
  EMPTY_TIMETABLE_ID: "empty_timetable_id",
  EMPTY_ROUTE_ID: "empty_route_id", 
  ROUTE_NO_FOUND: "route_no_found",
  ROUTE_DATA_NO_FOUND: "route_data_no_found",
  DEALER_NO_ACTIV: "dealer_no_activ",
  NETWORK_ERROR: "network_error",
  PARSE_ERROR: "parse_error",
  TIMEOUT_ERROR: "timeout_error"
} as const;

// ===============================
// Helper Types
// ===============================

export interface StationTimelineItem {
  station: ScheduleStation;
  is_departure: boolean;
  is_arrival: boolean;
  is_transfer: boolean;
  day_display: string; // "Day 1", "Day 2", etc.
  time_display: string; // formatted time with timezone
  duration_at_station?: string; // "15 min stop"
}

export interface BaggageSelection {
  item: BaggageItem;
  quantity: number;
  total_price: number;
  is_valid: boolean; // respects max_per_person/max_in_bus
  validation_error?: string;
}
