/**
 * GET PLAN TYPES
 * 
 * Definții TypeScript pentru API-ul get_plan
 * Pentru obținerea schemei de locuri din autobuze
 */

// ===============================
// Core Plan Types
// ===============================

export interface SeatInfo {
  number: string | null;
  icon?: string | null;
  isEmpty: boolean;
  isSelectable?: boolean;
}

export interface PlanRow {
  seats: SeatInfo[];
  rowIndex: number;
}

export interface FloorInfo {
  number: number;
  rows: PlanRow[];
}

export interface BusPlan {
  planType: string;
  version: 1.1 | 2.0;
  floors: FloorInfo[];
  orientation: 'h' | 'v';
  busTypeId: string;
}

// ===============================
// API Request Types
// ===============================

export interface GetPlanRequest {
  login: string;
  password: string;
  bustype_id: string;
  position?: 'h' | 'v';  // orientation: horizontal or vertical
  v?: 1.1 | 2.0;        // API version
  session?: string;      // optional session token
  vagon_type?: string;   // for trains, not buses
}

// ===============================
// API Response Types (Raw XML)
// ===============================

export interface RawPlanResponse {
  [key: string]: unknown;
  root?: {
    [key: string]: unknown;
    error?: string;
    detal?: string;
    plan_type?: string;
  };
  error?: string;
  detal?: string;
}

// ===============================
// Normalized Response Types
// ===============================

export interface NormalizedPlanResponse {
  busTypeId: string;
  plan: BusPlan;
  requestTime: string;
  responseTime: string;
}

// ===============================
// Error Handling
// ===============================

export interface GetPlanError {
  code:
    | 'dealer_no_activ'     // Dealer inactiv
    | 'no_found'            // Plan nu a fost găsit
    | 'invalid_bustype'     // ID tip autobuz invalid
    | 'network_error'       // Eroare de rețea
    | 'parse_error'         // Eroare de parsare XML
    | 'validation_error'    // Date de intrare invalide
    | 'unknown_error';      // Eroare necunoscută
  
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ===============================
// Cache Types
// ===============================

export interface PlanCacheKey {
  bustype_id: string;
  position: 'h' | 'v';
  version: 1.1 | 2.0;
}

export interface PlanCacheEntry {
  key: string;
  data: NormalizedPlanResponse;
  created_at: number;
  expires_at: number;
  ttl_ms: number;
  access_count: number;
  last_accessed: number;
  size_bytes: number;
}

export interface PlanCacheStats {
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

export interface PlanApiResponse {
  success: boolean;
  data?: NormalizedPlanResponse;
  error?: GetPlanError;
  cached: boolean;
  response_time_ms: number;
}

export interface SeatSelectionState {
  selectedSeats: string[];
  maxSeats?: number;
  allowedSeats?: string[];
  blockedSeats?: string[];
}

export interface BusPlanConfig {
  orientation: 'h' | 'v';
  version: 1.1 | 2.0;
  showSeatNumbers: boolean;
  enableSelection: boolean;
  maxSelections?: number;
  selectionMode: 'single' | 'multiple';
}

// ===============================
// Visualization Types
// ===============================

export interface SeatStyle {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  isHighlighted?: boolean;
  isDisabled?: boolean;
}

export interface PlanVisualizationProps {
  plan: BusPlan;
  config: BusPlanConfig;
  selectionState: SeatSelectionState;
  onSeatSelect?: (seatNumber: string) => void;
  onSeatDeselect?: (seatNumber: string) => void;
  getSeatStyle?: (seat: SeatInfo) => SeatStyle;
}
