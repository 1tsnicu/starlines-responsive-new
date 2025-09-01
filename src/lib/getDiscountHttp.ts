/**
 * GET DISCOUNT HTTP CLIENT
 * 
 * Client HTTP pentru API get_discount cu XML fallback și rate limiting
 * Browser-compatible, gestionează timeout, retry și normalizare răspuns
 */

import type {
  GetDiscountRequest,
  GetDiscountConfig,
  GetDiscountError,
  RawGetDiscountResponse
} from '@/types/getDiscount';

// ===============================
// Rate Limiting
// ===============================

interface RateLimitState {
  requests_per_minute: number;
  requests_per_hour: number;
  minute_window_start: number;
  hour_window_start: number;
  last_request: number;
}

const rateLimit: RateLimitState = {
  requests_per_minute: 0,
  requests_per_hour: 0,
  minute_window_start: Date.now(),
  hour_window_start: Date.now(),
  last_request: 0
};

const RATE_LIMITS = {
  MAX_PER_MINUTE: 15,
  MAX_PER_HOUR: 100,
  MIN_INTERVAL: 1000 // 1 secunda între cereri
};

function checkRateLimit(): { allowed: boolean; wait_time?: number } {
  const now = Date.now();
  
  // Reset windows
  if (now - rateLimit.minute_window_start > 60000) {
    rateLimit.requests_per_minute = 0;
    rateLimit.minute_window_start = now;
  }
  
  if (now - rateLimit.hour_window_start > 3600000) {
    rateLimit.requests_per_hour = 0;
    rateLimit.hour_window_start = now;
  }
  
  // Check minimum interval
  if (now - rateLimit.last_request < RATE_LIMITS.MIN_INTERVAL) {
    return {
      allowed: false,
      wait_time: RATE_LIMITS.MIN_INTERVAL - (now - rateLimit.last_request)
    };
  }
  
  // Check per-minute limit
  if (rateLimit.requests_per_minute >= RATE_LIMITS.MAX_PER_MINUTE) {
    return {
      allowed: false,
      wait_time: 60000 - (now - rateLimit.minute_window_start)
    };
  }
  
  // Check per-hour limit
  if (rateLimit.requests_per_hour >= RATE_LIMITS.MAX_PER_HOUR) {
    return {
      allowed: false,
      wait_time: 3600000 - (now - rateLimit.hour_window_start)
    };
  }
  
  return { allowed: true };
}

function updateRateLimit() {
  const now = Date.now();
  rateLimit.requests_per_minute++;
  rateLimit.requests_per_hour++;
  rateLimit.last_request = now;
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
      
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
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
      
      // Handle child nodes
      const children: unknown[] = [];
      for (let i = 0; i < element.childNodes.length; i++) {
        const childResult = xmlNodeToObject(element.childNodes[i]);
        if (childResult !== null) {
          children.push(childResult);
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
          
          if (!childGroups[tagName]) {
            childGroups[tagName] = [];
          }
          childGroups[tagName].push(xmlNodeToObject(child));
        }
      });
      
      // Add child groups to result
      Object.keys(childGroups).forEach(tagName => {
        const group = childGroups[tagName];
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

function createDiscountError(
  code: GetDiscountError['code'],
  message: string,
  details?: Record<string, unknown>,
  retryable: boolean = false
): GetDiscountError {
  return {
    code,
    message,
    details,
    retryable
  };
}

function parseErrorResponse(response: Record<string, unknown>): GetDiscountError {
  // Check for specific error codes in response
  const errorCode = response?.error_code || response?.error || response?.status;
  const errorMessage = String(response?.error_message || response?.message || 'Unknown error');
  
  switch (errorCode) {
    case 'dealer_no_activ':
      return createDiscountError('dealer_no_activ', 'Dealer account not active', response);
      
    case 'route_no_activ':
      return createDiscountError('route_no_activ', 'Route not active', response);
      
    case 'interval_no_found':
      return createDiscountError('interval_no_found', 'Interval not found', response);
      
    case 'no_discount':
      return createDiscountError('no_discount', 'No discounts available for this route', response);
      
    case 'currency_no_activ':
      return createDiscountError('currency_no_activ', 'Currency not supported', response);
      
    default:
      return createDiscountError('unknown_error', errorMessage || 'Unknown API error', response, true);
  }
}

// ===============================
// Main HTTP Client Function
// ===============================

export async function getDiscount(
  request: GetDiscountRequest,
  config: GetDiscountConfig = {}
): Promise<RawGetDiscountResponse> {
  // Apply default configuration
  const finalConfig: Required<GetDiscountConfig> = {
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 1000,
    useXmlFallback: true,
    cacheEnabled: false, // Cache handled at higher level
    cacheTTL: 300000,
    ...config
  };
  
  // Validate required parameters
  if (!request.interval_id?.trim()) {
    throw createDiscountError('validation_error', 'interval_id is required');
  }
  
  // Check rate limits
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    if (rateLimitCheck.wait_time) {
      throw createDiscountError(
        'network_error',
        `Rate limit exceeded. Please wait ${Math.ceil(rateLimitCheck.wait_time / 1000)} seconds.`,
        { wait_time: rateLimitCheck.wait_time },
        true
      );
    }
  }
  
  // Build request payload
  const payload = {
    // login/password ar trebui să vină din backend proxy
    // NU le include aici în frontend!
    interval_id: request.interval_id.trim(),
    currency: request.currency || 'EUR',
    lang: request.lang || 'en',
    ...(request.session && { session: request.session })
  };
  
  // Retry logic
  let lastError: GetDiscountError | null = null;
  
  for (let attempt = 0; attempt <= finalConfig.retryAttempts; attempt++) {
    try {
      // Update rate limit tracking
      updateRateLimit();
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);
      
      // Make HTTP request
      // NOTA: Aceasta ar trebui să fie o cerere către backend proxy, nu direct la API
      const response = await fetch('/api/proxy/get_discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(responseText);
        
        // Check for API errors in JSON response
        if (jsonData.error || jsonData.error_code) {
          throw parseErrorResponse(jsonData);
        }
        
        return jsonData;
      } catch (jsonError) {
        // If JSON parsing fails and XML fallback is enabled
        if (finalConfig.useXmlFallback && responseText.trim().startsWith('<')) {
          try {
            const xmlData = xmlToJson(responseText);
            
            // Check for API errors in XML response
            if (xmlData.error || xmlData.error_code) {
              throw parseErrorResponse(xmlData);
            }
            
            return xmlData;
          } catch (xmlError) {
            throw createDiscountError(
              'parse_error',
              'Failed to parse both JSON and XML response',
              { jsonError, xmlError, responseText: responseText.substring(0, 500) },
              false
            );
          }
        }
        
        // Re-throw JSON error if no XML fallback
        if (jsonError instanceof Error && 'code' in jsonError) {
          throw jsonError;
        }
        
        throw createDiscountError(
          'parse_error',
          'Failed to parse JSON response',
          { error: jsonError, responseText: responseText.substring(0, 500) },
          false
        );
      }
      
    } catch (error) {
      lastError = error instanceof Error && 'code' in error && 'retryable' in error
        ? error as GetDiscountError
        : createDiscountError(
            'network_error',
            error instanceof Error ? error.message : 'Network request failed',
            { error, attempt },
            true
          );
      
      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === finalConfig.retryAttempts) {
        break;
      }
      
      // Wait before retry
      if (attempt < finalConfig.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay * (attempt + 1)));
      }
    }
  }
  
  throw lastError || createDiscountError('unknown_error', 'Request failed after all retries');
}

// ===============================
// Utility Functions
// ===============================

export function validateGetDiscountRequest(request: GetDiscountRequest): string[] {
  const errors: string[] = [];
  
  if (!request.interval_id?.trim()) {
    errors.push('interval_id is required');
  }
  
  if (request.currency && !['EUR', 'RON', 'PLN', 'MDL', 'RUB', 'UAH', 'CZK'].includes(request.currency)) {
    errors.push('Invalid currency code');
  }
  
  if (request.lang && !['en', 'ru', 'ua', 'de', 'pl', 'cz', 'ro'].includes(request.lang)) {
    errors.push('Invalid language code');
  }
  
  return errors;
}

export function getDiscountRateLimitStatus() {
  return {
    requests_this_minute: rateLimit.requests_per_minute,
    requests_this_hour: rateLimit.requests_per_hour,
    max_per_minute: RATE_LIMITS.MAX_PER_MINUTE,
    max_per_hour: RATE_LIMITS.MAX_PER_HOUR,
    time_until_minute_reset: Math.max(0, 60000 - (Date.now() - rateLimit.minute_window_start)),
    time_until_hour_reset: Math.max(0, 3600000 - (Date.now() - rateLimit.hour_window_start))
  };
}
