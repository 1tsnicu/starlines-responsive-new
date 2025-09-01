/**
 * GET DISCOUNT SYSTEM - TypeScript Types
 * 
 * Modele complete pentru sistemul de discounturi per interval/segment
 * Se apelează doar dacă get_routes semnalează request_get_discount = 1
 */

// ===============================
// Request Parameters
// ===============================

export interface GetDiscountRequest {
  // Core parameters
  interval_id: string; // OBLIGATORIU - din get_routes
  
  // Optional parameters
  currency?: "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
  lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";
  session?: string; // dacă disponibil, unele rute îl cer
}

// ===============================
// Discount Item Models
// ===============================

export interface DiscountItem {
  // Identification
  discount_id: string;
  name: string;
  
  // Pricing
  price: number; // discount_price normalizat
  currency?: string;
  price_max?: number; // dacă serverul furnizează limită maximă
  
  // Constraints
  age_min?: number; // vârsta minimă pentru aplicare
  age_max?: number; // vârsta maximă pentru aplicare
  min_passengers?: number; // numărul minim de pasageri pentru discount de grup
  
  // Requirements
  requires_birth_date?: boolean; // true dacă discount-ul necesită birth_date
  requires_document?: boolean; // true dacă discount-ul necesită document
  
  // Category and type
  type?: "age_based" | "group" | "student" | "senior" | "general";
  category?: "child" | "adult" | "senior" | "student" | "group" | "special";
  
  // Metadata
  description?: string; // descriere detaliată a condiților
  rules?: string; // reguli de aplicare
  
  // Raw data pentru debugging
  raw?: Record<string, unknown>;
}

// ===============================
// Response Models
// ===============================

export interface RawGetDiscountResponse {
  route_id?: string;
  discounts?: {
    item?: Record<string, unknown>[] | Record<string, unknown>;
  };
  [key: string]: unknown;
}

export interface RawDiscountItem {
  discount_id?: string;
  id?: string;
  discount_name?: string;
  name?: string;
  discount_price?: string | number;
  price?: string | number;
  currency?: string;
  price_max?: string | number;
  age_min?: string | number;
  age_max?: string | number;
  min_passengers?: string | number;
  type?: string;
  category?: string;
  description?: string;
  rules?: string;
  [key: string]: unknown;
}

// ===============================
// Selection Models
// ===============================

export interface DiscountSelection {
  discount_id: string;
  passenger_index: number; // index-ul pasagerului în lista de pasageri
  trip_index: number; // index-ul trip-ului în comandă
}

export interface DetailedDiscountSelection extends DiscountSelection {
  discount: DiscountItem;
  estimated_price: number;
}

// ===============================
// Validation Models
// ===============================

export interface DiscountValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  
  // Validation details
  age_requirements_met: boolean;
  document_requirements_met: boolean;
  group_requirements_met: boolean;
  
  // Required fields for new_order
  requires_birth_date: boolean;
  requires_document: boolean;
}

export interface PassengerDiscountValidation {
  passenger_index: number;
  birth_date?: string;
  age?: number;
  has_document?: boolean;
  validation_result: DiscountValidationResult;
}

// ===============================
// New Order Integration
// ===============================

export interface NewOrderDiscountPayload {
  discount_id: Array<Record<string, string>>; // array de obiecte per trip
  
  // Metadata pentru validare și cost tracking
  discount_metadata?: {
    total_estimated_discount: number;
    currency: string;
    selections: DetailedDiscountSelection[];
    validation_results: PassengerDiscountValidation[];
  };
}

export interface DiscountPayloadBuilder {
  selections: DiscountSelection[];
  discounts: DiscountItem[];
  passengers: Array<{
    index: number;
    birth_date?: string;
    age?: number;
  }>;
  
  buildPayload(): NewOrderDiscountPayload;
  validateSelections(): DiscountValidationResult;
}

// ===============================
// State Management
// ===============================

export interface DiscountSelectionState {
  // Per trip, per passenger: discount_id sau null
  selections: Array<Array<string | null>>; // [trip_index][passenger_index] = discount_id
  
  // Available discounts per trip
  available_discounts: Array<DiscountItem[]>;
  
  // Validation state
  validation_results: Array<Array<DiscountValidationResult>>;
  
  // Cost calculation
  total_estimated_discount: number;
  currency: string;
}

// ===============================
// API Configuration
// ===============================

export interface GetDiscountConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  useXmlFallback?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

// ===============================
// Cache Management
// ===============================

export interface DiscountCacheKey {
  interval_id: string;
  currency: string;
  lang: string;
}

export interface DiscountCacheEntry {
  data: NormalizedDiscountResponse;
  timestamp: number;
  ttl: number;
}

export interface DiscountCacheStats {
  total_entries: number;
  hit_rate: number;
  memory_usage: number;
}

// ===============================
// Error Handling
// ===============================

export interface GetDiscountError {
  code: "dealer_no_activ" | "route_no_activ" | "interval_no_found" | 
        "no_discount" | "currency_no_activ" | "network_error" | 
        "parse_error" | "validation_error" | "unknown_error";
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ===============================
// Integration Models
// ===============================

export interface RouteDiscountInfo {
  interval_id: string;
  request_get_discount: number; // 0 sau 1
  supports_discounts: boolean;
}

export interface DiscountIntegrationData {
  route_info: RouteDiscountInfo;
  available_discounts: DiscountItem[];
  current_selections: DiscountSelection[];
  validation_status: DiscountValidationResult;
  estimated_total_discount: number;
}

// ===============================
// UI/UX Models
// ===============================

export interface DiscountDisplayInfo {
  category_groups: Array<{
    category: string;
    discounts: DiscountItem[];
    applicable_passengers: number[];
  }>;
  
  summary: {
    total_discounts: number;
    total_estimated_savings: number;
    currency: string;
  };
}

export interface DiscountQuickStats {
  total_available: number;
  total_selected: number;
  total_savings: number;
  currency: string;
  
  // Breakdown by category
  by_category: Record<string, {
    count: number;
    savings: number;
  }>;
}

// ===============================
// Business Logic Models
// ===============================

export interface DiscountBusinessRules {
  // Age-based validation
  validate_age_requirements: boolean;
  require_birth_date_for_age_discounts: boolean;
  
  // Group discount validation
  validate_group_size: boolean;
  min_group_size_global: number;
  
  // Document validation
  require_documents_for_student_discounts: boolean;
  
  // Conflict resolution
  allow_multiple_discounts_per_passenger: boolean;
  prioritize_best_discount: boolean;
  
  // Cost limits
  max_discount_percentage: number;
  max_discount_absolute: number;
}

// ===============================
// Normalized Response
// ===============================

export interface NormalizedDiscountResponse {
  // Core data
  route_id?: string;
  discounts: DiscountItem[];
  
  // Categorization
  by_category: Record<string, DiscountItem[]>;
  by_type: Record<string, DiscountItem[]>;
  
  // Quick access
  age_based_discounts: DiscountItem[];
  group_discounts: DiscountItem[];
  general_discounts: DiscountItem[];
  
  // Statistics
  stats: DiscountQuickStats;
  
  // Business rules context
  business_rules: DiscountBusinessRules;
  
  // Cache info
  cached_at: number;
  cache_key: string;
}

// ===============================
// Validation Rules
// ===============================

export interface DiscountValidationRules {
  // Age validation
  validate_age_constraints: boolean;
  require_exact_birth_date: boolean;
  
  // Group validation
  validate_minimum_passengers: boolean;
  
  // Document validation
  validate_document_requirements: boolean;
  
  // Conflict validation
  allow_overlapping_discounts: boolean;
  max_discounts_per_passenger: number;
  
  // Cost validation
  validate_discount_limits: boolean;
  max_total_discount_percentage: number;
}
