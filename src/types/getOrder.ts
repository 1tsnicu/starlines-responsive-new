// Order retrieval types for Bussystem get_order API
// Used to fetch complete order information after reservation or purchase

// Request interface for get_order endpoint
export interface GetOrderRequest {
  login: string;
  password: string;
  order_id: number;
  security?: string;  // Optional for dealers, required for agents/clients
  lang?: string;
}

// Order status types
export type OrderStatus = 
  | 'reserve'        // Initial reservation
  | 'reserve_ok'     // Confirmed reservation
  | 'confirmation'   // Awaiting confirmation
  | 'buy'           // Purchased/paid
  | 'cancel';       // Cancelled

// Ticket status types
export type TicketStatus = 
  | 'reserve'
  | 'buy'
  | 'cancel'
  | 'refund'
  | 'pending';

// Payment system types
export interface PaymentSystem {
  system_name: string;
  system_title: string;
  fee?: number;
  fee_percent?: number;
  min_amount?: number;
  max_amount?: number;
  currency: string;
  description?: string;
}

// Promocode information
export interface PromocodeInfo {
  promocode?: string;
  discount_amount?: number;
  discount_percent?: number;
  description?: string;
  applied: boolean;
}

// Bonus points information
export interface BonusInfo {
  points_earned?: number;
  points_used?: number;
  points_balance?: number;
  currency_equivalent?: number;
}

// Dealer/Agent information
export interface DealerInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

// Baggage information
export interface BaggageInfo {
  baggage_id: string;
  baggage_type: string;
  baggage_name: string;
  price: number;
  currency: string;
  passenger_id?: string;
  route_id?: string;
}

// Ticket information
export interface TicketInfo {
  ticket_id: string;
  ticket_status: TicketStatus;
  price?: number;
  currency?: string;
  seat_number?: string;
  baggage?: BaggageInfo[];
}

// Passenger information
export interface PassengerInfo {
  passenger_id?: string;
  client_name: string;
  client_surname: string;
  client_phone?: string;
  client_email?: string;
  client_birth_date?: string;
  client_document?: string;
  client_document_type?: string;
  seat: string;
  ticket: TicketInfo[];
}

// Route information
export interface RouteInfo {
  route_id: string;
  route_name: string;
  route_number?: string;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  station_from: string;
  station_to: string;
  station_from_id?: string;
  station_to_id?: string;
  bus_number?: string;
  driver_name?: string;
  driver_phone?: string;
  passengers: {
    passenger: PassengerInfo[];
  };
}

// Pending refund information
export interface PendingRefund {
  ticket_id: string;
  refund_amount: number;
  currency: string;
  refund_reason?: string;
  refund_status: string;
  requested_at: string;
  processed_at?: string;
}

// Complete order information
export interface OrderInfo {
  order_id: string;
  security: string;
  status: OrderStatus;
  price: number;
  currency: string;
  url?: string;  // Payment URL if not paid
  
  // Optional information
  promocode_info?: PromocodeInfo;
  bonus?: BonusInfo;
  dealer?: DealerInfo;
  agent?: DealerInfo;
  inspector?: DealerInfo;
  
  // Routes and passengers
  routes: {
    route: RouteInfo[];
  };
  
  // Passengers summary (alternative structure)
  passengers?: {
    passenger: PassengerInfo[];
  };
  
  // Baggage information
  baggage?: BaggageInfo[];
  
  // Payment information
  pay_method?: {
    system: PaymentSystem[];
  };
  pay_transaction?: string;
  
  // Refunds
  pending_refunds?: PendingRefund[];
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

// API response for get_order
export interface GetOrderResponse {
  success: boolean;
  data?: OrderInfo;
  error?: {
    error: string;
    code: string;
    details?: string;
  };
}

// Options for get_order API call
export interface GetOrderOptions {
  timeout?: number;
  retries?: number;
  includePaymentMethods?: boolean;
  includeBaggage?: boolean;
  includeRefunds?: boolean;
}

// Error codes for get_order API
export const GET_ORDER_ERRORS = {
  DEALER_NO_ACTIV: 'dealer_no_activ',
  NO_FOUND: 'no_found',
  INVALID_SECURITY: 'invalid_security',
  ACCESS_DENIED: 'access_denied',
  NETWORK_ERROR: 'network_error',
  PARSE_ERROR: 'parse_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;

export type GetOrderErrorCode = typeof GET_ORDER_ERRORS[keyof typeof GET_ORDER_ERRORS];

// Error messages for user display
export const GET_ORDER_ERROR_MESSAGES = {
  [GET_ORDER_ERRORS.DEALER_NO_ACTIV]: 'Invalid login credentials or inactive dealer account',
  [GET_ORDER_ERRORS.NO_FOUND]: 'Order not found or invalid order ID',
  [GET_ORDER_ERRORS.INVALID_SECURITY]: 'Invalid security code for this order',
  [GET_ORDER_ERRORS.ACCESS_DENIED]: 'Access denied to this order',
  [GET_ORDER_ERRORS.NETWORK_ERROR]: 'Network connection failed',
  [GET_ORDER_ERRORS.PARSE_ERROR]: 'Failed to parse server response',
  [GET_ORDER_ERRORS.UNKNOWN_ERROR]: 'An unexpected error occurred'
} as const;

// Helper types for order status checking
export interface OrderStatusInfo {
  isReserved: boolean;
  isPaid: boolean;
  isCancelled: boolean;
  isConfirmed: boolean;
  needsPayment: boolean;
  canCancel: boolean;
  canModify: boolean;
}

// Utility type for order summary
export interface OrderSummary {
  orderId: string;
  status: OrderStatus;
  totalPrice: number;
  currency: string;
  passengerCount: number;
  routeCount: number;
  ticketCount: number;
  paymentUrl?: string;
  expiresAt?: Date;
}
