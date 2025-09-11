// HTTP client for Bussystem API with XML fallback
// Handles both JSON and XML responses with proper error handling

import type { PointsApiError } from '../types/points';
import { BussPoint } from './bussystem';
import { API_BASE_URL } from './api-config';

// Debug logging
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// API credentials (in production, these should come from backend proxy)
// Support both legacy VITE_BUSSYSTEM_* and preferred VITE_BUSS_* variables
const API_CREDENTIALS = {
  login: (import.meta.env as any).VITE_BUSS_LOGIN || (import.meta.env as any).VITE_BUSSYSTEM_LOGIN || 'test_login',
  password: (import.meta.env as any).VITE_BUSS_PASSWORD || (import.meta.env as any).VITE_BUSSYSTEM_PASSWORD || 'test_password'
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
export const apiPost = async (endpoint: string, data: any) => {
  try {
    // Use configured API base URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Special fallback for get_points 500 errors - try form data
      if (endpoint.includes('get_points') && response.status === 500) {
        console.warn('get_points failed with JSON, trying form-encoded...');
        const formData = new URLSearchParams();
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
        
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

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
