/**
 * API functions for ticket cancellation
 */

import { 
  CancelTicketRequest, 
  CancelTicketResponse, 
  CancelTicketResult, 
  CancelTicketErrorCode,
  CancelTicketOptions,
  PaymentStatus,
  CancellationRules
} from '@/types/cancelTicket';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/backend';

/**
 * Cancel entire order (all tickets)
 */
export async function cancelOrder(orderId: number, lang: 'en' | 'ru' | 'ua' | 'de' | 'pl' | 'cz' = 'en'): Promise<CancelTicketResult> {
  try {
    const request: CancelTicketRequest = {
      order_id: orderId,
      lang: lang
    };

    console.log('Cancelling order:', orderId);
    
    const response = await fetch(`${API_BASE_URL}/curl/cancel_ticket.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check for API errors
    if (data.error) {
      return {
        success: false,
        error: { error: data.error, detal: data.detal },
        errorCode: mapErrorCode(data.error)
      };
    }

    return {
      success: true,
      data: data as CancelTicketResponse
    };

  } catch (error) {
    console.error('Cancel order API error:', error);
    return {
      success: false,
      error: { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      errorCode: 'unknown'
    };
  }
}

/**
 * Cancel specific ticket
 */
export async function cancelTicket(ticketId: number, lang: 'en' | 'ru' | 'ua' | 'de' | 'pl' | 'cz' = 'en'): Promise<CancelTicketResult> {
  try {
    const request: CancelTicketRequest = {
      ticket_id: ticketId,
      lang: lang
    };

    console.log('Cancelling ticket:', ticketId);
    
    const response = await fetch(`${API_BASE_URL}/curl/cancel_ticket.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check for API errors
    if (data.error) {
      return {
        success: false,
        error: { error: data.error, detal: data.detal },
        errorCode: mapErrorCode(data.error)
      };
    }

    return {
      success: true,
      data: data as CancelTicketResponse
    };

  } catch (error) {
    console.error('Cancel ticket API error:', error);
    return {
      success: false,
      error: { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      errorCode: 'unknown'
    };
  }
}

/**
 * Cancel ticket with options
 */
export async function cancelTicketWithOptions(options: CancelTicketOptions): Promise<CancelTicketResult> {
  if (options.orderId) {
    return cancelOrder(options.orderId, options.lang);
  } else if (options.ticketId) {
    return cancelTicket(options.ticketId, options.lang);
  } else {
    return {
      success: false,
      error: { error: 'Either orderId or ticketId must be provided' },
      errorCode: 'unknown'
    };
  }
}

/**
 * Map API error codes to our error types
 */
function mapErrorCode(apiError: string): CancelTicketErrorCode {
  const error = apiError.toLowerCase();
  
  if (error.includes('dealer_no_activ')) return 'dealer_no_activ';
  if (error.includes('cancel_order')) return 'cancel_order';
  if (error.includes('cancel')) return 'cancel';
  if (error.includes('rate_100')) return 'rate_100';
  if (error.includes('ticket_id')) return 'ticket_id';
  
  return 'unknown';
}

/**
 * Get user-friendly error message
 */
export function getCancelErrorMessage(errorCode: CancelTicketErrorCode, originalError?: string): string {
  switch (errorCode) {
    case 'dealer_no_activ':
      return 'Service temporarily unavailable. Please contact support to activate your account.';
    case 'cancel_order':
      return 'Unable to cancel order. Please try again or contact support.';
    case 'cancel':
      return 'System error occurred during cancellation. Please try again later.';
    case 'rate_100':
      return 'This ticket cannot be cancelled as it is too close to departure time.';
    case 'ticket_id':
      return 'Invalid ticket ID. Please check your ticket details.';
    default:
      return originalError || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if cancellation is possible based on response
 */
export function canCancelTicket(response: CancelTicketResponse): boolean {
  // Check if any item has rate_100 error
  for (const key in response) {
    if (key !== 'order_id' && key !== 'cancel_order' && key !== 'price_total' && 
        key !== 'money_back_total' && key !== 'currency') {
      const item = response[key];
      if (item && typeof item === 'object' && 'error' in item) {
        if (item.error === 'rate_100') {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Calculate total refund amount
 */
export function calculateTotalRefund(response: CancelTicketResponse): number {
  return response.money_back_total || 0;
}

/**
 * Format refund amount for display
 */
export function formatRefundAmount(amount: number, currency: string = 'EUR'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Check if order is paid based on booking response
 */
export function checkPaymentStatus(bookingResponse: any): PaymentStatus {
  // Check if order is paid by looking at status and payment indicators
  const isPaid = bookingResponse.status === 'buy_ok' || 
                 bookingResponse.status === 'paid' ||
                 (bookingResponse.payment_status && bookingResponse.payment_status === 'paid');
  
  // For now, allow cancellation of both paid and unpaid orders
  // In real implementation, you might want to check specific payment indicators
  const canCancel = true; // This should be determined by business rules
  
  return {
    isPaid,
    canCancel,
    reason: canCancel ? undefined : 'Cancellation not allowed for this order type'
  };
}

/**
 * Get cancellation rules based on booking response and current time
 */
export function getCancellationRules(bookingResponse: any): CancellationRules {
  const paymentStatus = checkPaymentStatus(bookingResponse);
  
  if (!paymentStatus.canCancel) {
    return {
      freeCancellationMinutes: 0,
      cancellationRate: 100,
      hoursBeforeDeparture: 0,
      canCancel: false,
      reason: paymentStatus.reason
    };
  }
  
  // For unpaid orders (reservations), cancellation is usually free
  if (!paymentStatus.isPaid) {
    return {
      freeCancellationMinutes: 30, // Default 30 minutes for reservations
      cancellationRate: 0,
      hoursBeforeDeparture: 24, // Can cancel up to 24 hours before
      canCancel: true
    };
  }
  
  // For paid orders, check cancellation rules
  // In real implementation, get these from get_routes or get_ticket response
  const freeCancellationMinutes = bookingResponse.cancel_free_min || 0;
  const cancellationRate = bookingResponse.cancel_rate || 0;
  
  // Calculate hours before departure
  const departureTime = new Date(bookingResponse.departure_time || bookingResponse.date_from);
  const now = new Date();
  const hoursBeforeDeparture = Math.max(0, (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  // Determine if cancellation is allowed
  const canCancel = cancellationRate < 100 && hoursBeforeDeparture > 0;
  
  return {
    freeCancellationMinutes,
    cancellationRate,
    hoursBeforeDeparture,
    canCancel,
    reason: !canCancel ? 
      (cancellationRate >= 100 ? 'Cancellation not allowed (100% rate)' : 
       'Too close to departure time') : undefined
  };
}

/**
 * Get cancellation summary
 */
export function getCancellationSummary(response: CancelTicketResponse): {
  totalRefund: number;
  currency: string;
  cancelledTickets: number;
  cancelledOrder: boolean;
  isPaidOrder: boolean;
  refundDetails: Array<{
    transactionId: string;
    ticketId?: string;
    refundAmount: number;
    hoursAfterBuy?: number;
    hoursBeforeDeparture?: number;
    rate?: number;
  }>;
} {
  const totalRefund = calculateTotalRefund(response);
  const currency = response.currency || 'EUR';
  const cancelledOrder = response.cancel_order === '1';
  
  let cancelledTickets = 0;
  const refundDetails: Array<{
    transactionId: string;
    ticketId?: string;
    refundAmount: number;
    hoursAfterBuy?: number;
    hoursBeforeDeparture?: number;
    rate?: number;
  }> = [];
  
  // Check if this is a paid order by looking at response structure
  const isPaidOrder = response['0'] && response['0'].ticket_id !== null;
  
  for (const key in response) {
    if (key !== 'order_id' && key !== 'cancel_order' && key !== 'price_total' && 
        key !== 'money_back_total' && key !== 'currency' && key !== 'log_id') {
      const item = response[key];
      if (item && typeof item === 'object') {
        if (item.cancel_ticket === '1' || item.cancel_ticket === 1) {
          cancelledTickets++;
          refundDetails.push({
            transactionId: item.transaction_id,
            ticketId: item.ticket_id,
            refundAmount: item.money_back || 0,
            hoursAfterBuy: item.hours_after_buy,
            hoursBeforeDeparture: item.hours_before_depar,
            rate: item.rate
          });
        }
      }
    }
  }

  return {
    totalRefund,
    currency,
    cancelledTickets,
    cancelledOrder,
    isPaidOrder,
    refundDetails
  };
}
