// src/lib/paymentUtils.ts - Utilities for payment processing and timer management

import type { 
  BuyTicketResponse, 
  PassengerTicketInfo, 
  PaymentTimer, 
  PaymentSummary 
} from '@/types/buy';
import type { NewOrderResponse } from '@/types/newOrder';

/**
 * Calculate milliseconds until reservation expires
 */
export function msUntilReservationEnd(reservation_until: string): number {
  // reservation_until: "YYYY-MM-DD HH:mm:ss"
  // Assuming server time is UTC, adjust if needed
  const t = reservation_until.replace(" ", "T") + "Z";
  const end = new Date(t).getTime();
  return end - Date.now();
}

/**
 * Create timer object with remaining time breakdown
 */
export function createPaymentTimer(reservation_until: string): PaymentTimer {
  const msRemaining = msUntilReservationEnd(reservation_until);
  const isExpired = msRemaining <= 0;
  
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutesLeft = Math.floor(totalSeconds / 60);
  const secondsLeft = totalSeconds % 60;
  
  return {
    msRemaining: Math.max(0, msRemaining),
    isExpired,
    minutesLeft,
    secondsLeft
  };
}

/**
 * Extract passenger tickets from buy_ticket response
 */
export function extractPassengerTickets(resp: BuyTicketResponse): PassengerTicketInfo[] {
  const tickets: PassengerTicketInfo[] = [];
  
  for (const key of Object.keys(resp)) {
    if (!/^\d+$/.test(key)) continue; // doar cheile "0", "1", "2"...
    
    const passengerData = resp[key] as Record<string, unknown>;
    if (passengerData?.ticket_id && passengerData?.security) {
      tickets.push({
        passenger_id: Number(passengerData.passenger_id) || 0,
        transaction_id: String(passengerData.transaction_id || ''),
        ticket_id: String(passengerData.ticket_id),
        security: String(passengerData.security),
        price: Number(passengerData.price) || 0,
        currency: String(passengerData.currency || 'EUR'),
        link: String(passengerData.link || ''),
        baggage: passengerData.baggage as Array<{
          baggage_title: string;
          price: number;
          currency: string;
        }> || undefined
      });
    }
  }
  
  return tickets;
}

/**
 * Create payment summary comparing original and final prices
 */
export function createPaymentSummary(
  newOrderResp: NewOrderResponse,
  buyTicketResp: BuyTicketResponse
): PaymentSummary {
  const originalTotal = newOrderResp.price_total;
  const finalTotal = buyTicketResp.price_total;
  const currency = buyTicketResp.currency;
  
  const promocodeDiscount = newOrderResp.promocode_info?.price_promocode;
  const priceDifference = finalTotal - originalTotal;
  const hasPriceDifference = Math.abs(priceDifference) > 0.01; // tolerance for rounding
  
  return {
    originalTotal,
    finalTotal,
    currency,
    promocodeDiscount,
    hasPriceDifference,
    priceDifference
  };
}

/**
 * Format timer display string
 */
export function formatTimerDisplay(timer: PaymentTimer): string {
  if (timer.isExpired) {
    return "00:00";
  }
  
  const mins = String(timer.minutesLeft).padStart(2, '0');
  const secs = String(timer.secondsLeft).padStart(2, '0');
  return `${mins}:${secs}`;
}

/**
 * Get timer color class based on remaining time
 */
export function getTimerColorClass(timer: PaymentTimer): string {
  if (timer.isExpired) {
    return "text-red-600";
  }
  if (timer.minutesLeft < 5) {
    return "text-orange-600";
  }
  if (timer.minutesLeft < 10) {
    return "text-yellow-600";
  }
  return "text-green-600";
}

/**
 * Validate that payment can proceed
 */
export function canProceedWithPayment(reservation_until: string): {
  canProceed: boolean;
  reason?: string;
} {
  const timer = createPaymentTimer(reservation_until);
  
  if (timer.isExpired) {
    return {
      canProceed: false,
      reason: "Rezervarea a expirat. Vă rugăm să reîncepeți procesul de rezervare."
    };
  }
  
  if (timer.minutesLeft < 1) {
    return {
      canProceed: false,
      reason: "Timp insuficient pentru finalizarea plății. Vă rugăm să reîncepeți procesul."
    };
  }
  
  return { canProceed: true };
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format price difference with sign and color indication
 */
export function formatPriceDifference(difference: number, currency: string): {
  formatted: string;
  colorClass: string;
  isIncrease: boolean;
} {
  const isIncrease = difference > 0;
  const formatted = (isIncrease ? '+' : '') + formatPrice(difference, currency);
  const colorClass = isIncrease ? 'text-red-600' : 'text-green-600';
  
  return {
    formatted,
    colorClass,
    isIncrease
  };
}
