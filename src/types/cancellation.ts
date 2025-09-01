// Types for ticket and order cancellation (refund) system
// Based on Bussystem API get_ticket and cancel_ticket endpoints

export interface TicketCancellationInfo {
  ticket_id: number;
  security: number;
  price: number; // Amount paid for ticket
  cancel_rate: number; // Cancellation rate percentage (0-100)
  money_back_if_cancel: number; // Amount to be returned
  money_noback_if_cancel: number; // Amount to be retained
  currency: string;
  cancel_only_order?: 0 | 1; // 1 = can only cancel entire order, not individual ticket
  baggage?: Array<{
    baggage_id: string;
    baggage_title: string;
    price: number;
    currency: string;
  }>;
}

export interface OrderCancellationInfo {
  order_id: number;
  security: number;
  price_total: number; // Total amount paid for order
  cancel_rate_total?: number; // Overall cancellation rate
  money_back_total?: number; // Total amount to be returned
  money_noback_total?: number; // Total amount to be retained
  currency: string;
  tickets: TicketCancellationInfo[];
}

// Request types
export interface GetTicketRequest {
  login: string;
  password: string;
  ticket_id: number;
  security?: number;
  lang?: string;
  v?: string;
}

export interface CancelTicketRequest {
  login: string;
  password: string;
  ticket_id: number;
  security: number;
  lang?: string;
  v?: string;
}

export interface CancelOrderRequest {
  login: string;
  password: string;
  order_id: number;
  security: number;
  lang?: string;
  v?: string;
}

// Response types
export interface GetTicketResponse {
  ticket_id: number;
  price: number;
  cancel_rate: number;
  money_back_if_cancel: number;
  money_noback_if_cancel: number;
  currency: string;
  cancel_only_order?: 0 | 1;
  baggage?: Array<{
    baggage_id: string;
    baggage_title: string;
    price: number;
    currency: string;
  }>;
  // Additional fields from API
  status?: string;
  passenger_info?: {
    first_name: string;
    last_name: string;
    seat_number: string;
  };
  route_info?: {
    from: string;
    to: string;
    departure_date: string;
    departure_time: string;
  };
}

export interface CancelTicketResponse {
  success: boolean;
  ticket_id: number;
  price: number; // Amount retained
  money_back: number; // Amount returned
  rate: number; // Applied cancellation rate
  currency: string;
  baggage?: Array<{
    baggage_id: string;
    baggage_title: string;
    price: number; // Original price
    price_back: number; // Amount returned for baggage
    currency: string;
  }>;
  // Additional response fields
  status?: string;
  message?: string;
}

export interface CancelOrderResponse {
  success: boolean;
  order_id: number;
  price_total: number; // Total amount retained
  money_back_total: number; // Total amount returned
  currency: string;
  tickets: Record<string, {
    ticket_id: number;
    price: number;
    money_back: number;
    rate: number;
    baggage?: Array<{
      baggage_id: string;
      baggage_title: string;
      price: number;
      price_back: number;
      currency: string;
    }>;
  }>;
  // Additional response fields
  status?: string;
  message?: string;
}

// UI state types
export interface CancellationEstimate {
  ticket_id: number;
  passenger_name?: string;
  original_price: number;
  retention_amount: number;
  refund_amount: number;
  cancellation_rate: number;
  currency: string;
  can_cancel_individual: boolean;
  baggage_refund?: number;
}

export interface CancellationResult {
  success: boolean;
  type: 'ticket' | 'order';
  ticket_id?: number;
  order_id?: number;
  total_refund: number;
  total_retained: number;
  currency: string;
  refund_method?: string;
  refund_timeline?: string;
  error_message?: string;
  details: Array<{
    ticket_id: number;
    passenger_name?: string;
    original_price: number;
    refund_amount: number;
    retained_amount: number;
    retention_amount: number; // Alias for retained_amount
    currency: string;
    baggage_refund?: number;
  }>;
  message?: string;
}

// Utility type for cancellation status
export type CancellationStatus = 
  | 'can_cancel' 
  | 'order_only' 
  | 'cannot_cancel' 
  | 'already_cancelled';
