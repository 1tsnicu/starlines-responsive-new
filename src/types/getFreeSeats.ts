/**
 * GET FREE SEATS TYPES
 * 
 * Definții TypeScript pentru sistemul de locuri libere
 * Compatibil cu API get_free_seats - trenuri și autobuze
 */

// ===============================
// Core Seat Information
// ===============================

export interface FreeSeat {
  seat_number: string;
  is_free: boolean;
  price: number;
  
  // Optional metadata
  coordinates?: {
    x: number;
    y: number;
  };
  
  // Additional seat info (optional)
  vagon_id?: string;
  vagon_type?: string;
  seat_type?: string; // window, aisle, middle
  class?: string; // 1, 2, business, economy
  services?: string[]; // wifi, power, etc.
}// ===============================
// Vehicle Information
// ===============================

export interface VagonInfo {
  vagon_id: string;
  vagon_type: string; // standard, premium, sleeper
  seats: FreeSeat[];
  
  // Calculated stats
  total_seats: number;
  free_seats: number;
  
  // Optional metadata
  name?: string;
  class?: string;
  services?: string[];
}

export interface TrainInfo {
  train_id: string;
  train_name: string;
  vagons: VagonInfo[];
  
  // Calculated stats
  total_seats: number;
  free_seats: number;
  
  // Optional metadata
  train_number?: string;
  name?: string;
  train_type?: string;
}

export interface BusInfo {
  bus_id: string;
  bus_name?: string;
  bus_number?: string;
  seats: FreeSeat[];
  
  // Calculated stats
  total_seats: number;
  free_seats: number;
  
  // Optional metadata
  name?: string;
  bus_type?: string;
}

// ===============================
// API Request Types
// ===============================

export interface GetFreeSeatsRequest {
  // Required parameters
  interval_id: string;
  login: string;
  password: string;
  currency: string;          // EUR, RON, USD
  lang: string;              // en, ro, de
  
  // Optional parameters
  train_id?: string;         // pentru trenuri specifice
  vagon_id?: string;         // pentru vagoane specifice
  session?: string;          // session token
}

export interface SeatSelectionConfig {
  max_seats?: number;
  allow_multiple_vagons?: boolean;
  require_adjacent?: boolean;
  preferred_class?: string;
  max_price?: number;
}// ===============================
// API Response Types (Raw)
// ===============================

export interface RawFreeSeatResponse {
  [key: string]: unknown;
  root?: {
    [key: string]: unknown;
    error?: string;
    detal?: string;
  };
  error?: string;
  detal?: string;
}

export interface RawSeatItem {
  seat_id?: string | number;
  seat_number?: string | number;
  seat_is_free?: string | number | boolean;
  seat_price?: string | number;
  seat_curency?: string;
  seat_category?: string;
  seat_x?: string | number;
  seat_y?: string | number;
  [key: string]: unknown;
}

// ===============================
// Normalized Response Types
// ===============================

export interface NormalizedSeatsResponse {
  interval_id: string;
  currency: string;
  
  // Seat data for all vehicle types
  vehicle_type: 'bus' | 'train';
  trains: TrainInfo[];
  buses: BusInfo[];
  all_seats: FreeSeat[];
  total_seats: number;
  free_seats: number;
  response_time: string;
  
  // Optional metadata
  lang?: string;
  request_time?: string;
}

// ===============================
// Selection and Booking Types
// ===============================

export interface SeatSelection {
  seat_number: string;
  price: number;
  vagon_id?: string;
  class?: string;
  seat_type?: string;
}

export interface NewOrderSeatsPayload {
  interval_id: string;
  selected_seats: Array<{
    seat_number: string;
    vagon_id?: string;
    price: number;
  }>;
  total_price: number;
  currency: string;
  passenger_count: number;
}// ===============================
// Error Handling
// ===============================

export interface GetFreeSeatsError {
  code:
    | 'dealer_no_activ'     // Dealer inactiv
    | 'route_no_activ'      // Ruta inactivă
    | 'interval_no_found'   // Interval nu există
    | 'network_error'       // Eroare de rețea
    | 'parse_error'         // Eroare de parsare
    | 'validation_error'    // Date de intrare invalide
    | 'unknown_error'       // Eroare necunoscută
    | 'no_seat'             // Nu sunt locuri disponibile
    | 'no_inforamtion'      // Nu sunt informații (typo din API)
    | 'invalid_train'       // ID tren invalid
    | 'invalid_vagon'       // ID vagon invalid
    | 'api_error';          // Eroare generică de API
  
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ===============================
// Cache Types
// ===============================

export interface SeatsCacheKey {
  interval_id: string;
  train_id?: string;
  vagon_id?: string;
  currency: string;
  lang: string;
}

export interface SeatsCacheEntry {
  key: string;
  data: NormalizedSeatsResponse;
  created_at: number;
  expires_at: number;
  ttl_ms: number;
  access_count: number;
  last_accessed: number;
  size_bytes: number;
  is_placeholder?: boolean;
}

export interface SeatsCacheStats {
  hits: number;
  misses: number;
  evictions: number;
  total_entries: number;
  memory_usage_kb: number;
  hit_rate: number;
  last_cleanup: string;
}

// ===============================
// Integration Types
// ===============================

export interface SeatsApiResponse {
  success: boolean;
  data?: NormalizedSeatsResponse;
  error?: GetFreeSeatsError;
  cached: boolean;
  response_time_ms: number;
}

export interface RouteSeatsInfo {
  interval_id: string;
  route_name: string;
  departure_time: string;
  arrival_time: string;
  vehicle_type: 'bus' | 'train';
  total_seats: number;
  available_seats: number;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface PassengerSeatAssignment {
  passenger_id: string;
  seat_number: string;
  vagon_id?: string;
  price: number;
  class?: string;
  services?: string[];
}