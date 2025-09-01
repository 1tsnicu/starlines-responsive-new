// Reserve Ticket HTTP client with XML parsing and comprehensive error handling
// Handles ticket reservation API calls with retry logic and SMS validation support

import type {
  ReserveTicketRequest,
  ReserveTicketResponse,
  ReservationResult,
  ReservedTrip,
  ReservedPassenger,
  ReserveTicketErrorCode
} from '../types/reserveTicket';
import { 
  RESERVE_TICKET_ERRORS,
  RESERVE_ERROR_MESSAGES
} from '../types/reserveTicket';

const RESERVE_TICKET_ENDPOINT = '/curl/reserve_ticket.php';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  requests: new Map<string, number[]>()
};

// Default configuration
const DEFAULT_CONFIG = {
  timeout_ms: 15000,
  retry_attempts: 2,
  retry_delay_ms: 1000
};

/**
 * Check if request is rate limited
 */
function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const requests = RATE_LIMIT.requests.get(identifier) || [];
  
  // Clean old requests outside window
  const validRequests = requests.filter(time => now - time < RATE_LIMIT.windowMs);
  RATE_LIMIT.requests.set(identifier, validRequests);
  
  return validRequests.length >= RATE_LIMIT.maxRequests;
}

/**
 * Record a request for rate limiting
 */
function recordRequest(identifier: string): void {
  const now = Date.now();
  const requests = RATE_LIMIT.requests.get(identifier) || [];
  requests.push(now);
  RATE_LIMIT.requests.set(identifier, requests);
}

/**
 * Encode form data for POST request
 */
function encodeFormData(data: Record<string, unknown>): string {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

/**
 * Parse XML response to JSON
 */
async function parseXMLResponse(xmlText: string): Promise<Record<string, unknown>> {
  try {
    // Simple XML to JSON parser for reserve_ticket response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Invalid XML format');
    }
    
    function xmlToJson(node: Element): Record<string, unknown> | string {
      const result: Record<string, unknown> = {};
      
      // Handle attributes
      if (node.attributes.length > 0) {
        result['@attributes'] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          (result['@attributes'] as Record<string, string>)[attr.name] = attr.value;
        }
      }
      
      // Handle child nodes
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          
          if (child.nodeType === Node.TEXT_NODE) {
            const textContent = child.textContent?.trim();
            if (textContent) {
              if (Object.keys(result).length === 0) {
                return textContent;
              }
              result['#text'] = textContent;
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child as Element;
            const childName = childElement.nodeName;
            const childValue = xmlToJson(childElement);
            
            if (result[childName]) {
              // Convert to array if multiple elements with same name
              if (!Array.isArray(result[childName])) {
                result[childName] = [result[childName]];
              }
              (result[childName] as unknown[]).push(childValue);
            } else {
              result[childName] = childValue;
            }
          }
        }
      }
      
      return result;
    }
    
    const root = xmlDoc.documentElement;
    return xmlToJson(root) as Record<string, unknown>;
    
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error(`Failed to parse XML response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Normalize passenger data from XML
 */
function normalizePassenger(passengerData: Record<string, unknown>): ReservedPassenger {
  return {
    passenger_id: String(passengerData.passenger_id || ''),
    transaction_id: String(passengerData.transaction_id || ''),
    name: typeof passengerData.name === 'string' ? passengerData.name : undefined,
    surname: typeof passengerData.surname === 'string' ? passengerData.surname : undefined,
    seat: typeof passengerData.seat === 'string' ? passengerData.seat : undefined,
    ticket_id: typeof passengerData.ticket_id === 'string' ? passengerData.ticket_id : undefined,
    security: typeof passengerData.security === 'string' ? passengerData.security : undefined,
    reserve_before: typeof passengerData.reserve_before === 'string' ? passengerData.reserve_before : undefined,
    error: typeof passengerData.error === 'string' ? passengerData.error : undefined
  };
}

/**
 * Normalize trip data from XML
 */
function normalizeTrip(tripData: Record<string, unknown>): ReservedTrip {
  // Handle passengers array
  let passengers: ReservedPassenger[] = [];
  if (tripData.passengers && typeof tripData.passengers === 'object') {
    const passengersObj = tripData.passengers as Record<string, unknown>;
    if (passengersObj.item) {
      const passengerItems = Array.isArray(passengersObj.item) 
        ? passengersObj.item 
        : [passengersObj.item];
      passengers = passengerItems
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map(normalizePassenger);
    }
  }
  
  return {
    trip_id: String(tripData.trip_id || ''),
    interval_id: String(tripData.interval_id || ''),
    route_id: String(tripData.route_id || ''),
    date_from: typeof tripData.date_from === 'string' ? tripData.date_from : '',
    time_from: typeof tripData.time_from === 'string' ? tripData.time_from : '',
    point_from: typeof tripData.point_from === 'string' ? tripData.point_from : '',
    station_from: typeof tripData.station_from === 'string' ? tripData.station_from : '',
    date_to: typeof tripData.date_to === 'string' ? tripData.date_to : '',
    time_to: typeof tripData.time_to === 'string' ? tripData.time_to : '',
    point_to: typeof tripData.point_to === 'string' ? tripData.point_to : '',
    station_to: typeof tripData.station_to === 'string' ? tripData.station_to : '',
    route_name: typeof tripData.route_name === 'string' ? tripData.route_name : '',
    carrier: typeof tripData.carrier === 'string' ? tripData.carrier : '',
    passengers
  };
}

/**
 * Determine error code from error message
 */
function mapErrorCode(error: string): ReserveTicketErrorCode {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('dealer') && errorLower.includes('activ')) {
    return RESERVE_TICKET_ERRORS.DEALER_NO_ACTIV;
  }
  if (errorLower.includes('order_id')) {
    return RESERVE_TICKET_ERRORS.ORDER_ID;
  }
  if (errorLower.includes('reserve_validation')) {
    return RESERVE_TICKET_ERRORS.RESERVE_VALIDATION;
  }
  if (errorLower.includes('sms') || errorLower.includes('validation')) {
    return RESERVE_TICKET_ERRORS.NEED_SMS_VALIDATION;
  }
  if (errorLower.includes('order')) {
    return RESERVE_TICKET_ERRORS.ORDER;
  }
  if (errorLower.includes('reserve')) {
    return RESERVE_TICKET_ERRORS.RESERVE;
  }
  if (errorLower.includes('interval') && errorLower.includes('activ')) {
    return RESERVE_TICKET_ERRORS.INTERVAL_NO_ACTIV;
  }
  if (errorLower.includes('passenger') || errorLower.includes('data')) {
    return RESERVE_TICKET_ERRORS.DATA_PASSENGER;
  }
  if (errorLower.includes('ticket')) {
    return RESERVE_TICKET_ERRORS.RESERVE_TICKET;
  }
  if (errorLower.includes('seat') || errorLower.includes('free')) {
    return RESERVE_TICKET_ERRORS.FREE_SEAT;
  }
  
  return RESERVE_TICKET_ERRORS.UNKNOWN_ERROR;
}

/**
 * Check if error suggests retry
 */
function shouldRetryError(errorCode: ReserveTicketErrorCode): boolean {
  const retryableErrors: ReserveTicketErrorCode[] = [
    RESERVE_TICKET_ERRORS.NETWORK_ERROR,
    RESERVE_TICKET_ERRORS.PARSE_ERROR,
    RESERVE_TICKET_ERRORS.UNKNOWN_ERROR,
    RESERVE_TICKET_ERRORS.ORDER, // Sometimes temporary
    RESERVE_TICKET_ERRORS.RESERVE_TICKET // Sometimes temporary
  ];
  
  return retryableErrors.includes(errorCode);
}

/**
 * Main reserve ticket function with comprehensive error handling
 */
export async function reserveTicket(
  payload: ReserveTicketRequest,
  config: Partial<typeof DEFAULT_CONFIG> = {}
): Promise<ReserveTicketResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const requestId = `${payload.order_id}-${Date.now()}`;
  
  // Rate limiting check
  if (isRateLimited(payload.login)) {
    return {
      success: false,
      error: {
        error: 'Rate limit exceeded. Please try again later.',
        code: RESERVE_TICKET_ERRORS.NETWORK_ERROR,
        retry_suggested: true
      }
    };
  }
  
  // Record request for rate limiting
  recordRequest(payload.login);
  
  interface LastError {
    error: string;
    code: ReserveTicketErrorCode;
    attempt?: number;
  }
  
  let lastError: LastError | undefined;
  
  for (let attempt = 1; attempt <= finalConfig.retry_attempts + 1; attempt++) {
    try {
      // Add delay between retries
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.retry_delay_ms * attempt));
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout_ms);
      
      try {
        const formData = encodeFormData(payload as unknown as Record<string, unknown>);
        
        const response = await fetch(RESERVE_TICKET_ENDPOINT, {
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
        const xmlData = await parseXMLResponse(xmlText);
        
        // Check for API errors in XML
        if (xmlData.error && typeof xmlData.error === 'string') {
          const errorCode = mapErrorCode(xmlData.error);
          const shouldRetry = shouldRetryError(errorCode) && attempt <= finalConfig.retry_attempts;
          
          if (!shouldRetry) {
            return {
              success: false,
              error: {
                error: RESERVE_ERROR_MESSAGES[errorCode] || xmlData.error,
                code: errorCode,
                details: typeof xmlData.detal === 'string' ? xmlData.detal : 
                        typeof xmlData.detail === 'string' ? xmlData.detail : undefined,
                retry_suggested: shouldRetryError(errorCode),
                sms_required: errorCode === RESERVE_TICKET_ERRORS.NEED_SMS_VALIDATION
              }
            };
          }
          
          lastError = {
            error: xmlData.error,
            code: errorCode,
            attempt
          };
          continue;
        }
        
        // Parse successful response
        const orderId = String(xmlData.order_id || '');
        
        // Handle trips data
        let trips: ReservedTrip[] = [];
        if (xmlData.item) {
          const tripItems = Array.isArray(xmlData.item) ? xmlData.item : [xmlData.item];
          trips = tripItems
            .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            .map(normalizeTrip);
        }
        
        // Calculate statistics
        const totalPassengers = trips.reduce((sum, trip) => sum + trip.passengers.length, 0);
        const passengersWithErrors = trips.reduce((sum, trip) => 
          sum + trip.passengers.filter(p => p.error).length, 0
        );
        const allReserved = passengersWithErrors === 0 && totalPassengers > 0;
        
        const result: ReservationResult = {
          order_id: orderId,
          trips,
          total_passengers: totalPassengers,
          all_reserved: allReserved,
          has_errors: passengersWithErrors > 0
        };
        
        return {
          success: true,
          data: result
        };
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            lastError = { error: 'Request timeout', code: RESERVE_TICKET_ERRORS.NETWORK_ERROR };
          } else {
            lastError = { error: fetchError.message, code: RESERVE_TICKET_ERRORS.NETWORK_ERROR };
          }
        } else {
          lastError = { error: 'Unknown fetch error', code: RESERVE_TICKET_ERRORS.NETWORK_ERROR };
        }
      }
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('parse')) {
        lastError = { error: error.message, code: RESERVE_TICKET_ERRORS.PARSE_ERROR };
      } else {
        lastError = { 
          error: error instanceof Error ? error.message : 'Unknown error', 
          code: RESERVE_TICKET_ERRORS.UNKNOWN_ERROR 
        };
      }
    }
  }
  
  // All retries failed
  const errorCode = lastError?.code || RESERVE_TICKET_ERRORS.UNKNOWN_ERROR;
  return {
    success: false,
    error: {
      error: RESERVE_ERROR_MESSAGES[errorCode] || lastError?.error || 'Request failed after retries',
      code: errorCode,
      retry_suggested: shouldRetryError(errorCode)
    }
  };
}

/**
 * Export configuration for testing
 */
export { DEFAULT_CONFIG, RATE_LIMIT };
