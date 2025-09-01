// HTTP client for Bussystem API with XML fallback
// Handles both JSON and XML responses with proper error handling

import type { PointsApiError } from '../types/points';

// Base API configuration
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/bussystem'  // Use Vite proxy in development
  : 'https://test-api.bussystem.eu/server';  // Direct API in production

// Debug logging
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// API credentials (in production, these should come from backend proxy)
const API_CREDENTIALS = {
  login: import.meta.env.VITE_BUSSYSTEM_LOGIN || 'test_login',
  password: import.meta.env.VITE_BUSSYSTEM_PASSWORD || 'test_password'
};

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  forceJson?: boolean;
}

export class ApiHttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiHttpError';
  }
}

/**
 * Makes a POST request to Bussystem API with automatic JSON/XML handling
 */
export async function apiPost<T>(
  path: string, 
  body: Record<string, unknown>, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeout = 30000, retries = 2, forceJson = true } = options;
  
  const url = `${API_BASE_URL}${path}`;
  const requestBody = {
    ...API_CREDENTIALS,
    json: forceJson ? 1 : undefined,
    ...body
  };

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Starlight-Routes/1.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiHttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const responseText = await response.text();
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(responseText);
        
        // Check for API-level errors in JSON response
        if (jsonData.error || (typeof jsonData === 'object' && jsonData.root?.error)) {
          const errorMsg = jsonData.error || jsonData.root.error;
          throw new ApiHttpError(
            `API Error: ${errorMsg}`,
            response.status,
            errorMsg
          );
        }
        
        return jsonData as T;
      } catch (jsonError) {
        // If JSON parsing fails, try XML
        if (responseText.trim().startsWith('<')) {
          try {
            const xmlData = await parseXmlResponse<T>(responseText);
            
            // Check for XML errors
            if (typeof xmlData === 'object' && xmlData && 'error' in xmlData) {
              const errorData = xmlData as { error: string };
              throw new ApiHttpError(
                `API Error: ${errorData.error}`,
                response.status,
                errorData.error
              );
            }
            
            return xmlData;
          } catch (xmlError) {
            throw new ApiHttpError(
              'Failed to parse XML response',
              response.status,
              'PARSE_ERROR',
              xmlError instanceof Error ? xmlError : new Error(String(xmlError))
            );
          }
        } else {
          // Neither JSON nor XML
          throw new ApiHttpError(
            'Invalid response format',
            response.status,
            'INVALID_FORMAT'
          );
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (error instanceof ApiHttpError) {
        // Don't retry on API errors (auth, etc.)
        throw error;
      }
      
      if (attempt === retries) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new ApiHttpError(
    `Request failed after ${retries + 1} attempts`,
    undefined,
    'MAX_RETRIES_EXCEEDED',
    lastError || undefined
  );
}

/**
 * Parse XML response to JSON
 * In production, this should be done on the server side with proper XML parser
 */
async function parseXmlResponse<T>(xml: string): Promise<T> {
  // For browser environment, we'll implement a basic XML parser
  // In production, use xml2js or similar on the server
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Check for XML parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`XML Parse Error: ${parseError.textContent}`);
    }
    
    // Convert XML to JSON
    const result = xmlToJson(doc.documentElement);
    return result as T;
  } catch (error) {
    throw new Error(`XML parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert XML DOM element to JSON object
 */
export function xmlToJson(element: Element): unknown;
/**
 * Convert XML string to JSON object
 */
export function xmlToJson(xmlString: string): unknown;
export function xmlToJson(input: Element | string): unknown {
  if (typeof input === 'string') {
    // Parse XML string first
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/xml');
    
    // Check for XML parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`XML Parse Error: ${parseError.textContent}`);
    }
    
    return xmlToJson(doc.documentElement);
  }
  
  const element = input;
  const result: Record<string, unknown> = {};
  
  // Handle attributes
  if (element.attributes && element.attributes.length > 0) {
    result['@attributes'] = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      (result['@attributes'] as Record<string, string>)[attr.name] = attr.value;
    }
  }
  
  // Handle child elements
  if (element.children && element.children.length > 0) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const childName = child.tagName;
      const childValue = xmlToJson(child);
      
      if (result[childName]) {
        // Multiple children with same name - convert to array
        if (!Array.isArray(result[childName])) {
          result[childName] = [result[childName]];
        }
        (result[childName] as unknown[]).push(childValue);
      } else {
        result[childName] = childValue;
      }
    }
  } else {
    // Leaf node - get text content
    const textContent = element.textContent?.trim();
    if (textContent) {
      // Try to convert to number if possible
      const numValue = Number(textContent);
      return !isNaN(numValue) && isFinite(numValue) ? numValue : textContent;
    }
    return null;
  }
  
  return result;
}

/**
 * Utility function to create cache keys
 */
export function createCacheKey(path: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);
  
  return `${path}:${JSON.stringify(sortedParams)}`;
}

/**
 * Utility function to check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof ApiHttpError) {
    // Don't retry auth errors or invalid requests
    if (error.status && error.status >= 400 && error.status < 500) {
      return false;
    }
    
    // Don't retry specific API errors
    if (error.code === 'dealer_no_activ' || error.code === 'INVALID_FORMAT') {
      return false;
    }
  }
  
  return true;
}

/**
 * Debug helper to log API requests (development only)
 */
export function logApiRequest(path: string, body: Record<string, unknown>, response?: unknown, error?: Error): void {
  if (import.meta.env?.DEV) {
    console.group(`🌐 API Request: ${path}`);
    console.log('📤 Request body:', { ...body, password: '***' });
    if (response) {
      console.log('📥 Response:', response);
    }
    if (error) {
      console.error('❌ Error:', error);
    }
    console.groupEnd();
  }
}
