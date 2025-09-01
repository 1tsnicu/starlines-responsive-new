// Reserve Validation HTTP client with XML parsing and error handling
// Handles validation requests before ticket reservation

import type {
  ReserveValidationRequest,
  ReserveValidationResponse,
  ReserveValidationResult,
  ReserveValidationErrorCode
} from '../types/reserveValidation';
import {
  RESERVE_VALIDATION_ERRORS,
  RESERVE_VALIDATION_ERROR_MESSAGES
} from '../types/reserveValidation';

const RESERVE_VALIDATION_ENDPOINT = '/curl/reserve_validation.php';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60000, // 1 minute
  requests: new Map<string, number[]>()
};

// Default configuration
const DEFAULT_CONFIG = {
  timeout_ms: 10000,
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
    // Simple XML to JSON parser for reserve_validation response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Invalid XML format');
    }
    
    function xmlToJson(node: Element): Record<string, unknown> | string {
      const result: Record<string, unknown> = {};
      
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
 * Determine error code from error message
 */
function mapErrorCode(error: string): ReserveValidationErrorCode {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('no_phone') || errorLower.includes('phone')) {
    return RESERVE_VALIDATION_ERRORS.NO_PHONE;
  }
  if (errorLower.includes('dealer') && errorLower.includes('activ')) {
    return RESERVE_VALIDATION_ERRORS.DEALER_NO_ACTIV;
  }
  
  return RESERVE_VALIDATION_ERRORS.UNKNOWN_ERROR;
}

/**
 * Check if error suggests retry
 */
function shouldRetryError(errorCode: ReserveValidationErrorCode): boolean {
  const retryableErrors: ReserveValidationErrorCode[] = [
    RESERVE_VALIDATION_ERRORS.NETWORK_ERROR,
    RESERVE_VALIDATION_ERRORS.PARSE_ERROR,
    RESERVE_VALIDATION_ERRORS.UNKNOWN_ERROR
  ];
  
  return retryableErrors.includes(errorCode);
}

/**
 * Validate phone number format
 */
function validatePhone(phone: string): boolean {
  // Basic phone validation - should have at least 10 digits
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length >= 10;
}

/**
 * Main reserve validation function
 */
export async function validateReservation(
  payload: ReserveValidationRequest,
  config: Partial<typeof DEFAULT_CONFIG> = {}
): Promise<ReserveValidationResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Validate phone number format
  if (!validatePhone(payload.phone)) {
    return {
      success: false,
      error: {
        error: 'Invalid phone number format',
        code: RESERVE_VALIDATION_ERRORS.NO_PHONE
      }
    };
  }
  
  // Rate limiting check
  if (isRateLimited(payload.login)) {
    return {
      success: false,
      error: {
        error: 'Rate limit exceeded. Please try again later.',
        code: RESERVE_VALIDATION_ERRORS.NETWORK_ERROR
      }
    };
  }
  
  // Record request for rate limiting
  recordRequest(payload.login);
  
  interface LastError {
    error: string;
    code: ReserveValidationErrorCode;
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
        
        const response = await fetch(RESERVE_VALIDATION_ENDPOINT, {
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
                error: RESERVE_VALIDATION_ERROR_MESSAGES[errorCode] || xmlData.error,
                code: errorCode,
                details: typeof xmlData.detal === 'string' ? xmlData.detal : 
                        typeof xmlData.detail === 'string' ? xmlData.detail : undefined
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
        const reserveValidation = xmlData.reserve_validation === '1' || xmlData.reserve_validation === 1;
        const needSmsValidation = xmlData.need_sms_validation === '1' || xmlData.need_sms_validation === 1;
        
        const result: ReserveValidationResult = {
          reserve_validation: reserveValidation,
          need_sms_validation: needSmsValidation
        };
        
        return {
          success: true,
          data: result
        };
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            lastError = { error: 'Request timeout', code: RESERVE_VALIDATION_ERRORS.NETWORK_ERROR };
          } else {
            lastError = { error: fetchError.message, code: RESERVE_VALIDATION_ERRORS.NETWORK_ERROR };
          }
        } else {
          lastError = { error: 'Unknown fetch error', code: RESERVE_VALIDATION_ERRORS.NETWORK_ERROR };
        }
      }
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('parse')) {
        lastError = { error: error.message, code: RESERVE_VALIDATION_ERRORS.PARSE_ERROR };
      } else {
        lastError = { 
          error: error instanceof Error ? error.message : 'Unknown error', 
          code: RESERVE_VALIDATION_ERRORS.UNKNOWN_ERROR 
        };
      }
    }
  }
  
  // All retries failed
  const errorCode = lastError?.code || RESERVE_VALIDATION_ERRORS.UNKNOWN_ERROR;
  return {
    success: false,
    error: {
      error: RESERVE_VALIDATION_ERROR_MESSAGES[errorCode] || lastError?.error || 'Request failed after retries',
      code: errorCode
    }
  };
}

/**
 * Export configuration for testing
 */
export { DEFAULT_CONFIG, RATE_LIMIT };
