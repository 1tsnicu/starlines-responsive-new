/**
 * GET ROUTES SYSTEM - TypeScript Types
 * 
 * Modele complete pentru căutarea și normalizarea rutelor de transport
 * Suportă BUS cu fallback XML→JSON și integrare multi-segment
 */

// ===============================
// Core Types
// ===============================

export type TransportMode = "bus" | "train" | "air" | "mixed";
export type LanguageCode = "en" | "ru" | "ua" | "de" | "pl" | "cz";
export type CurrencyCode = "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
export type WSMode = 0 | 1 | 2; // 0=all, 1=fast, 2=slow

// ===============================
// Request Parameters
// ===============================

export interface GetRoutesRequest {
  // Authentication (handled by backend proxy)
  login: string;
  password: string;
  
  // Core search parameters
  date: string; // YYYY-MM-DD
  id_from: string | number;
  id_to: string | number;
  
  // Transport filtering
  trans: "all" | "bus" | "hotel";
  
  // Optional station specificity
  station_id_from?: string | number;
  station_id_to?: string | number;
  only_by_stations?: 0 | 1;
  
  // Air-specific (omitted for BUS focus)
  // id_iata_from?: string;
  // id_iata_to?: string;
  
  // Passengers
  adt?: number; // adults
  chd?: number; // children
  inf?: number; // infants
  
  // Route options
  direct?: 0 | 1;
  change?: "auto" | number; // auto connections or max transfers
  route_id?: string | number; // specific route revalidation
  interval_id?: string; // specific interval
  
  // Search behavior
  period?: number; // -3 to 14 days offset
  sort_type?: "time" | "price";
  get_all_departure?: 0 | 1; // include sold-out
  ws?: WSMode; // server speed preference
  
  // Misc
  currency?: CurrencyCode;
  lang?: LanguageCode;
  v?: string; // API version
  session?: string; // stability token
  baggage_no?: 0 | 1;
  json?: 1; // force JSON response
}

// ===============================
// Normalized Response Models
// ===============================

export interface DateTimeLike {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mktime_utc?: number; // UTC timestamp
  timezone?: string; // e.g. "GMT+1"
  display?: string; // "07:30 (Prague, GMT+1)"
}

export interface TransferInfo {
  change_stations: 0 | 1; // same station vs different
  change_type: "manual" | "auto";
  transfer_time?: {
    d: number; // days
    h: number; // hours
    m: number; // minutes
  };
  station_from?: string;
  station_to?: string;
}

export interface SeatInfo {
  free_seats?: (number | string)[];
  count?: {
    sitting?: number;
    standing?: number;
  };
  sitting?: number;
  standing?: number;
  current_free_seats_typ?: "sitting" | "standing";
  description?: string;
}

export interface CancelPolicy {
  cancel_free_min?: number; // minutes before departure
  stop_sale_hours?: number; // hours before departure
  cancel_hours_info?: Array<{
    hours_after_depar?: number;
    hours_before_depar?: number;
    cancel_rate?: number; // % commission
    money_back?: number; // optional fixed amount
  }>;
}

export interface TripSegment {
  // Transport info
  trans: TransportMode;
  route_id: string | number;
  interval_id: string; // keep exactly as received
  bus_id?: string;
  
  // Capabilities (what additional calls are needed)
  has_plan?: 0 | 1 | 2; // seat plan availability
  request_get_free_seats?: 0 | 1;
  request_get_discount?: 0 | 1;
  request_get_baggage?: 0 | 1;
  timetable_id?: number; // for get_all_routes
  
  // Departure info
  date_from: string;
  time_from: string;
  mktime_utc_from?: number;
  point_from_id: string;
  point_from_name: string;
  station_from_id?: string;
  station_from_name?: string;
  station_from_lat?: number;
  station_from_lon?: number;
  
  // Arrival info
  date_to: string;
  time_to: string;
  mktime_utc_to?: number;
  point_to_id: string;
  point_to_name: string;
  station_to_id?: string;
  station_to_name?: string;
  station_to_lat?: number;
  station_to_lon?: number;
  
  // Availability
  free_seats_info?: SeatInfo;
  
  // Operator
  carrier?: string;
  carrier_id?: string | number;
  logo_url?: string;
  
  // Comfort features
  comfort?: string[]; // ["wc", "wifi", "220v", etc.]
  
  // Pricing (INFORMATIVE ONLY)
  price_one_way?: number;
  price_one_way_max?: number;
  price_tax?: number;
  provision?: number;
  currency: string;
  
  // Policies
  eticket?: 0 | 1 | 2; // 0=no, 1=yes, 2=both
  only_original?: 0 | 1; // requires original documents
  international?: 0 | 1;
  
  // Booking constraints
  need_birth?: 0 | 1;
  need_doc?: 0 | 1;
  need_citizenship?: 0 | 1;
  fast_booking?: 0 | 1;
  max_seats?: number;
  stop_sale_hours?: number;
  start_sale_day?: number;
}

export interface RouteOption {
  // Unique identifier (hash of segments)
  option_id: string;
  
  // Transport mode (aggregated from segments)
  trans: TransportMode;
  
  // All segments that make up this journey
  segments: TripSegment[];
  
  // Journey summary (derived from first/last segments)
  departure: DateTimeLike;
  arrival: DateTimeLike;
  duration?: string; // "12:40" format
  
  // Transfer information
  transfers?: TransferInfo[];
  transfer_count: number;
  
  // Pricing (INFORMATIVE - real price from new_order)
  price_from?: number; // minimum price
  price_to?: number; // maximum price  
  currency: string;
  price_disclaimer: "informative_only";
  
  // Capabilities (what buttons to show)
  canGetPlan: boolean;
  canGetSeats: boolean;
  canGetDiscounts: boolean;
  canGetBaggage: boolean;
  canGetTimetable: boolean;
  
  // Aggregated policies
  cancel_policy?: CancelPolicy;
  booking_types: ("buy" | "reserve" | "request")[];
  eticket_available: boolean;
  requires_original_docs: boolean;
  
  // Operator summary
  main_carrier?: string;
  carriers: string[];
  comfort_features: string[];
  
  // Internal (for new_order construction)
  needs_revalidation: boolean; // if used 'change' parameter
  original_response?: Record<string, unknown>; // keep raw data for debugging
}

// ===============================
// API Response Types (Raw)
// ===============================

export interface RawGetRoutesResponse {
  result?: 0 | 1;
  error?: string;
  period_is_supported?: 0 | 1;
  session?: string;
  
  // Main results array
  item?: Array<{
    trips?: {
      item?: RawTripSegment[];
    };
    // Transfer info
    change_stations?: 0 | 1;
    change_typ?: "manual" | "auto";
    transfer_time?: { d?: number; h?: number; m?: number };
    // Aggregated pricing
    price_one_way?: number;
    price_one_way_max?: number;
    currency?: string;
  }>;
}

export interface RawTripSegment {
  trans?: string;
  route_id?: string | number;
  interval_id?: string;
  bus_id?: string;
  
  // Capabilities
  has_plan?: 0 | 1 | 2;
  request_get_free_seats?: 0 | 1;
  request_get_discount?: 0 | 1;
  request_get_baggage?: 0 | 1;
  timetable_id?: number;
  
  // Times and locations (can be strings in XML)
  date_from?: string;
  time_from?: string;
  mktime_utc_from?: string | number;
  point_from_id?: string | number;
  point_from_name?: string;
  station_from_id?: string | number;
  station_from_name?: string;
  station_from_lat?: string | number;
  station_from_lon?: string | number;
  
  date_to?: string;
  time_to?: string;
  mktime_utc_to?: string | number;
  point_to_id?: string | number;
  point_to_name?: string;
  station_to_id?: string | number;
  station_to_name?: string;
  station_to_lat?: string | number;
  station_to_lon?: string | number;
  
  // Availability
  free_seats?: (string | number)[];
  free_seats_info?: {
    count?: { sitting?: string | number; standing?: string | number };
    sitting?: string | number;
    standing?: string | number;
    current_free_seats_typ?: string;
    description?: string;
  };
  
  // Operator
  carrier?: string;
  carrier_id?: string | number;
  logo_url?: string;
  
  // Features
  comfort?: string | string[];
  
  // Pricing
  price_one_way?: string | number;
  price_one_way_max?: string | number;
  price_tax?: string | number;
  provision?: string | number;
  currency?: string;
  
  // Policies
  eticket?: 0 | 1 | 2;
  only_original?: 0 | 1;
  international?: 0 | 1;
  
  // Constraints
  need_birth?: 0 | 1;
  need_doc?: 0 | 1;
  need_citizenship?: 0 | 1;
  fast_booking?: 0 | 1;
  max_seats?: string | number;
  stop_sale_hours?: string | number;
  start_sale_day?: string | number;
  
  // Cancel policy
  cancel_free_min?: string | number;
  cancel_hours_info?: Array<{
    hours_after_depar?: string | number;
    hours_before_depar?: string | number;
    cancel_rate?: string | number;
    money_back?: string | number;
  }>;
}

// ===============================
// Search State Management
// ===============================

export interface RouteSearchFilters {
  departure_time?: { from?: string; to?: string }; // "HH:MM"
  arrival_time?: { from?: string; to?: string };
  max_duration?: number; // minutes
  max_transfers?: number;
  direct_only?: boolean;
  operators?: string[];
  comfort_features?: string[];
  eticket_only?: boolean;
  price_range?: { min?: number; max?: number };
}

export interface RouteSearchState {
  // Search parameters
  searchParams: GetRoutesRequest;
  
  // Results
  options: RouteOption[];
  loading: boolean;
  error?: string;
  
  // Filters
  filters: RouteSearchFilters;
  filteredOptions: RouteOption[];
  
  // Metadata
  total_results: number;
  search_time_ms?: number;
  period_supported: boolean;
  session?: string;
  
  // UI state
  selected_option?: RouteOption;
  show_sold_out: boolean;
  sort_by: "time" | "price" | "duration" | "transfers";
}

// ===============================
// Error Types
// ===============================

export interface RouteSearchError {
  code: string;
  message: string;
  user_message: string; // localized
  retry_suggested: boolean;
}

export const ROUTE_ERROR_CODES = {
  DEALER_NO_ACTIV: "dealer_no_activ",
  ROUTE_NO_ACTIV: "route_no_activ", 
  CURRENCY_NO_ACTIV: "currency_no_activ",
  INTERVAL_NO_FOUND: "interval_no_found",
  DATE_INVALID: "date",
  NETWORK_ERROR: "network_error",
  PARSE_ERROR: "parse_error",
  RATE_LIMITED: "rate_limited"
} as const;
