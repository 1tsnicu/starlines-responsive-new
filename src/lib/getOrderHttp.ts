// Get Order HTTP client for Bussystem get_order endpoint
// Retrieves complete order information after reservation or purchase

import { apiPost, logApiRequest } from './http';
import type {
  GetOrderRequest,
  GetOrderResponse,
  GetOrderOptions,
  OrderInfo,
  OrderStatusInfo,
  OrderSummary,
  GetOrderErrorCode
} from '../types/getOrder';

import { GET_ORDER_ERRORS } from '../types/getOrder';

const GET_ORDER_ENDPOINT = '/curl/get_order.php';

// Cache for order information (short-term caching)
const orderCache = new Map<string, { data: OrderInfo; timestamp: number }>();
const ORDER_CACHE_TTL = 30 * 1000; // 30 seconds cache

/**
 * Create cache key for order
 */
function createOrderCacheKey(orderId: number, security?: string): string {
  return `order_${orderId}_${security || 'no_security'}`;
}

/**
 * Get cached order if available and not expired
 */
function getCachedOrder(orderId: number, security?: string): OrderInfo | null {
  const key = createOrderCacheKey(orderId, security);
  const cached = orderCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ORDER_CACHE_TTL) {
    return cached.data;
  }
  
  // Remove expired cache
  if (cached) {
    orderCache.delete(key);
  }
  
  return null;
}

/**
 * Cache order information
 */
function cacheOrder(orderId: number, orderInfo: OrderInfo, security?: string): void {
  const key = createOrderCacheKey(orderId, security);
  orderCache.set(key, {
    data: orderInfo,
    timestamp: Date.now()
  });
}

/**
 * Clear order cache for specific order
 */
export function clearOrderCache(orderId: number, security?: string): void {
  const key = createOrderCacheKey(orderId, security);
  orderCache.delete(key);
}

/**
 * Clear all order cache
 */
export function clearAllOrderCache(): void {
  orderCache.clear();
}

/**
 * Get complete order information
 */
export async function getOrderInfo(
  orderId: number,
  security?: string,
  options: GetOrderOptions = {}
): Promise<GetOrderResponse> {
  const {
    timeout = 30000,
    retries = 2,
    includePaymentMethods = true,
    includeBaggage = true,
    includeRefunds = true
  } = options;

  // Check cache first (unless this is a forced refresh)
  const cached = getCachedOrder(orderId, security);
  if (cached) {
    return {
      success: true,
      data: cached
    };
  }

  try {
    const credentials = {
      login: import.meta.env.VITE_BUSSYSTEM_LOGIN || 'test_login',
      password: import.meta.env.VITE_BUSSYSTEM_PASSWORD || 'test_password'
    };

    const request: GetOrderRequest = {
      ...credentials,
      order_id: orderId,
      security,
      lang: 'en'
    };
    
    const requestData = { ...request } as Record<string, unknown>;
    
    logApiRequest(GET_ORDER_ENDPOINT, requestData);

    const response = await apiPost<OrderInfo>(
      GET_ORDER_ENDPOINT,
      requestData,
      { timeout, retries, forceJson: true }
    );

    // Cache successful response
    if (response) {
      cacheOrder(orderId, response, security);
    }

    return {
      success: true,
      data: response
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get order information';
    
    // Map specific errors
    let errorCode: GetOrderErrorCode = GET_ORDER_ERRORS.UNKNOWN_ERROR;
    
    if (errorMessage.includes('dealer_no_activ')) {
      errorCode = GET_ORDER_ERRORS.DEALER_NO_ACTIV;
    } else if (errorMessage.includes('no_found')) {
      errorCode = GET_ORDER_ERRORS.NO_FOUND;
    } else if (errorMessage.includes('invalid_security') || errorMessage.includes('access_denied')) {
      errorCode = GET_ORDER_ERRORS.ACCESS_DENIED;
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorCode = GET_ORDER_ERRORS.NETWORK_ERROR;
    } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
      errorCode = GET_ORDER_ERRORS.PARSE_ERROR;
    }

    // Create request data for logging
    const requestData = {
      order_id: orderId,
      security,
      lang: 'en'
    } as Record<string, unknown>;

    logApiRequest(GET_ORDER_ENDPOINT, requestData, undefined, error instanceof Error ? error : new Error(errorMessage));    return {
      success: false,
      error: {
        error: errorMessage,
        code: errorCode
      }
    };
  }
}

/**
 * Get order status information
 */
export function getOrderStatusInfo(orderInfo: OrderInfo): OrderStatusInfo {
  const status = orderInfo.status;
  
  return {
    isReserved: ['reserve', 'reserve_ok', 'confirmation'].includes(status),
    isPaid: status === 'buy',
    isCancelled: status === 'cancel',
    isConfirmed: ['reserve_ok', 'buy'].includes(status),
    needsPayment: ['reserve', 'reserve_ok', 'confirmation'].includes(status) && !!orderInfo.url,
    canCancel: ['reserve', 'reserve_ok', 'confirmation'].includes(status),
    canModify: ['reserve', 'reserve_ok'].includes(status)
  };
}

/**
 * Get order summary information
 */
export function getOrderSummary(orderInfo: OrderInfo): OrderSummary {
  const passengerCount = orderInfo.routes.route.reduce((total, route) => {
    return total + route.passengers.passenger.length;
  }, 0);
  
  const routeCount = orderInfo.routes.route.length;
  
  const ticketCount = orderInfo.routes.route.reduce((total, route) => {
    return total + route.passengers.passenger.reduce((tickets, passenger) => {
      return tickets + passenger.ticket.length;
    }, 0);
  }, 0);

  return {
    orderId: orderInfo.order_id,
    status: orderInfo.status,
    totalPrice: orderInfo.price,
    currency: orderInfo.currency,
    passengerCount,
    routeCount,
    ticketCount,
    paymentUrl: orderInfo.url,
    expiresAt: orderInfo.expires_at ? new Date(orderInfo.expires_at) : undefined
  };
}

/**
 * Check if order needs payment
 */
export function orderNeedsPayment(orderInfo: OrderInfo): boolean {
  const statusInfo = getOrderStatusInfo(orderInfo);
  return statusInfo.needsPayment;
}

/**
 * Get payment URL if available
 */
export function getOrderPaymentUrl(orderInfo: OrderInfo): string | null {
  return orderNeedsPayment(orderInfo) ? orderInfo.url || null : null;
}

/**
 * Get all tickets from order
 */
export function getAllTicketsFromOrder(orderInfo: OrderInfo) {
  const tickets: Array<{
    ticketId: string;
    status: string;
    passengerName: string;
    routeName: string;
    seat: string;
    price?: number;
  }> = [];

  orderInfo.routes.route.forEach(route => {
    route.passengers.passenger.forEach(passenger => {
      passenger.ticket.forEach(ticket => {
        tickets.push({
          ticketId: ticket.ticket_id,
          status: ticket.ticket_status,
          passengerName: `${passenger.client_name} ${passenger.client_surname}`,
          routeName: route.route_name,
          seat: passenger.seat,
          price: ticket.price
        });
      });
    });
  });

  return tickets;
}

/**
 * Get total baggage cost from order
 */
export function getTotalBaggageCost(orderInfo: OrderInfo): { total: number; currency: string } {
  let total = 0;
  const currency = orderInfo.currency;

  if (orderInfo.baggage) {
    total = orderInfo.baggage.reduce((sum, baggage) => sum + baggage.price, 0);
  }

  // Also check route-specific baggage
  orderInfo.routes.route.forEach(route => {
    route.passengers.passenger.forEach(passenger => {
      passenger.ticket.forEach(ticket => {
        if (ticket.baggage) {
          total += ticket.baggage.reduce((sum, baggage) => sum + baggage.price, 0);
        }
      });
    });
  });

  return { total, currency };
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(orderInfo: OrderInfo): boolean {
  const statusInfo = getOrderStatusInfo(orderInfo);
  
  // Check if order is in cancellable state
  if (!statusInfo.canCancel) {
    return false;
  }

  // Check if order hasn't expired
  if (orderInfo.expires_at) {
    const expiresAt = new Date(orderInfo.expires_at);
    if (Date.now() > expiresAt.getTime()) {
      return false;
    }
  }

  return true;
}

/**
 * Check if order can be modified
 */
export function canModifyOrder(orderInfo: OrderInfo): boolean {
  const statusInfo = getOrderStatusInfo(orderInfo);
  
  // Check if order is in modifiable state
  if (!statusInfo.canModify) {
    return false;
  }

  // Check if order hasn't expired
  if (orderInfo.expires_at) {
    const expiresAt = new Date(orderInfo.expires_at);
    if (Date.now() > expiresAt.getTime()) {
      return false;
    }
  }

  return true;
}

/**
 * Refresh order information (bypass cache)
 */
export async function refreshOrderInfo(
  orderId: number,
  security?: string,
  options: GetOrderOptions = {}
): Promise<GetOrderResponse> {
  // Clear cache first
  clearOrderCache(orderId, security);
  
  // Fetch fresh data
  return getOrderInfo(orderId, security, options);
}

/**
 * Monitor order status changes
 */
export async function monitorOrderStatus(
  orderId: number,
  security: string,
  onStatusChange: (orderInfo: OrderInfo) => void,
  intervalMs: number = 30000
): Promise<() => void> {
  let lastStatus: string | null = null;
  let isMonitoring = true;

  const checkStatus = async () => {
    if (!isMonitoring) return;

    try {
      const response = await refreshOrderInfo(orderId, security);
      
      if (response.success && response.data) {
        if (lastStatus && lastStatus !== response.data.status) {
          onStatusChange(response.data);
        }
        lastStatus = response.data.status;
      }
    } catch (error) {
      console.error('Error monitoring order status:', error);
    }

    if (isMonitoring) {
      setTimeout(checkStatus, intervalMs);
    }
  };

  // Start monitoring
  checkStatus();

  // Return stop function
  return () => {
    isMonitoring = false;
  };
}
