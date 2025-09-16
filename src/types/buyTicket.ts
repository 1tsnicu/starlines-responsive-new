// src/types/buyTicket.ts - Buy Ticket API Types

// ===============================
// Request Types
// ===============================

export interface BuyTicketRequest {
  login: string;
  password: string;
  order_id: number;
  lang?: string;
  v?: string;
}

// ===============================
// Response Types
// ===============================

export interface BuyTicketResponse {
  order_id: number;
  price_total: number;
  currency: string;
  link: string; // Link pentru print ticket
  [passengerIndex: string]: any; // Dynamic passenger data by index
}

export interface PassengerTicket {
  passenger_id: number;
  transaction_id: string;
  ticket_id: string;
  security: string;
  price: number;
  currency: string;
  link: string; // Link individual pentru fiecare bilet
  baggage?: BaggageTicket[];
}

export interface BaggageTicket {
  baggage_id: string;
  baggage_type_id: string;
  baggage_type: string;
  baggage_type_abbreviated: string;
  baggage_title: string;
  length: string;
  width: string;
  height: string;
  kg: string;
  price: number;
  currency: string;
  baggage_ticket_id: number;
}

// ===============================
// UI State Types
// ===============================

export interface PaymentState {
  orderId: number;
  security: string;
  reservationUntil: string;
  reservationUntilMin: number;
  priceTotal: number;
  currency: string;
  status: 'reserved' | 'paid' | 'expired' | 'cancelled';
  timeRemaining: number; // seconds
}

export interface TicketPurchaseResult {
  success: boolean;
  orderId: number;
  priceTotal: number;
  currency: string;
  tickets: PassengerTicket[];
  printUrl: string;
  error?: string;
}

// ===============================
// Timer Types
// ===============================

export interface PaymentTimer {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export interface TimerCallbacks {
  onUpdate?: (timer: PaymentTimer) => void;
  onExpired?: () => void;
  onWarning?: (minutesLeft: number) => void; // Called at 5, 2, 1 minute warnings
}

// ===============================
// Payment Flow Types
// ===============================

export interface PaymentFlowProps {
  reservation: {
    orderId: number;
    security: string;
    reservationUntil: string;
    reservationUntilMin: number;
    priceTotal: number;
    currency: string;
  };
  onPaymentComplete: (result: TicketPurchaseResult) => void;
  onCancel: () => void;
}

export interface PaymentSuccessProps {
  result: TicketPurchaseResult;
  onContinue: () => void;
}

// ===============================
// Error Types
// ===============================

export interface BuyTicketError {
  error: string;
  detal?: string;
}

export type BuyTicketErrorType = 
  | 'dealer_no_activ'
  | 'order_no_found'
  | 'order_no_activ'
  | 'order_expired'
  | 'payment_failed'
  | 'insufficient_funds'
  | 'buy_ticket'; // Generic error
