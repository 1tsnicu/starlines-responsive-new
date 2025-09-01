/**
 * GET FREE SEATS HTTP CLIENT
 * 
 * Client HTTP pentru API get_free_seats cu XML fallback și rate limiting
 * Gestionează autobuze și trenuri cu vagoane
 */

import type {
  GetFreeSeatsRequest,
  GetFreeSeatsError,
  RawFreeSeatResponse,
  SeatsCacheKey
} from '@/types/getFreeSeats';

// ===============================
// Configuration
// ===============================

export interface GetFreeSeatsConfig {
  timeout_ms?: number;
  max_retries?: number;
  rate_limit?: {
    requests_per_minute?: number;
    requests_per_hour?: number;
  };
  fallback_to_xml?: boolean;
  debug?: boolean;
}

const DEFAULT_CONFIG: GetFreeSeatsConfig = {
  timeout_ms: 15000,
  max_retries: 3,
  rate_limit: {
    requests_per_minute: 20,
    requests_per_hour: 100
  },
  fallback_to_xml: true,
  debug: false
};

// ===============================
// Rate Limiting
// ===============================

interface RateLimitState {
  requests_per_minute: number;
  requests_per_hour: number;
  minute_window_start: number;
  hour_window_start: number;
}

const rateLimitState: RateLimitState = {
  requests_per_minute: 0,
  requests_per_hour: 0,
  minute_window_start: Date.now(),
  hour_window_start: Date.now()
};

function checkRateLimit(config: GetFreeSeatsConfig): boolean {
  const now = Date.now();
  const { rate_limit } = config;
  
  if (!rate_limit) return true;
  
  // Reset minute window if needed
  if (now - rateLimitState.minute_window_start > 60000) {
    rateLimitState.requests_per_minute = 0;
    rateLimitState.minute_window_start = now;
  }
  
  // Reset hour window if needed
  if (now - rateLimitState.hour_window_start > 3600000) {
    rateLimitState.requests_per_hour = 0;
    rateLimitState.hour_window_start = now;
  }
  
  // Check limits
  if (rate_limit.requests_per_minute && 
      rateLimitState.requests_per_minute >= rate_limit.requests_per_minute) {
    return false;
  }
  
  if (rate_limit.requests_per_hour && 
      rateLimitState.requests_per_hour >= rate_limit.requests_per_hour) {
    return false;
  }
  
  return true;
}

function updateRateLimit(): void {
  rateLimitState.requests_per_minute++;
  rateLimitState.requests_per_hour++;
}

// ===============================
// XML to JSON Conversion
// ===============================

function xmlToJson(xmlText: string): Record<string, unknown> {
  try {
    // Browser-compatible XML parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parse errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parse error: ' + parserError.textContent);
    }
    
    function xmlNodeToObject(node: Node): Record<string, unknown> | string | null {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text || null;
      }
      
      const element = node as Element;
      const result: Record<string, unknown> = {};
      
      // Handle attributes
      if (element.attributes.length > 0) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          result[`@${attr.name}`] = attr.value;
        }
      }
      
      // Process children
      const childGroups: { [key: string]: unknown[] } = {};
      let hasTextContent = false;
      
      element.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) {
            result['#text'] = text;
            hasTextContent = true;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const childElement = child as Element;
          const tagName = childElement.tagName;
          const childResult = xmlNodeToObject(child);
          
          if (childResult !== null) {
            if (!childGroups[tagName]) {
              childGroups[tagName] = [];
            }
            childGroups[tagName].push(childResult);
          }
        }
      });
      
      // Convert child groups to final structure
      Object.entries(childGroups).forEach(([tagName, group]) => {
        result[tagName] = group.length === 1 ? group[0] : group;
      });
      
      // If only text content and no attributes, return just the text
      if (hasTextContent && Object.keys(result).length === 1 && result['#text']) {
        return String(result['#text']);
      }
      
      return result;
    }
    
    return xmlNodeToObject(doc.documentElement) as Record<string, unknown>;
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ===============================
// Error Handling
// ===============================

function createSeatsError(
  code: GetFreeSeatsError['code'],
  message: string,
  details?: Record<string, unknown>,
  retryable: boolean = false
): GetFreeSeatsError {
  return {
    code,
    message,
    details,
    retryable
  };
}

function parseErrorResponse(response: Record<string, unknown>): GetFreeSeatsError {
  const errorCode = response?.error_code || response?.error || response?.status;
  const errorMessage = String(response?.error_message || response?.message || 'Unknown error');
  
  switch (errorCode) {
    case 'dealer_no_activ':
      return createSeatsError('dealer_no_activ', 'Dealer account not active', response);
      
    case 'route_no_activ':
      return createSeatsError('route_no_activ', 'Route not active', response);
      
    case 'interval_no_found':
      return createSeatsError('interval_no_found', 'Interval not found', response);
      
    case 'no_seat':
      return createSeatsError('no_seat', 'No seats available', response);
      
    case 'no_inforamtion': // API typo
      return createSeatsError('no_inforamtion', 'No seat information available', response, true);
      
    case 'invalid_train':
      return createSeatsError('invalid_train', 'Invalid train ID', response);
      
    case 'invalid_vagon':
      return createSeatsError('invalid_vagon', 'Invalid vagon ID', response);
      
    default:
      return createSeatsError('unknown_error', errorMessage || 'Unknown API error', response, true);
  }
}

// ===============================
// Validation Functions
// ===============================

function validateRequest(request: GetFreeSeatsRequest): GetFreeSeatsError | null {
  if (!request.interval_id) {
    return createSeatsError('validation_error', 'interval_id is required');
  }
  
  if (!request.currency) {
    return createSeatsError('validation_error', 'currency is required');
  }
  
  if (!request.lang) {
    return createSeatsError('validation_error', 'lang is required');
  }
  
  // Validate train_id and vagon_id relationship
  if (request.vagon_id && !request.train_id) {
    return createSeatsError('validation_error', 'train_id is required when vagon_id is specified');
  }
  
  return null;
}

// ===============================
// Main HTTP Function
// ===============================

export async function getFreeSeats(
  request: GetFreeSeatsRequest,
  config: GetFreeSeatsConfig = {}
): Promise<RawFreeSeatResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Validate request
  const validationError = validateRequest(request);
  if (validationError) {
    throw validationError;
  }
  
  // Rate limiting check
  if (!checkRateLimit(finalConfig)) {
    throw createSeatsError(
      'network_error',
      'Rate limit exceeded. Please try again later.',
      { rate_limit: finalConfig.rate_limit },
      true
    );
  }
  
  const API_BASE_URL = import.meta.env.DEV 
    ? '/api/bussystem'  // Use Vite proxy in development
    : 'https://test-api.bussystem.eu/server';  // Direct API in production
  const endpoint = `${API_BASE_URL}/curl/get_free_seats.php`;
  
  let lastError: GetFreeSeatsError | null = null;
  
  // Retry logic
  for (let attempt = 1; attempt <= (finalConfig.max_retries || 1); attempt++) {
    try {
      updateRateLimit();
      
      if (finalConfig.debug) {
        console.log(`[getFreeSeats] Attempt ${attempt}:`, { 
          endpoint, 
          interval_id: request.interval_id,
          train_id: request.train_id,
          vagon_id: request.vagon_id
        });
      }
      
      // Prepare request body
      const body: Record<string, unknown> = {
        login: request.login,
        password: request.password,
        interval_id: request.interval_id,
        currency: request.currency,
        lang: request.lang
      };
      
      if (request.train_id) body.train_id = request.train_id;
      if (request.vagon_id) body.vagon_id = request.vagon_id;
      if (request.session) body.session = request.session;
      
      // Make request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/xml, application/json, text/xml, text/plain'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(finalConfig.timeout_ms || 15000)
      });
      
      if (!response.ok) {
        throw createSeatsError(
          'network_error',
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, statusText: response.statusText },
          response.status >= 500
        );
      }
      
      const responseText = await response.text();
      
      if (finalConfig.debug) {
        console.log(`[getFreeSeats] Response length:`, responseText.length);
      }
      
      // Try to parse as JSON first
      try {
        const jsonResponse = JSON.parse(responseText);
        
        // Check for API errors in JSON
        if (jsonResponse.error || jsonResponse.root?.error) {
          const errorInfo = jsonResponse.error || jsonResponse.root?.error;
          const errorDetails = jsonResponse.detal || jsonResponse.root?.detal;
          throw parseErrorResponse({ error: errorInfo, detal: errorDetails });
        }
        
        return jsonResponse as RawFreeSeatResponse;
      } catch (jsonError) {
        // If JSON parsing fails, try XML
        if (finalConfig.fallback_to_xml) {
          try {
            const xmlResult = xmlToJson(responseText);
            
            // Check for API errors in XML
            if (xmlResult.root && typeof xmlResult.root === 'object') {
              const root = xmlResult.root as Record<string, unknown>;
              if (root.error) {
                throw parseErrorResponse(root);
              }
            }
            
            return xmlResult as RawFreeSeatResponse;
          } catch (xmlError) {
            throw createSeatsError(
              'parse_error',
              'Failed to parse response as JSON or XML',
              { jsonError, xmlError, responseText: responseText.substring(0, 500) },
              false
            );
          }
        } else {
          throw createSeatsError(
            'parse_error',
            'Failed to parse JSON response',
            { error: jsonError, responseText: responseText.substring(0, 500) },
            false
          );
        }
      }
      
    } catch (error) {
      lastError = error instanceof Error && 'code' in error && 'retryable' in error
        ? error as GetFreeSeatsError
        : createSeatsError(
            'network_error',
            error instanceof Error ? error.message : 'Network request failed',
            { error, attempt },
            true
          );
      
      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === finalConfig.max_retries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (lastError) {
    throw lastError;
  }
  
  throw createSeatsError('unknown_error', 'Unexpected error in getFreeSeats');
}

// ===============================
// Utility Functions
// ===============================

export function createSeatsCacheKey(request: Partial<GetFreeSeatsRequest>): string {
  const parts = [
    request.interval_id || '',
    request.train_id || '',
    request.vagon_id || '',
    request.currency || 'EUR',
    request.lang || 'en'
  ];
  
  return `free_seats:${parts.join(':')}`;
}

export function parseSeatsCacheKey(key: string): SeatsCacheKey | null {
  const match = key.match(/^free_seats:([^:]*):([^:]*):([^:]*):([^:]*):([^:]*)$/);
  if (!match) return null;
  
  const [, interval_id, train_id, vagon_id, currency, lang] = match;
  
  return {
    interval_id,
    train_id: train_id || undefined,
    vagon_id: vagon_id || undefined,
    currency,
    lang
  };
}

// ===============================
// Export Configuration
// ===============================

export { DEFAULT_CONFIG as DEFAULT_FREE_SEATS_CONFIG };
