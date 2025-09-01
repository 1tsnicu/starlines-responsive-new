// Cancellation API client for Bussystem integration
// Handles get_ticket and cancel_ticket endpoints

import type {
  GetTicketRequest,
  GetTicketResponse,
  CancelTicketRequest,
  CancelTicketResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  TicketCancellationInfo,
  OrderCancellationInfo,
  CancellationEstimate,
  CancellationResult
} from '../types/cancellation';

class CancellationAPI {
  private baseUrl: string;
  private credentials: { login: string; password: string };

  constructor(baseUrl: string = 'https://test-api.bussystem.eu', credentials?: { login: string; password: string }) {
    this.baseUrl = baseUrl;
    this.credentials = credentials || { login: 'demo_login', password: 'demo_password' };
  }

  /**
   * Get ticket information including cancellation details
   */
  async getTicket(params: Omit<GetTicketRequest, 'login' | 'password'>): Promise<GetTicketResponse> {
    const payload: GetTicketRequest = {
      login: this.credentials.login,
      password: this.credentials.password,
      lang: 'ro',
      v: '1.1',
      ...params
    };

    const response = await fetch(`${this.baseUrl}/server/curl/get_ticket.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  /**
   * Cancel a single ticket
   */
  async cancelTicket(params: Omit<CancelTicketRequest, 'login' | 'password'>): Promise<CancelTicketResponse> {
    const payload: CancelTicketRequest = {
      login: this.credentials.login,
      password: this.credentials.password,
      lang: 'ro',
      v: '1.1',
      ...params
    };

    const response = await fetch(`${this.baseUrl}/server/curl/cancel_ticket.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      ...data
    };
  }

  /**
   * Cancel entire order
   */
  async cancelOrder(params: Omit<CancelOrderRequest, 'login' | 'password'>): Promise<CancelOrderResponse> {
    const payload: CancelOrderRequest = {
      login: this.credentials.login,
      password: this.credentials.password,
      lang: 'ro',
      v: '1.1',
      ...params
    };

    const response = await fetch(`${this.baseUrl}/server/curl/cancel_ticket.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Process tickets from numeric keys "0", "1", "2", etc.
    const tickets: CancelOrderResponse['tickets'] = {};
    for (const key of Object.keys(data)) {
      if (/^\d+$/.test(key)) {
        tickets[key] = data[key];
      }
    }

    return {
      success: true,
      tickets,
      ...data
    };
  }

  /**
   * Get cancellation estimate for a ticket
   */
  async getCancellationEstimate(ticketId: number, security?: number): Promise<CancellationEstimate> {
    const ticketInfo = await this.getTicket({ ticket_id: ticketId, security });

    return {
      ticket_id: ticketId,
      passenger_name: ticketInfo.passenger_info 
        ? `${ticketInfo.passenger_info.first_name} ${ticketInfo.passenger_info.last_name}`
        : undefined,
      original_price: ticketInfo.price,
      retention_amount: ticketInfo.money_noback_if_cancel,
      refund_amount: ticketInfo.money_back_if_cancel,
      cancellation_rate: ticketInfo.cancel_rate,
      currency: ticketInfo.currency,
      can_cancel_individual: ticketInfo.cancel_only_order !== 1,
      baggage_refund: ticketInfo.baggage?.reduce((sum, item) => sum + item.price, 0)
    };
  }

  /**
   * Get cancellation estimates for all tickets in an order
   */
  async getOrderCancellationEstimate(orderTickets: Array<{
    ticket_id: number;
    security?: number;
    passenger_name?: string;
  }>): Promise<CancellationEstimate[]> {
    const estimates: CancellationEstimate[] = [];

    for (const ticket of orderTickets) {
      try {
        const estimate = await this.getCancellationEstimate(ticket.ticket_id, ticket.security);
        if (ticket.passenger_name) {
          estimate.passenger_name = ticket.passenger_name;
        }
        estimates.push(estimate);
      } catch (error) {
        console.error(`Failed to get estimate for ticket ${ticket.ticket_id}:`, error);
        // Continue with other tickets
      }
    }

    return estimates;
  }

  /**
   * Process cancellation result for UI display
   */
  processCancellationResult(response: CancelTicketResponse | CancelOrderResponse, type: 'ticket' | 'order'): CancellationResult {
    if (type === 'ticket') {
      const ticketResponse = response as CancelTicketResponse;
      const baggageRefund = ticketResponse.baggage?.reduce((sum, item) => sum + item.price_back, 0) || 0;
      
      return {
        success: ticketResponse.success,
        type: 'ticket',
        ticket_id: ticketResponse.ticket_id,
        total_refund: ticketResponse.money_back + baggageRefund,
        total_retained: ticketResponse.price,
        currency: ticketResponse.currency,
        refund_method: 'Card bancar (original)',
        refund_timeline: '3-5 zile lucrătoare',
        error_message: !ticketResponse.success ? ticketResponse.message : undefined,
        details: [{
          ticket_id: ticketResponse.ticket_id,
          passenger_name: undefined, // Will be filled by component
          original_price: ticketResponse.price + ticketResponse.money_back,
          refund_amount: ticketResponse.money_back,
          retained_amount: ticketResponse.price,
          retention_amount: ticketResponse.price, // Alias
          currency: ticketResponse.currency,
          baggage_refund: baggageRefund > 0 ? baggageRefund : undefined
        }],
        message: ticketResponse.message
      };
    } else {
      const orderResponse = response as CancelOrderResponse;
      const details = Object.values(orderResponse.tickets).map(ticket => {
        const baggageRefund = ticket.baggage?.reduce((sum, item) => sum + item.price_back, 0) || 0;
        return {
          ticket_id: ticket.ticket_id,
          passenger_name: undefined, // Will be filled by component
          original_price: ticket.price + ticket.money_back,
          refund_amount: ticket.money_back,
          retained_amount: ticket.price,
          retention_amount: ticket.price, // Alias
          currency: orderResponse.currency,
          baggage_refund: baggageRefund > 0 ? baggageRefund : undefined
        };
      });

      const totalBaggageRefund = details.reduce((sum, detail) => sum + (detail.baggage_refund || 0), 0);

      return {
        success: orderResponse.success,
        type: 'order',
        order_id: orderResponse.order_id,
        total_refund: orderResponse.money_back_total + totalBaggageRefund,
        total_retained: orderResponse.price_total,
        currency: orderResponse.currency,
        refund_method: 'Card bancar (original)',
        refund_timeline: '3-5 zile lucrătoare',
        error_message: !orderResponse.success ? orderResponse.message : undefined,
        details,
        message: orderResponse.message
      };
    }
  }
}

// Create singleton instance
export const cancellationAPI = new CancellationAPI();

// Export class for custom instances
export { CancellationAPI };

// Helper functions
export function calculateTotalRefund(estimates: CancellationEstimate[]): {
  total_refund: number;
  total_retained: number;
  currency: string;
} {
  const currency = estimates[0]?.currency || 'EUR';
  
  return {
    total_refund: estimates.reduce((sum, est) => sum + est.refund_amount + (est.baggage_refund || 0), 0),
    total_retained: estimates.reduce((sum, est) => sum + est.retention_amount, 0),
    currency
  };
}

export function canCancelIndividualTickets(estimates: CancellationEstimate[]): boolean {
  return estimates.every(est => est.can_cancel_individual);
}

export function formatRefundAmount(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}
