/**
 * GET BAGGAGE SYSTEM - TypeScript Types
 * 
 * Modele complete pentru sistemul de bagaje detaliat per interval/segment
 * Se apelează doar dacă get_routes semnalează request_get_baggage = 1
 */

// ===============================
// Request Parameters
// ===============================

export interface GetBaggageRequest {
  // Core parameters
  interval_id: string; // OBLIGATORIU - din get_routes
  station_from_id?: string; // recomandat pentru precision
  station_to_id?: string; // recomandat pentru precision
  
  // Optional parameters
  currency?: "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
  lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";
}

// ===============================
// Baggage Item Models
// ===============================

export interface BaggageItem {
  // Identification
  baggage_id: string;
  baggage_type_id?: string;
  baggage_type?: string;
  baggage_title?: string;
  
  // Physical specifications
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  kg?: number; // weight limit
  
  // Quantity limits
  max_in_bus?: number; // global limit per bus
  max_per_person?: number; // limit per passenger
  
  // Type and category
  typ?: string; // "route", etc.
  category?: "carry_on" | "checked" | "special" | "oversized";
  
  // Pricing
  price: number; // 0 = free baggage
  currency?: string;
  
  // Additional info
  description?: string;
  icon?: string;
  is_included?: boolean; // derived from price === 0
}

export interface BaggageGroup {
  group_id: string;
  group_name: string;
  group_type: "free" | "paid" | "special";
  items: BaggageItem[];
  total_included: number; // how many free items in this group
}

// ===============================
// Raw API Response Types
// ===============================

export interface RawGetBaggageResponse {
  result?: 0 | 1;
  error?: string;
  
  // Main baggage data (can be array or object with item property)
  item?: RawBaggageItem[] | RawBaggageItem;
  baggage?: {
    item?: RawBaggageItem[] | RawBaggageItem;
  } | RawBaggageItem[];
}

export interface RawBaggageItem {
  baggage_id?: string | number;
  baggage_type_id?: string | number;
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

// ===============================
// Selection & Validation Models
// ===============================

export interface BaggageSelection {
  baggage_id: string;
  quantity: number;
}

export interface DetailedBaggageSelection {
  baggage_id: string;
  item: BaggageItem;
  quantity: number;
  passenger_index: number; // which passenger selected this
  trip_index: number; // which trip/segment this belongs to
  total_price: number;
}

export interface BaggageValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  
  // Per item validation
  item_violations: Array<{
    baggage_id: string;
    error_type: "max_per_person" | "max_in_bus" | "quantity_invalid";
    current_count: number;
    max_allowed: number;
  }>;
  
  // Totals
  total_price: number;
  total_items_selected: number;
}

export interface PassengerBaggageSelection {
  passenger_id: string;
  passenger_index: number;
  selected_items: BaggageSelection[];
}

// ===============================
// New Order Payload Construction
// ===============================

export interface NewOrderBaggagePayload {
  baggage: Array<{
    baggage_id: string;
    quantity: string; // API expects string
  }>;
  baggage_metadata?: {
    total_cost: number;
    total_items: number;
    currency: string;
    excluded_free_items: number;
    processed_at: string;
    breakdown: Array<{
      baggage_id: string;
      title: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      currency: string;
    }>;
  };
}

export interface BaggagePayloadBuilder {
  trip_selections: Array<Array<string[]>>; // [trip][passenger][baggage_ids]
  build(): NewOrderBaggagePayload;
  addSelection(trip_index: number, passenger_index: number, baggage_id: string): void;
  removeSelection(trip_index: number, passenger_index: number, baggage_id: string): void;
  validatePayload(): BaggageValidationResult;
}

// ===============================
// UI State Management
// ===============================

export interface BaggageSelectionState {
  // Data loading
  loading: boolean;
  error?: string;
  baggage_items: BaggageItem[];
  baggage_groups: BaggageGroup[];
  
  // Current interval context
  current_interval_id?: string;
  current_station_from?: string;
  current_station_to?: string;
  
  // Selection state
  passenger_selections: PassengerBaggageSelection[];
  total_price: number;
  
  // UI state
  show_free_baggage: boolean;
  show_paid_baggage: boolean;
  selected_category?: "carry_on" | "checked" | "special" | "oversized";
  
  // Validation
  validation_result?: BaggageValidationResult;
  live_validation_enabled: boolean;
}

// ===============================
// Cache & Performance
// ===============================

export interface BaggageCacheKey {
  interval_id: string;
  station_from_id?: string;
  station_to_id?: string;
  currency: string;
  lang: string;
}

export interface BaggageCacheEntry {
  key: BaggageCacheKey;
  data: BaggageItem[];
  timestamp: number;
  ttl: number; // minutes
  hits: number;
}

// ===============================
// Error Types
// ===============================

export interface GetBaggageError {
  code: string;
  message: string;
  user_message: string;
  retry_suggested: boolean;
  context?: {
    interval_id?: string;
    station_from_id?: string;
    station_to_id?: string;
  };
}

export const BAGGAGE_ERROR_CODES = {
  BAGGAGE_NOT_FOUND: "baggage_not_found",
  INTERVAL_NO_ACTIV: "interval_no_activ",
  ROUTE_NO_ACTIV: "route_no_activ", 
  DEALER_NO_ACTIV: "dealer_no_activ",
  CURRENCY_NO_ACTIV: "currency_no_activ",
  NETWORK_ERROR: "network_error",
  PARSE_ERROR: "parse_error",
  VALIDATION_ERROR: "validation_error"
} as const;

// ===============================
// Integration Types
// ===============================

export interface BaggageIntegrationData {
  // From get_routes
  interval_id: string;
  station_from_id?: string;
  station_to_id?: string;
  request_get_baggage: 0 | 1;
  
  // Context for selection
  trip_index: number;
  passenger_count: number;
  existing_free_baggage?: number; // from comfort "1_baggage_free"
  
  // UI context
  route_name?: string;
  segment_description?: string;
}

// ===============================
// Helper Types
// ===============================

export interface BaggageDisplayInfo {
  title: string;
  dimensions: string; // "35×10×10 cm"
  weight: string; // "5 kg"
  price_display: string; // "Gratuit" or "5 EUR"
  restrictions: string; // "max 2 per persoană"
  availability: string; // "8/10 disponibile"
  category_icon: string;
  is_recommended?: boolean;
}

export interface BaggageQuickStats {
  total_free_items: number;
  total_paid_items: number;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  most_popular_type?: string;
  weight_limits: {
    min: number;
    max: number;
  };
}

// ===============================
// Business Rules Validation
// ===============================

export interface BaggageBusinessRules {
  // Per passenger limits
  max_carry_on_per_person: number;
  max_checked_per_person: number;
  max_total_weight_per_person: number; // kg
  
  // Per bus limits  
  max_total_checked_bags: number;
  max_total_special_items: number;
  
  // Pricing rules
  free_baggage_allowance: number; // how many free bags per passenger
  currency_precision: number; // decimal places for prices
  
  // UI behavior
  auto_select_free_baggage: boolean;
  show_weight_warnings: boolean;
  enable_recommendations: boolean;
}

// ===============================
// Complete Response Model
// ===============================

export interface NormalizedBaggageResponse {
  baggage_items: BaggageItem[];
  baggage_groups: BaggageGroup[];
  stats: BaggageQuickStats;
  has_free_baggage: boolean;
  has_paid_baggage: boolean;
  request_info?: {
    interval_id: string;
    station_from_id?: string;
    station_to_id?: string;
    currency?: string;
    lang?: string;
    request_timestamp: number;
    cache_used: boolean;
  };
}

export interface BaggageValidationRules {
  max_total_items?: number;
  max_total_cost?: number;
  min_total_cost?: number;
  currency?: string;
}
