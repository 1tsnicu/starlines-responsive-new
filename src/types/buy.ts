// src/types/buy.ts - Type definitions for buy_ticket payment system

export interface BuyTicketRequest {
  order_id: number;
  lang?: string; // "ru", "ro", etc.
  v?: string;    // API version "1.1"
}

export interface PassengerTicketInfo {
  passenger_id: number;
  transaction_id: string;
  ticket_id: string;
  security: string;
  price: number;
  currency: string;
  link: string; // link de print pentru acest bilet
  baggage?: Array<{
    baggage_title: string;
    price: number;
    currency: string;
  }>;
}

export interface BuyTicketResponse {
  order_id: number;
  price_total: number;
  currency: string;
  link: string; // link de print pentru toată comanda
  [k: string]: unknown; // "0", "1", "2", ... fiecare pasaj cu detalii
}

// Utility types for UI components
export interface PaymentTimer {
  msRemaining: number;
  isExpired: boolean;
  minutesLeft: number;
  secondsLeft: number;
}

export interface PaymentSummary {
  originalTotal: number;
  finalTotal: number;
  currency: string;
  promocodeDiscount?: number;
  hasPriceDifference: boolean;
  priceDifference: number;
}

export interface TicketPurchaseResult {
  success: boolean;
  order_id: number;
  price_total: number;
  currency: string;
  allTicketsLink: string;
  passengerTickets: PassengerTicketInfo[];
  summary: PaymentSummary;
  rawResponse: Record<string, unknown>;
}
