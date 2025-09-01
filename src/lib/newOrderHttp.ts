// HTTP client for new_order API with XML parsing and error handling
// Handles order creation requests with proper validation and normalization

import type { 
  NewOrderPayload, 
  NewOrderResponse, 
  ReservationInfo,
  OrderCreationResult 
} from '@/types/newOrder';

const NEW_ORDER_ENDPOINT = '/curl/new_order.php';

// Rate limiting configuration
const RATE_LIMIT = {
  max_requests: 10,
  window_ms: 60000, // 1 minute
  requests: new Map<string, number[]>()
};

/**
 * Rate limiting check
 */
function checkRateLimit(clientId: string = 'default'): boolean {
  const now = Date.now();
  const requests = RATE_LIMIT.requests.get(clientId) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < RATE_LIMIT.window_ms);
  
  if (validRequests.length >= RATE_LIMIT.max_requests) {
    return false;
  }
  
  // Add current request
  validRequests.push(now);
  RATE_LIMIT.requests.set(clientId, validRequests);
  
  return true;
}

/**
 * Parse XML response to extract order information
 */
function parseOrderXML(xmlString: string): NewOrderResponse {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  // Check for parsing errors
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error('Invalid XML response');
  }
  
  // Check for API errors
  const errorElement = xmlDoc.getElementsByTagName('error')[0];
  if (errorElement) {
    const errorCode = errorElement.textContent || 'unknown_error';
    const detailElement = xmlDoc.getElementsByTagName('detal')[0];
    const detail = detailElement?.textContent || '';
    
    throw new Error(`${errorCode}${detail ? ': ' + detail : ''}`);
  }
  
  // Extract main order information
  const getElementText = (tagName: string): string => {
    const element = xmlDoc.getElementsByTagName(tagName)[0];
    return element?.textContent || '';
  };
  
  const getElementNumber = (tagName: string): number => {
    const text = getElementText(tagName);
    return text ? parseFloat(text) : 0;
  };
  
  const response: NewOrderResponse = {
    order_id: getElementNumber('order_id'),
    reservation_until: getElementText('reservation_until'),
    reservation_until_min: getElementText('reservation_until_min'),
    security: getElementText('security'),
    status: getElementText('status'),
    price_total: getElementNumber('price_total'),
    currency: getElementText('currency')
  };
  
  // Check for promocode info
  const promocodeValid = xmlDoc.getElementsByTagName('promocode_valid')[0];
  if (promocodeValid) {
    response.promocode_info = {
      promocode_valid: parseInt(promocodeValid.textContent || '0') as 0 | 1,
      promocode_name: getElementText('promocode_name'),
      price_promocode: getElementNumber('price_promocode')
    };
  }
  
  // Parse trip details (objects "0", "1", etc.)
  const root = xmlDoc.documentElement;
  for (let i = 0; i < 10; i++) { // Max 10 trips
    const tripElement = root.getElementsByTagName(i.toString())[0];
    if (tripElement) {
      response[i.toString()] = parseTripDetails(tripElement);
    }
  }
  
  return response;
}

/**
 * Parse trip details from XML element
 */
function parseTripDetails(tripElement: Element): unknown {
  const result: Record<string, unknown> = {};
  
  // Get all child elements
  for (let i = 0; i < tripElement.children.length; i++) {
    const child = tripElement.children[i];
    const tagName = child.tagName;
    
    if (child.children.length > 0) {
      // Nested structure (like passenger details)
      const nested: Record<string, unknown> = {};
      for (let j = 0; j < child.children.length; j++) {
        const nestedChild = child.children[j];
        nested[nestedChild.tagName] = nestedChild.textContent;
      }
      result[tagName] = nested;
    } else {
      // Simple value
      result[tagName] = child.textContent;
    }
  }
  
  return result;
}

/**
 * Convert order response to reservation info
 */
function normalizeOrderResponse(response: NewOrderResponse): ReservationInfo {
  return {
    order_id: response.order_id,
    security: response.security,
    reservation_until: response.reservation_until,
    reservation_until_min: response.reservation_until_min,
    price_total: response.price_total,
    currency: response.currency,
    status: response.status,
    promocode_info: response.promocode_info
  };
}

/**
 * Convert form data to URL encoded string
 */
function encodeFormData(data: Record<string, unknown>): string {
  const params = new URLSearchParams();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            // Handle nested objects (like discount arrays)
            Object.entries(item).forEach(([subKey, subValue]) => {
              params.append(`${key}[${index}][${subKey}]`, String(subValue));
            });
          } else {
            params.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (typeof value === 'object') {
        // Handle objects (like baggage or discount maps)
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (Array.isArray(subValue)) {
            (subValue as unknown[]).forEach((item, index) => {
              params.append(`${key}[${subKey}][${index}]`, String(item));
            });
          } else {
            params.append(`${key}[${subKey}]`, String(subValue));
          }
        });
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
}

/**
 * Main function to create new order
 */
export async function createNewOrder(
  payload: NewOrderPayload,
  config: {
    timeout_ms?: number;
    max_retries?: number;
    retry_delay_ms?: number;
  } = {}
): Promise<OrderCreationResult> {
  const finalConfig = {
    timeout_ms: 30000, // 30 seconds for order creation
    max_retries: 2,
    retry_delay_ms: 1000,
    ...config
  };
  
  // Rate limiting check
  if (!checkRateLimit()) {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait before trying again.'
      }
    };
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= finalConfig.max_retries; attempt++) {
    try {
      console.log(`Creating order (attempt ${attempt + 1}/${finalConfig.max_retries + 1})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout_ms);
      
      try {
        const formData = encodeFormData(payload as unknown as Record<string, unknown>);
        
        const response = await fetch(NEW_ORDER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/xml, text/xml, */*'
          },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        console.log('Order XML response:', xmlText.substring(0, 500) + '...');
        
        const orderResponse = parseOrderXML(xmlText);
        const reservation = normalizeOrderResponse(orderResponse);
        
        return {
          success: true,
          reservation
        };
        
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Order creation attempt ${attempt + 1} failed:`, lastError.message);
      
      // Don't retry on validation errors
      if (lastError.message.includes('no_name') || 
          lastError.message.includes('no_phone') ||
          lastError.message.includes('no_seat') ||
          lastError.message.includes('dealer_no_activ')) {
        break;
      }
      
      // Wait before retry
      if (attempt < finalConfig.max_retries) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.retry_delay_ms));
      }
    }
  }
  
  // Parse error details
  const errorMessage = lastError?.message || 'Unknown error';
  let errorCode = 'UNKNOWN_ERROR';
  let detail = '';
  
  if (errorMessage.includes(':')) {
    const parts = errorMessage.split(':');
    errorCode = parts[0].trim();
    detail = parts.slice(1).join(':').trim();
  } else {
    errorCode = errorMessage;
  }
  
  return {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      detail: detail || undefined
    }
  };
}

/**
 * Utility function to format payload for debugging
 */
export function formatOrderPayload(payload: NewOrderPayload): string {
  const formatted = { ...payload };
  
  // Hide sensitive data
  if (formatted.password) {
    formatted.password = '***';
  }
  
  return JSON.stringify(formatted, null, 2);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: string): boolean {
  const retryableErrors = [
    'timeout',
    'network',
    'connection',
    'fetch'
  ];
  
  return retryableErrors.some(keyword => 
    error.toLowerCase().includes(keyword)
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'dealer_no_activ': 'Invalid credentials. Please check your login details.',
    'interval_no_found': 'The selected route is no longer available.',
    'route_no_activ': 'The selected route is currently inactive.',
    'no_seat': 'Please select seats for all passengers.',
    'new_order': 'Unable to create reservation. Seats may be taken.',
    'no_name': 'Passenger name is required.',
    'no_phone': 'Phone number is required.',
    'no_email': 'Email address is required.',
    'no_doc': 'Document information is required.',
    'no_birth_date': 'Birth date is required.',
    'seat_taken': 'Selected seats are no longer available.',
    'route_full': 'The route is fully booked.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait before trying again.',
    'TIMEOUT_ERROR': 'Request timed out. Please try again.',
    'NETWORK_ERROR': 'Network error. Please check your connection.'
  };
  
  return errorMessages[errorCode] || `Error: ${errorCode}`;
}
