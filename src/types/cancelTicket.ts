/**
 * Types for ticket cancellation functionality
 */

export interface CancelTicketRequest {
  order_id?: number;
  ticket_id?: number;
  lang?: 'en' | 'ru' | 'ua' | 'de' | 'pl' | 'cz';
}

export interface CancelTicketResponse {
  order_id?: number;
  cancel_order?: '0' | '1';
  price_total?: number;
  money_back_total?: number;
  currency?: string;
  log_id?: number;
  [key: string]: any; // For dynamic item keys (0, 1, 2, etc.)
}

export interface CancelTicketItem {
  transaction_id: string;
  ticket_id?: string | null;
  cancel_ticket?: '0' | '1' | null;
  price?: number | null;
  money_back?: number;
  provision?: number;
  currency?: string | null;
  hours_after_buy?: number | null;
  hours_before_depar?: number | null;
  rate?: number | null;
  baggage?: CancelBaggageItem[];
  error?: string;
}

export interface CancelBaggageItem {
  baggage_ticket_id: string;
  baggage_busowner_id: string;
  baggage_status: 'reserve' | 'buy' | 'cancel';
  baggage_type: string;
  baggage_title: string;
  length: string;
  width: string;
  height: string;
  kg: string;
  price: string;
  price_back: string;
  currency: string;
  reg_status: 'no_registered' | 'registered' | 'unregistered' | 'delivered';
}

export interface CancelTicketError {
  error: string;
  detal?: string;
}

export type CancelTicketErrorCode = 
  | 'dealer_no_activ'
  | 'cancel_order'
  | 'cancel'
  | 'rate_100'
  | 'ticket_id'
  | 'unknown';

export interface CancelTicketResult {
  success: boolean;
  data?: CancelTicketResponse;
  error?: CancelTicketError;
  errorCode?: CancelTicketErrorCode;
}

export interface CancelTicketOptions {
  orderId?: number;
  ticketId?: number;
  lang?: 'en' | 'ru' | 'ua' | 'de' | 'pl' | 'cz';
}

export interface CancelTicketUIProps {
  bookingResponse: any; // BookingResponse from tripDetail.ts
  onCancelSuccess?: (result: CancelTicketResult) => void;
  onCancelError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showConfirmation?: boolean;
}

export interface PaymentStatus {
  isPaid: boolean;
  canCancel: boolean;
  cancelFreeMin?: number; // Minutes for free cancellation
  cancelRate?: number; // Cancellation rate (0-100)
  hoursBeforeDeparture?: number;
  reason?: string; // Why cancellation is not allowed
}

export interface CancellationRules {
  freeCancellationMinutes: number;
  cancellationRate: number;
  hoursBeforeDeparture: number;
  canCancel: boolean;
  reason?: string;
}
