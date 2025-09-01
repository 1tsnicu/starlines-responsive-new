// src/types/discounts.ts - Types for discount management

export interface DiscountItem {
  discount_id: string;
  discount_name: string;
  discount_price: number;      // minimum price applied
  discount_price_max?: number; // possible maximum cap
  discount_currency?: string;  // "EUR"
}

export interface GetDiscountsResponse {
  route_id?: string;
  discounts: DiscountItem[] | null; // can be null if no discounts
  error?: string; // API error if any
  [key: string]: unknown; // Index signature for compatibility
}

// UI selection types
export interface PassengerDiscount {
  passengerIndex: number;
  discount_id: string;
  discount_name: string;
  discount_price: number;
  discount_currency?: string;
}

export interface DiscountSelection {
  outbound: PassengerDiscount[]; // discounts for outbound journey
  return?: PassengerDiscount[];  // discounts for return journey (if applicable)
}

// For new_order payload
export interface NewOrderPassenger {
  first_name: string;
  last_name: string;
  phone?: string;
  seat_no?: string;
  discount_id?: string; // if discounts are applied at passenger level
  birth_date?: string;  // for age-based discounts
  document_type?: string;
  document_number?: string;
  gender?: string;
  // For segment-based discounts (if operator requires):
  // discounts_by_segment?: Record<string, string>; // ex. { "seg1": "3199", "seg2": "3197" }
}
