/**
 * GET ALL ROUTES HTTP CLIENT
 * 
 * Client HTTP pentru apelarea get_all_routes cu suport XML→JSON fallback
 * Include rate limiting, caching și error handling
 */

import type { 
  GetAllRoutesRequest, 
  RawGetAllRoutesResponse, 
  GetAllRoutesError 
} from '@/types/getAllRoutes';
import type { CurrencyCode } from '@/types/routes';

// ===============================
// Rate Limiting
// ===============================

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

const rateLimits = new Map<string, RateLimitState>();

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now();
  const key = `getAllRoutes_${endpoint}`;
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { requests: [], lastReset: now });
  }
  
  const state = rateLimits.get(key)!;
  
  // Reset hourly counter
  if (now - state.lastReset > 60 * 60 * 1000) {
    state.requests = [];
    state.lastReset = now;
  }
  
  // Remove requests older than 1 hour
  state.requests = state.requests.filter(time => now - time < 60 * 60 * 1000);
  
  // Check limits: 10 per minute, 60 per hour
  const recentRequests = state.requests.filter(time => now - time < 60 * 1000);
  
  if (recentRequests.length >= 10 || state.requests.length >= 60) {
    return false;
  }
  
  state.requests.push(now);
  return true;
}

// ===============================
// XML Parser (Browser Compatible)
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
        return { value: textContent };
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

async function fetchAllRoutes(
  params: GetAllRoutesRequest,
  options: {
    timeout?: number;
    retries?: number;
    backoffMs?: number;
  } = {}
): Promise<RawGetAllRoutesResponse> {
  const { timeout = 30000, retries = 2, backoffMs = 1000 } = options;
  
  // Validate required parameter
  if (!params.timetable_id || params.timetable_id.trim() === '') {
    throw new Error('timetable_id is required for get_all_routes');
  }
  
  // Rate limiting check
  if (!checkRateLimit('get_all_routes')) {
    const error: GetAllRoutesError = {
      code: 'RATE_LIMITED',
      message: 'Rate limit exceeded for get_all_routes',
      user_message: 'Prea multe cereri. Te rog așteaptă puțin.',
      retry_suggested: true
    };
    throw error;
  }
  
  const url = '/api/proxy/get-all-routes'; // Backend proxy endpoint
  
  // Prepare request body
  const requestBody = {
    ...params,
    lang: params.lang || 'ru',
    json: 1 // Prefer JSON response
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
          console.log('[getAllRoutes] Received JSON response');
          return jsonData;
        } catch (parseError) {
          console.warn('[getAllRoutes] Failed to parse JSON, trying XML fallback');
        }
      }
      
      // Fallback to XML parsing
      if (contentType.includes('xml') || responseText.trim().startsWith('<')) {
        try {
          const xmlData = xmlToJson(responseText);
          console.log('[getAllRoutes] Parsed XML response successfully');
          
          // Extract the actual response from XML structure
          const rootKey = Object.keys(xmlData)[0];
          return xmlData[rootKey] as RawGetAllRoutesResponse;
        } catch (parseError) {
          throw new Error(`Failed to parse XML response: ${parseError}`);
        }
      }
      
      throw new Error('Response is neither valid JSON nor XML');
      
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: GetAllRoutesError = {
          code: 'TIMEOUT_ERROR',
          message: `Request timeout after ${timeout}ms`,
          user_message: 'Cererea a expirat. Te rog încearcă din nou.',
          retry_suggested: true
        };
        throw timeoutError;
      }
      
      if (attempt < retries) {
        console.warn(`[getAllRoutes] Attempt ${attempt + 1} failed, retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs * (attempt + 1)));
        continue;
      }
    }
  }
  
  // All retries failed
  const networkError: GetAllRoutesError = {
    code: 'NETWORK_ERROR',
    message: lastError.message,
    user_message: 'Problemă de conectare. Te rog verifică internetul și încearcă din nou.',
    retry_suggested: true
  };
  throw networkError;
}

// ===============================
// High-level API Functions
// ===============================

/**
 * Get detailed route schedule by timetable_id
 * 
 * @param timetable_id - The timetable ID from get_routes response
 * @param options - Additional request options
 * @returns Promise<RawGetAllRoutesResponse>
 */
export async function getAllRoutes(
  timetable_id: string,
  options: {
    lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz";
    session?: string;
    currency?: CurrencyCode;
    timeout?: number;
    retries?: number;
  } = {}
): Promise<RawGetAllRoutesResponse> {
  if (!timetable_id || timetable_id.trim() === '') {
    const error: GetAllRoutesError = {
      code: 'EMPTY_TIMETABLE_ID',
      message: 'timetable_id is required',
      user_message: 'ID-ul orarului lipsește. Te rog selectează o rută validă.',
      retry_suggested: false
    };
    throw error;
  }
  
  const request: GetAllRoutesRequest = {
    login: '', // Will be filled by backend proxy
    password: '', // Will be filled by backend proxy
    timetable_id: timetable_id.trim(),
    lang: options.lang || 'ru',
    session: options.session,
    json: 1
  };
  
  try {
    const response = await fetchAllRoutes(request, {
      timeout: options.timeout || 30000,
      retries: options.retries || 2
    });
    
    // Check for API-level errors
    if (response.result === 0 && response.error) {
      const errorCode = response.error.toLowerCase();
      
      const apiError: GetAllRoutesError = {
        code: errorCode,
        message: response.error,
        user_message: getLocalizedErrorMessage(errorCode),
        retry_suggested: isRetryableError(errorCode)
      };
      throw apiError;
    }
    
    return response;
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      // Re-throw GetAllRoutesError as-is
      throw error;
    }
    
    // Wrap unexpected errors
    const unexpectedError: GetAllRoutesError = {
      code: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      user_message: 'A apărut o eroare neașteptată. Te rog încearcă din nou.',
      retry_suggested: true
    };
    throw unexpectedError;
  }
}

/**
 * Validate if a timetable_id looks valid before making the API call
 */
export function isValidTimetableId(timetable_id: unknown): boolean {
  if (typeof timetable_id !== 'string' && typeof timetable_id !== 'number') {
    return false;
  }
  
  const id = String(timetable_id).trim();
  return id.length > 0 && id !== 'undefined' && id !== 'null';
}

// ===============================
// Error Handling Helpers
// ===============================

function getLocalizedErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    'empty_timetable_id': 'ID-ul orarului lipsește',
    'empty_route_id': 'ID-ul rutei lipsește',
    'route_no_found': 'Ruta nu a fost găsită',
    'route_data_no_found': 'Datele rutei nu sunt disponibile',
    'dealer_no_activ': 'Dealer inactiv - contactează suportul',
    'network_error': 'Problemă de conectare la server',
    'parse_error': 'Eroare la procesarea răspunsului',
    'timeout_error': 'Cererea a expirat - încearcă din nou',
    'rate_limited': 'Prea multe cereri - așteaptă puțin'
  };
  
  return messages[errorCode] || 'Eroare necunoscută - contactează suportul';
}

function isRetryableError(errorCode: string): boolean {
  const retryableErrors = [
    'network_error',
    'timeout_error',
    'parse_error'
  ];
  
  return retryableErrors.includes(errorCode);
}

// ===============================
// Export Types
// ===============================

export type { GetAllRoutesRequest, RawGetAllRoutesResponse, GetAllRoutesError };
