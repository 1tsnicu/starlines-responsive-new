/**
 * ROUTES API CLIENT
 * 
 * Client principal pentru get_routes cu:
 * - Caching intelligent multi-nivel
 * - Rate limiting și fallback ws modes
 * - Error handling și retry logic
 * - Integrare completă cu normalizatorul
 */

import { 
  searchBusRoutes, 
  revalidateRoute, 
  searchRoutesWithPeriod,
  type RawGetRoutesResponse 
} from '@/lib/routesHttp';
import { 
  normalizeRoutesResponse, 
  filterValidOptions,
  type RouteOption 
} from '@/lib/normalizeRoutes';
import type { 
  RouteSearchState, 
  RouteSearchFilters, 
  RouteSearchError,
  ROUTE_ERROR_CODES,
  LanguageCode,
  CurrencyCode,
  WSMode 
} from '@/types/routes';

// ===============================
// Cache Configuration
// ===============================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
  searchParams: string; // serialized params for key
}

interface RoutesCache {
  searches: Map<string, CacheEntry<RouteOption[]>>;
  revalidations: Map<string, CacheEntry<RouteOption>>;
  metadata: Map<string, CacheEntry<{ session?: string; period_supported: boolean }>>;
}

const CACHE_TTL = {
  SEARCH_RESULTS: 2 * 60 * 1000, // 2 minutes
  REVALIDATION: 30 * 1000, // 30 seconds  
  METADATA: 10 * 60 * 1000, // 10 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000 // 5 minutes
};

class RouteCacheManager {
  private cache: RoutesCache = {
    searches: new Map(),
    revalidations: new Map(), 
    metadata: new Map()
  };
  
  private cleanupInterval?: number;
  
  constructor() {
    this.startCleanup();
  }
  
  private startCleanup(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, CACHE_TTL.CLEANUP_INTERVAL);
  }
  
  private cleanup(): void {
    const now = Date.now();
    
    // Clean expired search results
    for (const [key, entry] of this.cache.searches.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.searches.delete(key);
      }
    }
    
    // Clean expired revalidations
    for (const [key, entry] of this.cache.revalidations.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.revalidations.delete(key);
      }
    }
    
    // Clean expired metadata
    for (const [key, entry] of this.cache.metadata.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.metadata.delete(key);
      }
    }
    
    console.log('🧹 Cache cleanup completed', {
      searches: this.cache.searches.size,
      revalidations: this.cache.revalidations.size,
      metadata: this.cache.metadata.size
    });
  }
  
  private generateSearchKey(params: RouteSearchParams): string {
    return `search-${params.from}-${params.to}-${params.date}-${params.currency}-${params.language}-${params.allowTransfers}-${params.onlyByStations}-${params.ws}`;
  }
  
  private generateRevalidationKey(params: RouteRevalidationParams): string {
    return `revalidate-${params.routeId}-${params.from}-${params.to}-${params.date}-${params.currency}-${params.language}`;
  }
  
  getSearchResults(params: RouteSearchParams): RouteOption[] | null {
    const key = this.generateSearchKey(params);
    const entry = this.cache.searches.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.searches.delete(key);
      return null;
    }
    
    console.log('💾 Cache HIT for search:', key);
    return entry.data;
  }
  
  setSearchResults(params: RouteSearchParams, data: RouteOption[]): void {
    const key = this.generateSearchKey(params);
    this.cache.searches.set(key, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL.SEARCH_RESULTS,
      searchParams: JSON.stringify(params)
    });
    console.log('💾 Cache SET for search:', key, `${data.length} options`);
  }
  
  getRevalidation(params: RouteRevalidationParams): RouteOption | null {
    const key = this.generateRevalidationKey(params);
    const entry = this.cache.revalidations.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.revalidations.delete(key);
      return null;
    }
    
    console.log('💾 Cache HIT for revalidation:', key);
    return entry.data;
  }
  
  setRevalidation(params: RouteRevalidationParams, data: RouteOption): void {
    const key = this.generateRevalidationKey(params);
    this.cache.revalidations.set(key, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL.REVALIDATION,
      searchParams: JSON.stringify(params)
    });
    console.log('💾 Cache SET for revalidation:', key);
  }
  
  clear(): void {
    this.cache.searches.clear();
    this.cache.revalidations.clear();
    this.cache.metadata.clear();
    console.log('🗑️  Cache cleared');
  }
  
  getStats() {
    return {
      searches: this.cache.searches.size,
      revalidations: this.cache.revalidations.size,
      metadata: this.cache.metadata.size
    };
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache instance
const cacheManager = new RouteCacheManager();

// ===============================
// Search Parameters
// ===============================

export interface RouteSearchParams {
  from: string | number;
  to: string | number;
  date: string; // YYYY-MM-DD
  currency?: CurrencyCode;
  language?: LanguageCode;
  allowTransfers?: boolean;
  onlyByStations?: boolean;
  ws?: WSMode;
  period?: number; // for flexible search
}

export interface RouteRevalidationParams {
  routeId: string | number;
  from: string | number;
  to: string | number;
  date: string;
  currency?: CurrencyCode;
  language?: LanguageCode;
}

// ===============================
// Error Handling
// ===============================

function createRouteError(
  code: keyof typeof ROUTE_ERROR_CODES,
  message: string,
  userMessage: string,
  retry: boolean = false
): RouteSearchError {
  return {
    code,
    message,
    user_message: userMessage,
    retry_suggested: retry
  };
}

function mapApiError(error: Error): RouteSearchError {
  const message = error.message.toLowerCase();
  
  if (message.includes('dealer_no_activ')) {
    return createRouteError(
      'DEALER_NO_ACTIV',
      error.message,
      'Account temporarily unavailable. Please try again later.'
    );
  }
  
  if (message.includes('route_no_activ')) {
    return createRouteError(
      'ROUTE_NO_ACTIV', 
      error.message,
      'Routes are not available for this search.'
    );
  }
  
  if (message.includes('currency_no_activ')) {
    return createRouteError(
      'CURRENCY_NO_ACTIV',
      error.message, 
      'Selected currency is not supported.'
    );
  }
  
  if (message.includes('interval_no_found')) {
    return createRouteError(
      'INTERVAL_NO_FOUND',
      error.message,
      'No routes found for the selected criteria.'
    );
  }
  
  if (message.includes('date')) {
    return createRouteError(
      'DATE_INVALID',
      error.message,
      'Invalid date or date outside allowed range.'
    );
  }
  
  if (message.includes('rate limited')) {
    return createRouteError(
      'RATE_LIMITED',
      error.message,
      'Too many requests. Please wait a moment.',
      true
    );
  }
  
  if (message.includes('timeout') || message.includes('network') || message.includes('fetch')) {
    return createRouteError(
      'NETWORK_ERROR',
      error.message,
      'Network error. Please check your connection.',
      true
    );
  }
  
  return createRouteError(
    'PARSE_ERROR',
    error.message,
    'Error processing search results. Please try again.',
    true
  );
}

// ===============================
// Input Validation
// ===============================

function validateSearchParams(params: RouteSearchParams): void {
  if (!params.from || !params.to) {
    throw new Error('From and To locations are required');
  }
  
  if (!params.date) {
    throw new Error('Date is required');
  }
  
  // Date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  
  // Date range validation (not in past, not too far in future)
  const searchDate = new Date(params.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (searchDate < today) {
    throw new Error('Cannot search for dates in the past');
  }
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6); // 6 months ahead
  
  if (searchDate > maxDate) {
    throw new Error('Cannot search more than 6 months in advance');
  }
}

// ===============================
// Main API Functions
// ===============================

/**
 * Caută rute de autobus cu caching și fallback logic
 */
export async function searchRoutes(params: RouteSearchParams): Promise<RouteOption[]> {
  // Validate input
  validateSearchParams(params);
  
  // Check cache first
  const cached = cacheManager.getSearchResults(params);
  if (cached) {
    return cached;
  }
  
  console.log('🔍 Searching routes:', params);
  
  let lastError: Error;
  
  // Progressive fallback: 1 → 0 (avoid 2 unless explicitly requested)
  const wsModes: WSMode[] = params.ws === 2 ? [2] : [1, 0];
  
  for (const ws of wsModes) {
    try {
      console.log(`🚌 Trying ws=${ws} mode...`);
      
      const rawResponse = await searchBusRoutes({
        from: params.from,
        to: params.to,
        date: params.date,
        currency: params.currency,
        language: params.language,
        allowTransfers: params.allowTransfers,
        onlyByStations: params.onlyByStations,
        ws: ws
      });
      
      // Normalize response
      const options = normalizeRoutesResponse(rawResponse, !!params.allowTransfers);
      const validOptions = filterValidOptions(options);
      
      console.log(`✅ Found ${validOptions.length} valid route options (ws=${ws})`);
      
      // Cache results
      cacheManager.setSearchResults({ ...params, ws }, validOptions);
      
      return validOptions;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Search failed with ws=${ws}:`, lastError.message);
      
      // If it's not a network error, don't try other ws modes
      if (!lastError.message.includes('timeout') && 
          !lastError.message.includes('network') &&
          !lastError.message.includes('interval_no_found')) {
        break;
      }
    }
  }
  
  // All attempts failed
  throw mapApiError(lastError!);
}

/**
 * Revalidează o rută specifică fără conexiuni (pentru confirmare)
 */
export async function revalidateRouteOption(
  option: RouteOption, 
  params: Omit<RouteRevalidationParams, 'routeId'>
): Promise<RouteOption> {
  if (option.segments.length === 0) {
    throw new Error('Cannot revalidate option with no segments');
  }
  
  const firstSegment = option.segments[0];
  const revalidationParams = {
    routeId: firstSegment.route_id,
    ...params
  };
  
  // Check cache
  const cached = cacheManager.getRevalidation(revalidationParams);
  if (cached) {
    return cached;
  }
  
  console.log('🔍 Revalidating route:', revalidationParams);
  
  try {
    const rawResponse = await revalidateRoute(revalidationParams);
    
    // Normalize response (should return single option)
    const options = normalizeRoutesResponse(rawResponse, false); // no transfers used
    const validOptions = filterValidOptions(options);
    
    if (validOptions.length === 0) {
      throw new Error('Route is no longer available');
    }
    
    const revalidatedOption = validOptions[0];
    
    // Cache result
    cacheManager.setRevalidation(revalidationParams, revalidatedOption);
    
    console.log('✅ Route revalidated successfully');
    return revalidatedOption;
    
  } catch (error) {
    console.error('❌ Route revalidation failed:', error);
    throw mapApiError(error as Error);
  }
}

/**
 * Caută cu flexibilitate de perioadă (dacă suportat)
 */
export async function searchRoutesFlexible(
  params: RouteSearchParams & { period: number }
): Promise<RouteOption[]> {
  validateSearchParams(params);
  
  console.log('🔍 Searching routes with period flexibility:', params);
  
  try {
    const rawResponse = await searchRoutesWithPeriod({
      from: params.from,
      to: params.to,
      date: params.date,
      period: params.period,
      currency: params.currency,
      language: params.language
    });
    
    // Check if period is supported
    if (rawResponse.period_is_supported === 0) {
      console.warn('⚠️  Period search not supported, falling back to regular search');
      return searchRoutes(params);
    }
    
    const options = normalizeRoutesResponse(rawResponse, false);
    const validOptions = filterValidOptions(options);
    
    console.log(`✅ Found ${validOptions.length} flexible route options`);
    return validOptions;
    
  } catch (error) {
    console.error('❌ Flexible search failed:', error);
    throw mapApiError(error as Error);
  }
}

// ===============================
// Filter Functions
// ===============================

/**
 * Aplică filtre locale pe opțiunile de rute
 */
export function applyFilters(
  options: RouteOption[], 
  filters: RouteSearchFilters
): RouteOption[] {
  return options.filter(option => {
    // Departure time filter
    if (filters.departure_time) {
      const depTime = option.departure.time;
      if (filters.departure_time.from && depTime < filters.departure_time.from) return false;
      if (filters.departure_time.to && depTime > filters.departure_time.to) return false;
    }
    
    // Arrival time filter
    if (filters.arrival_time) {
      const arrTime = option.arrival.time;
      if (filters.arrival_time.from && arrTime < filters.arrival_time.from) return false;
      if (filters.arrival_time.to && arrTime > filters.arrival_time.to) return false;
    }
    
    // Duration filter
    if (filters.max_duration && option.duration) {
      const [hours, minutes] = option.duration.split(':').map(Number);
      const durationMinutes = hours * 60 + minutes;
      if (durationMinutes > filters.max_duration) return false;
    }
    
    // Transfer count filter
    if (filters.max_transfers !== undefined && option.transfer_count > filters.max_transfers) {
      return false;
    }
    
    // Direct only filter
    if (filters.direct_only && option.transfer_count > 0) {
      return false;
    }
    
    // Operator filter
    if (filters.operators && filters.operators.length > 0) {
      const hasOperator = option.carriers.some(carrier => 
        filters.operators!.includes(carrier)
      );
      if (!hasOperator) return false;
    }
    
    // Comfort features filter
    if (filters.comfort_features && filters.comfort_features.length > 0) {
      const hasFeatures = filters.comfort_features.every(feature =>
        option.comfort_features.includes(feature)
      );
      if (!hasFeatures) return false;
    }
    
    // E-ticket only filter
    if (filters.eticket_only && !option.eticket_available) {
      return false;
    }
    
    // Price range filter
    if (filters.price_range && option.price_from) {
      if (filters.price_range.min && option.price_from < filters.price_range.min) return false;
      if (filters.price_range.max && option.price_from > filters.price_range.max) return false;
    }
    
    return true;
  });
}

// ===============================
// Utility Functions
// ===============================

/**
 * Sortează opțiunile după criterii specifice
 */
export function sortRouteOptions(
  options: RouteOption[], 
  sortBy: 'time' | 'price' | 'duration' | 'transfers'
): RouteOption[] {
  const sorted = [...options];
  
  switch (sortBy) {
    case 'time':
      return sorted.sort((a, b) => a.departure.time.localeCompare(b.departure.time));
    
    case 'price':
      return sorted.sort((a, b) => {
        const priceA = a.price_from || Infinity;
        const priceB = b.price_from || Infinity;
        return priceA - priceB;
      });
    
    case 'duration':
      return sorted.sort((a, b) => {
        if (!a.duration || !b.duration) return 0;
        const durationA = a.duration.split(':').reduce((acc, val, i) => acc + (parseInt(val) * (i === 0 ? 60 : 1)), 0);
        const durationB = b.duration.split(':').reduce((acc, val, i) => acc + (parseInt(val) * (i === 0 ? 60 : 1)), 0);
        return durationA - durationB;
      });
    
    case 'transfers':
      return sorted.sort((a, b) => a.transfer_count - b.transfer_count);
    
    default:
      return sorted;
  }
}

/**
 * Obține statistici despre cache
 */
export function getCacheStats() {
  return cacheManager.getStats();
}

/**
 * Șterge cache-ul complet
 */
export function clearCache() {
  cacheManager.clear();
}

/**
 * Oprește cache manager-ul (cleanup)
 */
export function destroyCache() {
  cacheManager.destroy();
}

// ===============================
// Export Everything
// ===============================

export { createRouteError, mapApiError };
