/**
 * GET BAGGAGE HTTP CLIENT
 * 
 * Client HTTP pentru apelarea get_baggage cu suport XML→JSON fallback
 * Include rate limiting, caching și error handling specific pentru bagaje
 */

import type { 
  GetBaggageRequest, 
  RawGetBaggageResponse, 
  GetBaggageError,
  BaggageCacheKey 
} from '@/types/getBaggage';

// ===============================
// Configuration Interface
// ===============================

export interface GetBaggageConfig {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  useCache?: boolean;
  validateResponse?: boolean;
}

// ===============================
// Rate Limiting
// ===============================

interface BaggageRateLimitState {
  requests: number[];
  lastReset: number;
}

const baggageRateLimits = new Map<string, BaggageRateLimitState>();

function checkBaggageRateLimit(endpoint: string): boolean {
  const now = Date.now();
  const key = `getBaggage_${endpoint}`;
  
  if (!baggageRateLimits.has(key)) {
    baggageRateLimits.set(key, { requests: [], lastReset: now });
  }
  
  const state = baggageRateLimits.get(key)!;
  
  // Reset hourly counter
  if (now - state.lastReset > 60 * 60 * 1000) {
    state.requests = [];
    state.lastReset = now;
  }
  
  // Remove requests older than 1 hour
  state.requests = state.requests.filter(time => now - time < 60 * 60 * 1000);
  
  // Check limits: 15 per minute, 100 per hour (higher than routes due to detailed selections)
  const recentRequests = state.requests.filter(time => now - time < 60 * 1000);
  
  if (recentRequests.length >= 15 || state.requests.length >= 100) {
    return false;
  }
  
  state.requests.push(now);
  return true;
}

// ===============================
// XML Parser (Browser Compatible)
// ===============================
// XML to JSON Parser
// ===============================

function xmlToJson(xmlText: string): Record<string, unknown> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  function parseNode(node: Element): unknown {
    const result: Record<string, unknown> = {};
    
    // Handle attributes
    if (node.attributes.length > 0) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        result[`@${attr.name}`] = attr.value;
      }
    }
    
    // Handle child nodes
    const children = Array.from(node.children);
    if (children.length === 0) {
      const textContent = node.textContent?.trim();
      if (textContent) {
        return textContent;
      }
      return result;
    }
    
    for (const child of children) {
      const tagName = child.tagName;
      const parsedChild = parseNode(child);
      
      if (result[tagName]) {
        // Multiple children with same tag name -> array
        if (!Array.isArray(result[tagName])) {
          result[tagName] = [result[tagName]];
        }
        (result[tagName] as unknown[]).push(parsedChild);
      } else {
        result[tagName] = parsedChild;
      }
    }
    
    return result;
  }
  
  const root = xmlDoc.documentElement;
  if (!root) {
    throw new Error('Invalid XML: no root element');
  }
  
  return { [root.tagName]: parseNode(root) };
}

// ===============================
// HTTP Client Functions
// ===============================

async function fetchBaggage(
  params: GetBaggageRequest,
  options: {
    timeout?: number;
    retries?: number;
    backoffMs?: number;
  } = {}
): Promise<RawGetBaggageResponse> {
  const { timeout = 20000, retries = 2, backoffMs = 1000 } = options;
  
  // Validate required parameter
  if (!params.interval_id || String(params.interval_id).trim() === '') {
    throw new Error('interval_id is required for get_baggage');
  }
  
  // Rate limiting check
  if (!checkBaggageRateLimit('get_baggage')) {
    const error: GetBaggageError = {
      code: 'RATE_LIMITED',
      message: 'Rate limit exceeded for get_baggage',
      user_message: 'Prea multe cereri pentru bagaje. Te rog așteaptă puțin.',
      retry_suggested: true
    };
    throw error;
  }
  
  const url = '/api/proxy/get-baggage'; // Backend proxy endpoint
  
  // Prepare request body
  const requestBody = {
    ...params,
    currency: params.currency || 'EUR',
    lang: params.lang || 'ru'
  };
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/xml, text/xml',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      
      // Try to parse as JSON first
      if (contentType.includes('application/json')) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('[getBaggage] Received JSON response');
          return jsonData;
        } catch (parseError) {
          console.warn('[getBaggage] Failed to parse JSON, trying XML fallback');
        }
      }
      
      // Fallback to XML parsing
      if (contentType.includes('xml') || responseText.trim().startsWith('<')) {
        try {
          const xmlData = xmlToJson(responseText);
          console.log('[getBaggage] Parsed XML response successfully');
          
          // Extract the actual response from XML structure
          const rootKey = Object.keys(xmlData)[0];
          return xmlData[rootKey] as RawGetBaggageResponse;
        } catch (parseError) {
          throw new Error(`Failed to parse XML response: ${parseError}`);
        }
      }
      
      throw new Error('Response is neither valid JSON nor XML');
      
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: GetBaggageError = {
          code: 'TIMEOUT_ERROR',
          message: `Request timeout after ${timeout}ms`,
          user_message: 'Cererea pentru bagaje a expirat. Te rog încearcă din nou.',
          retry_suggested: true
        };
        throw timeoutError;
      }
      
      if (attempt < retries) {
        console.warn(`[getBaggage] Attempt ${attempt + 1} failed, retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs * (attempt + 1)));
        continue;
      }
    }
  }
  
  // All retries failed
  const networkError: GetBaggageError = {
    code: 'NETWORK_ERROR',
    message: lastError.message,
    user_message: 'Problemă la încărcarea bagajelor. Te rog verifică internetul și încearcă din nou.',
    retry_suggested: true
  };
  throw networkError;
}

// ===============================
// High-level API Functions
// ===============================

/**
 * Get detailed baggage options for a specific interval/segment
 * 
 * @param interval_id - The interval ID from get_routes response  
 * @param options - Additional request options
 * @returns Promise<RawGetBaggageResponse>
 */
export async function getBaggage(
  interval_id: string,
  options: {
    station_from_id?: string | number;
    station_to_id?: string | number;
    currency?: "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
    lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";
    timeout?: number;
    retries?: number;
  } = {}
): Promise<RawGetBaggageResponse> {
  if (!interval_id || String(interval_id).trim() === '') {
    const error: GetBaggageError = {
      code: 'INTERVAL_ID_REQUIRED',
      message: 'interval_id is required',
      user_message: 'ID-ul intervalului lipsește. Te rog selectează o rută validă.',
      retry_suggested: false
    };
    throw error;
  }
  
  const request: GetBaggageRequest = {
    interval_id: String(interval_id).trim(),
    station_from_id: options.station_from_id ? String(options.station_from_id) : undefined,
    station_to_id: options.station_to_id ? String(options.station_to_id) : undefined,
    currency: options.currency || 'EUR',
    lang: options.lang || 'ru'
  };
  
  try {
    const response = await fetchBaggage(request, {
      timeout: options.timeout || 20000,
      retries: options.retries || 2
    });
    
    // Check for API-level errors
    if (response.result === 0 && response.error) {
      const errorCode = response.error.toLowerCase();
      
      const apiError: GetBaggageError = {
        code: errorCode,
        message: response.error,
        user_message: getLocalizedBaggageError(errorCode),
        retry_suggested: isRetryableBaggageError(errorCode),
        context: {
          interval_id,
          station_from_id: request.station_from_id,
          station_to_id: request.station_to_id
        }
      };
      throw apiError;
    }
    
    return response;
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      // Re-throw GetBaggageError as-is
      throw error;
    }
    
    // Wrap unexpected errors
    const unexpectedError: GetBaggageError = {
      code: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      user_message: 'A apărut o eroare neașteptată la încărcarea bagajelor. Te rog încearcă din nou.',
      retry_suggested: true
    };
    throw unexpectedError;
  }
}

/**
 * Check if baggage is available for an interval without fetching
 */
export function isBaggageAvailable(interval_id: unknown, request_get_baggage?: 0 | 1): boolean {
  if (!interval_id || String(interval_id).trim() === '') {
    return false;
  }
  
  // If explicitly marked as having baggage
  if (request_get_baggage === 1) {
    return true;
  }
  
  // If not marked, assume might have baggage (let API decide)
  return true;
}

/**
 * Generate cache key for baggage requests
 */
export function generateBaggageCacheKey(
  interval_id: string,
  station_from_id?: string | number,
  station_to_id?: string | number,
  currency: string = 'EUR',
  lang: string = 'ru'
): BaggageCacheKey {
  return {
    interval_id,
    station_from_id: station_from_id ? String(station_from_id) : undefined,
    station_to_id: station_to_id ? String(station_to_id) : undefined,
    currency,
    lang
  };
}

// ===============================
// Error Handling Helpers
// ===============================

function getLocalizedBaggageError(errorCode: string): string {
  const messages: Record<string, string> = {
    'baggage_not_found': 'Nu există opțiuni de bagaj pentru această rută',
    'interval_no_activ': 'Intervalul selectat nu este activ',
    'route_no_activ': 'Ruta nu este activă pentru bagaje',
    'dealer_no_activ': 'Dealer inactiv - contactează suportul',
    'currency_no_activ': 'Moneda selectată nu este disponibilă',
    'network_error': 'Problemă de conectare la server',
    'parse_error': 'Eroare la procesarea răspunsului',
    'timeout_error': 'Cererea a expirat - încearcă din nou',
    'rate_limited': 'Prea multe cereri - așteaptă puțin',
    'validation_error': 'Datele trimise nu sunt valide'
  };
  
  return messages[errorCode] || 'Eroare necunoscută la încărcarea bagajelor - contactează suportul';
}

function isRetryableBaggageError(errorCode: string): boolean {
  const retryableErrors = [
    'network_error',
    'timeout_error',
    'parse_error'
  ];
  
  return retryableErrors.includes(errorCode);
}

// ===============================
// Validation Helpers
// ===============================

/**
 * Validate interval_id format
 */
export function isValidIntervalId(interval_id: unknown): boolean {
  if (typeof interval_id !== 'string' && typeof interval_id !== 'number') {
    return false;
  }
  
  const id = String(interval_id).trim();
  return id.length > 0 && id !== 'undefined' && id !== 'null' && id !== '0';
}

/**
 * Validate station IDs
 */
export function areValidStationIds(station_from_id?: unknown, station_to_id?: unknown): boolean {
  if (!station_from_id && !station_to_id) {
    return true; // Both optional
  }
  
  if (station_from_id && !isValidIntervalId(station_from_id)) {
    return false;
  }
  
  if (station_to_id && !isValidIntervalId(station_to_id)) {
    return false;
  }
  
  return true;
}

// ===============================
// Export Types
// ===============================

export type { GetBaggageRequest, RawGetBaggageResponse, GetBaggageError, BaggageCacheKey };
