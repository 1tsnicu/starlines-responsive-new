// HTTP client for get_plan API with XML parsing and error handling
// Manages bus layout/plan retrieval with comprehensive error management

import type {
  GetPlanRequest,
  GetPlanError,
  RawPlanResponse,
  PlanCacheKey
} from '@/types/getPlan';

// Rate limiting configuration
const RATE_LIMITS = {
  requests_per_minute: 30,
  requests_per_hour: 200,
  burst_limit: 10
};

// Request tracking for rate limiting
const requestTracker = {
  minute: { count: 0, resetTime: Date.now() + 60000 },
  hour: { count: 0, resetTime: Date.now() + 3600000 },
  burst: { count: 0, resetTime: Date.now() + 1000 }
};

/**
 * Check if we're within rate limits
 */
function checkRateLimit(): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  // Reset counters if time windows have passed
  if (now > requestTracker.minute.resetTime) {
    requestTracker.minute = { count: 0, resetTime: now + 60000 };
  }
  if (now > requestTracker.hour.resetTime) {
    requestTracker.hour = { count: 0, resetTime: now + 3600000 };
  }
  if (now > requestTracker.burst.resetTime) {
    requestTracker.burst = { count: 0, resetTime: now + 1000 };
  }
  
  // Check limits
  if (requestTracker.burst.count >= RATE_LIMITS.burst_limit) {
    return { allowed: false, reason: 'Burst limit exceeded' };
  }
  if (requestTracker.minute.count >= RATE_LIMITS.requests_per_minute) {
    return { allowed: false, reason: 'Minute rate limit exceeded' };
  }
  if (requestTracker.hour.count >= RATE_LIMITS.requests_per_hour) {
    return { allowed: false, reason: 'Hour rate limit exceeded' };
  }
  
  return { allowed: true };
}

/**
 * Increment rate limit counters
 */
function incrementRateLimit(): void {
  requestTracker.minute.count++;
  requestTracker.hour.count++;
  requestTracker.burst.count++;
}

/**
 * Create a standardized error object
 */
function createPlanError(
  code: GetPlanError['code'],
  message: string,
  details?: Record<string, unknown>,
  retryable = false
): GetPlanError {
  return {
    code,
    message,
    details,
    retryable
  };
}

/**
 * Parse XML error response
 */
function parseXMLError(xmlText: string): GetPlanError | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const errorElement = xmlDoc.getElementsByTagName('error')[0];
    if (!errorElement) return null;
    
    const errorCode = errorElement.textContent?.trim();
    const detailElement = xmlDoc.getElementsByTagName('detal')[0];
    const errorDetail = detailElement?.textContent?.trim() || '';
    
    // Map specific error codes
    switch (errorCode) {
      case 'dealer_no_activ':
        return createPlanError('dealer_no_activ', 'Dealer is not active or credentials are invalid', { detail: errorDetail });
      case 'no_found':
        return createPlanError('no_found', 'Bus plan not found for the specified bus type', { detail: errorDetail });
      default:
        return createPlanError('unknown_error', `API Error: ${errorCode}`, { detail: errorDetail, code: errorCode });
    }
  } catch (e) {
    return createPlanError('parse_error', 'Failed to parse error response', { originalError: e });
  }
}

/**
 * Convert XML to JSON object
 */
function xmlToJson(xml: Document | Element): Record<string, unknown> | string {
  const result: Record<string, unknown> = {};
  
  if (xml.nodeType === Node.TEXT_NODE) {
    return xml.nodeValue?.trim() || '';
  }
  
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes[i];
      const nodeName = item.nodeName;
      
      if (item.nodeType === Node.TEXT_NODE) {
        const textContent = item.nodeValue?.trim();
        if (textContent) {
          return textContent;
        }
      } else {
        const childResult = xmlToJson(item as Element);
        if (result[nodeName] === undefined) {
          result[nodeName] = childResult;
        } else {
          if (!Array.isArray(result[nodeName])) {
            result[nodeName] = [result[nodeName]];
          }
          (result[nodeName] as unknown[]).push(childResult);
        }
      }
    }
  }
  
  // Handle attributes
  if (xml.nodeType === Node.ELEMENT_NODE) {
    const element = xml as Element;
    if (element.hasAttributes()) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        result[`@${attr.nodeName}`] = attr.nodeValue;
      }
    }
  }
  
  return result;
}

/**
 * Main get_plan API function
 */
export async function getPlan(
  request: GetPlanRequest,
  config: {
    timeout_ms?: number;
    max_retries?: number;
    retry_delay_ms?: number;
  } = {}
): Promise<{ success: true; data: unknown } | { success: false; error: GetPlanError }> {
  
  const finalConfig = {
    timeout_ms: 15000,
    max_retries: 3,
    retry_delay_ms: 1000,
    ...config
  };
  
  // Validate required fields
  if (!request.bustype_id) {
    return {
      success: false,
      error: createPlanError('validation_error', 'bustype_id is required')
    };
  }
  
  if (!request.login || !request.password) {
    return {
      success: false,
      error: createPlanError('validation_error', 'login and password are required')
    };
  }
  
  // Check rate limits
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: createPlanError('network_error', `Rate limit exceeded: ${rateLimitCheck.reason}`, {}, true)
    };
  }
  
  const API_BASE_URL = import.meta.env.DEV ? '/api/backend/curl' : '/api/backend/curl';
  const endpoint = `${API_BASE_URL}/get_plan.php`;
  
  let lastError: GetPlanError | null = null;
  
  for (let attempt = 1; attempt <= finalConfig.max_retries; attempt++) {
    try {
      console.log(`[getPlan] Attempt ${attempt}:`, {
        bustype_id: request.bustype_id,
        position: request.position || 'h',
        version: request.v || 2.0
      });
      
      // Increment rate limit counter
      incrementRateLimit();
      
      // Prepare request body
      const body: Record<string, unknown> = {
        // Backend injects credentials; send only required business params
        bustype_id: request.bustype_id,
        position: request.position || 'h',
        v: request.v || 2.0
      };
      
      if (request.session) body.session = request.session;
      if (request.vagon_type) body.vagon_type = request.vagon_type;
      
      // Make request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/xml, text/xml, text/plain'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(finalConfig.timeout_ms || 15000)
      });
      
      if (!response.ok) {
        throw createPlanError(
          'network_error',
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, statusText: response.statusText },
          response.status >= 500 // Retry on server errors
        );
      }
      
  const xmlText = await response.text(); // Backend still returns raw API XML
      
      // Check for XML errors first
      const xmlError = parseXMLError(xmlText);
      if (xmlError) {
        return { success: false, error: xmlError };
      }
      
      // Try to parse as XML
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Check for parsing errors
        const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
        if (parserError) {
          throw new Error('XML parsing failed');
        }
        
        // Convert to JSON structure
        const jsonData = xmlToJson(xmlDoc);
        
        console.log(`[getPlan] Success on attempt ${attempt}`);
        return { success: true, data: jsonData };
        
      } catch (parseError) {
        // If XML parsing fails, try to return raw text
        console.warn(`[getPlan] XML parsing failed, returning raw response:`, parseError);
        return { success: true, data: { raw: xmlText } };
      }
      
    } catch (error) {
      console.log(`[getPlan] Attempt ${attempt} failed:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = createPlanError('network_error', 'Request timeout', { timeout: finalConfig.timeout_ms }, true);
        } else if (error.message.includes('Failed to fetch')) {
          lastError = createPlanError('network_error', 'Network connection failed', { originalError: error.message }, true);
        } else {
          lastError = createPlanError('unknown_error', error.message, { originalError: error });
        }
      } else {
        lastError = createPlanError('unknown_error', 'Unknown error occurred', { error }, false);
      }
      
      // Don't retry on non-retryable errors
      if (!lastError.retryable) {
        break;
      }
      
      // Wait before retry
      if (attempt < finalConfig.max_retries) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.retry_delay_ms));
      }
    }
  }
  
  return {
    success: false,
    error: lastError || createPlanError('unknown_error', 'All retry attempts failed')
  };
}

/**
 * Create cache key for plan requests
 */
export function createPlanCacheKey(request: Partial<GetPlanRequest>): string {
  const key: PlanCacheKey = {
    bustype_id: request.bustype_id || '',
    position: request.position || 'h',
    version: request.v || 2.0
  };
  
  return `plan:${key.bustype_id}:${key.position}:${key.version}`;
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus() {
  const now = Date.now();
  return {
    minute: {
      used: requestTracker.minute.count,
      limit: RATE_LIMITS.requests_per_minute,
      resetIn: Math.max(0, requestTracker.minute.resetTime - now)
    },
    hour: {
      used: requestTracker.hour.count,
      limit: RATE_LIMITS.requests_per_hour,
      resetIn: Math.max(0, requestTracker.hour.resetTime - now)
    },
    burst: {
      used: requestTracker.burst.count,
      limit: RATE_LIMITS.burst_limit,
      resetIn: Math.max(0, requestTracker.burst.resetTime - now)
    }
  };
}

/**
 * Reset rate limit counters (for testing)
 */
export function resetRateLimits(): void {
  const now = Date.now();
  requestTracker.minute = { count: 0, resetTime: now + 60000 };
  requestTracker.hour = { count: 0, resetTime: now + 3600000 };
  requestTracker.burst = { count: 0, resetTime: now + 1000 };
}
