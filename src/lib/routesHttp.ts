/**
 * GET ROUTES HTTP CLIENT
 * 
 * Client HTTP specializat pentru get_routes cu:
 * - Fallback XML→JSON
 * - Rate limiting
 * - Error handling
 * - Browser compatibility
 */

import type { GetRoutesRequest, RawGetRoutesResponse, LanguageCode, CurrencyCode } from '@/types/routes';
import { API_BASE_URL } from './api-config';

// ===============================
// HTTP Configuration
// ===============================

// Use configured API base URL from api-config
const GET_ROUTES_ENDPOINT = '/api/backend/routes/search';

// Backend now owns credentials; keep fields only for backward compatibility (ignored by backend)
const API_CREDENTIALS = { login: 'backend', password: 'backend' };

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  backoffMs: 1000
};

// ===============================
// Rate Limiting
// ===============================

class RateLimiter {
  private requests: number[] = [];
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = RATE_LIMIT.maxRequestsPerMinute;
  
  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    return this.requests.length < this.maxRequests;
  }
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
  
  getNextAvailableTime(): number {
    if (this.requests.length === 0) return 0;
    
    const oldest = Math.min(...this.requests);
    return oldest + this.windowMs - Date.now();
  }
}

const rateLimiter = new RateLimiter();

// ===============================
// XML Fallback Parser
// ===============================

/**
 * Simple XML to JSON parser for browser compatibility
 * Handles the basic structure returned by Bussystem API
 */
function parseXMLResponse(xmlText: string): Record<string, unknown> {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`XML Parse Error: ${parserError.textContent}`);
    }
    
    return xmlToJson(xmlDoc.documentElement);
  } catch (error) {
    console.error('XML parsing failed:', error);
    throw new Error(`Failed to parse XML response: ${error}`);
  }
}

function xmlToJson(element: Element): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Handle attributes
  if (element.attributes.length > 0) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      result[`@${attr.name}`] = attr.value;
    }
  }
  
  // Handle child nodes
  const children = element.children;
  const textContent = element.textContent?.trim();
  
  if (children.length === 0) {
    // Leaf node - return text content or empty string as a simple object
    return { value: textContent || '' } as Record<string, unknown>;
  }
  
  // Group children by tag name
  const childGroups: Record<string, Element[]> = {};
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const tagName = child.tagName.toLowerCase();
    
    if (!childGroups[tagName]) {
      childGroups[tagName] = [];
    }
    childGroups[tagName].push(child);
  }
  
  // Convert child groups
  for (const [tagName, elements] of Object.entries(childGroups)) {
    if (elements.length === 1) {
      result[tagName] = xmlToJson(elements[0]);
    } else {
      result[tagName] = elements.map(el => xmlToJson(el));
    }
  }
  
  return result;
}

// ===============================
// Response Validation
// ===============================

function validateResponse(data: unknown): RawGetRoutesResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response format');
  }
  
  const response = data as Record<string, unknown>;
  
  // Check for API errors
  if (response.result === 0 || response.result === '0') {
    const error = response.error as string || 'Unknown API error';
    throw new Error(error);
  }
  
  return response as RawGetRoutesResponse;
}

// ===============================
// Network Utilities
// ===============================

async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

function shouldRetry(error: Error, attempt: number): boolean {
  if (attempt >= 3) return false;
  
  // Retry on network errors but not on API errors
  return error.message.includes('timeout') ||
         error.message.includes('fetch') ||
         error.message.includes('network');
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===============================
// Main HTTP Client
// ===============================

/**
 * Fetch routes from Bussystem API with XML fallback
 */
export async function fetchRoutes(
  params: Partial<GetRoutesRequest>
): Promise<RawGetRoutesResponse> {
  // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getNextAvailableTime();
    throw new Error(`Rate limited. Try again in ${Math.ceil(waitTime / 1000)} seconds`);
  }
  
  // Prepare request body
  const requestBody = {
    // Force JSON response
    json: 1,
    // Default API version and language
    v: '1.1',
    lang: 'en',
    // Merge credentials
    ...API_CREDENTIALS,
    // Merge user parameters
    ...params
  };
  
  const url = `${API_BASE_URL}${GET_ROUTES_ENDPOINT}`;
  let lastError: Error;
  
  // Retry logic
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Record rate limit
      rateLimiter.recordRequest();
      
      console.log(`🚌 GET ROUTES attempt ${attempt}:`, {
        url,
        params: { ...requestBody, password: '***' }
      });
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Backend expects: id_from, id_to, date, lang, currency, etc. (no need json=1 but harmless)
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
  const parsedData = await response.json();
      
      // Validate and return
      const validatedResponse = validateResponse(parsedData);
      console.log('✅ Response validated:', {
        result: validatedResponse.result,
        itemCount: validatedResponse.item?.length || 0,
        session: validatedResponse.session
      });
      
      return validatedResponse;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ GET ROUTES attempt ${attempt} failed:`, lastError.message);
      
      if (!shouldRetry(lastError, attempt)) {
        break;
      }
      
      // Wait before retry
      await delay(RATE_LIMIT.backoffMs * attempt);
    }
  }
  
  // All attempts failed
  throw lastError!;
}

// ===============================
// Convenience Functions
// ===============================

/**
 * Search for bus routes between cities
 */
export async function searchBusRoutes(params: {
  from: string | number;
  to: string | number;
  date: string;
  currency?: string;
  language?: LanguageCode;
  allowTransfers?: boolean;
  onlyByStations?: boolean;
  ws?: 0 | 1 | 2;
}): Promise<RawGetRoutesResponse> {
  const requestParams: Partial<GetRoutesRequest> = {
    id_from: params.from,
    id_to: params.to,
    date: params.date,
    trans: 'bus',
    currency: (params.currency as CurrencyCode) || 'EUR',
    lang: params.language || 'en',
    ws: params.ws || 1, // Start with fast search
    change: params.allowTransfers ? 'auto' : undefined,
    only_by_stations: params.onlyByStations ? 1 : 0
  };
  
  return fetchRoutes(requestParams);
}

/**
 * Revalidate specific route without transfers
 */
export async function revalidateRoute(params: {
  routeId: string | number;
  from: string | number;
  to: string | number;
  date: string;
  currency?: string;
  language?: LanguageCode;
}): Promise<RawGetRoutesResponse> {
  const requestParams: Partial<GetRoutesRequest> = {
    route_id: params.routeId,
    id_from: params.from,
    id_to: params.to,
    date: params.date,
    trans: 'bus',
    currency: (params.currency as CurrencyCode) || 'EUR',
    lang: params.language || 'en',
    ws: 1,
    // NO 'change' parameter for revalidation
  };
  
  return fetchRoutes(requestParams);
}

/**
 * Search with period flexibility (if supported)
 */
export async function searchRoutesWithPeriod(params: {
  from: string | number;
  to: string | number;
  date: string;
  period: number; // -3 to 14
  currency?: string;
  language?: LanguageCode;
}): Promise<RawGetRoutesResponse> {
  const requestParams: Partial<GetRoutesRequest> = {
    id_from: params.from,
    id_to: params.to,
    date: params.date,
    period: params.period,
    trans: 'bus',
    currency: (params.currency as CurrencyCode) || 'EUR',
    lang: params.language || 'en',
    ws: 1
  };
  
  return fetchRoutes(requestParams);
}

// ===============================
// Export Types for External Use
// ===============================

export type { GetRoutesRequest, RawGetRoutesResponse };
export { RATE_LIMIT };
