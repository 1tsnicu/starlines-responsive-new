/**
 * GET BAGGAGE API CLIENT
 * 
 * Client pentru API get_baggage cu caching inteligent și gestiunea stării
 * Integrare cu getBaggageHttp și normalizeGetBaggage
 */

import { 
  getBaggage,
  type GetBaggageConfig
} from '@/lib/getBaggageHttp';
import { 
  normalizeGetBaggageResponse,
  validateNormalizedBaggage
} from '@/lib/normalizeGetBaggage';
import type {
  GetBaggageRequest,
  NormalizedBaggageResponse,
  RawGetBaggageResponse,
  BaggageItem,
  BaggageGroup,
  BaggageQuickStats
} from '@/types/getBaggage';

// ===============================
// Cache Management
// ===============================

interface BaggageCacheEntry {
  data: NormalizedBaggageResponse;
  timestamp: number;
  expires_at: number;
  request_key: string;
}

class BaggageCache {
  private cache = new Map<string, BaggageCacheEntry>();
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 100;

  private generateCacheKey(request: GetBaggageRequest): string {
    const parts = [
      `interval:${request.interval_id}`,
      request.station_from_id ? `from:${request.station_from_id}` : '',
      request.station_to_id ? `to:${request.station_to_id}` : '',
      request.currency ? `curr:${request.currency}` : '',
      request.lang ? `lang:${request.lang}` : ''
    ].filter(Boolean);
    
    return parts.join('|');
  }

  set(request: GetBaggageRequest, data: NormalizedBaggageResponse, customTTL?: number): void {
    const key = this.generateCacheKey(request);
    const ttl = customTTL || this.DEFAULT_TTL;
    const now = Date.now();

    // Clean old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expires_at: now + ttl,
      request_key: key
    });
  }

  get(request: GetBaggageRequest): NormalizedBaggageResponse | null {
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expires_at) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(request?: GetBaggageRequest): void {
    if (request) {
      const key = this.generateCacheKey(request);
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now > entry.expires_at) {
        this.cache.delete(key);
      }
    });
    
    // If still over limit, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE + 10);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats(): {
    total_entries: number;
    cache_hit_ratio: string;
    oldest_entry: number;
    newest_entry: number;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      total_entries: entries.length,
      cache_hit_ratio: "N/A", // Would need hit/miss tracking
      oldest_entry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newest_entry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }
}

// Global cache instance
const baggageCache = new BaggageCache();

// ===============================
// API Client State Management
// ===============================

interface BaggageApiState {
  loading: boolean;
  error: string | null;
  lastRequest: GetBaggageRequest | null;
  lastResponse: NormalizedBaggageResponse | null;
  requestCount: number;
  cacheHitCount: number;
}

const apiState: BaggageApiState = {
  loading: false,
  error: null,
  lastRequest: null,
  lastResponse: null,
  requestCount: 0,
  cacheHitCount: 0
};

// ===============================
// Main API Functions
// ===============================

/**
 * Retrieve baggage information with caching and normalization
 */
export async function fetchBaggageInfo(
  request: GetBaggageRequest,
  options: {
    useCache?: boolean;
    cacheCustomTTL?: number;
    config?: Partial<GetBaggageConfig>;
  } = {}
): Promise<NormalizedBaggageResponse> {
  const { 
    useCache = true, 
    cacheCustomTTL,
    config = {}
  } = options;

  // Update state
  apiState.loading = true;
  apiState.error = null;
  apiState.lastRequest = request;
  apiState.requestCount++;

  try {
    // Check cache first
    if (useCache) {
      const cached = baggageCache.get(request);
      if (cached) {
        apiState.cacheHitCount++;
        apiState.loading = false;
        apiState.lastResponse = cached;
        return cached;
      }
    }

    // Make API request
    const rawResponse = await getBaggage(request.interval_id, {
      station_from_id: request.station_from_id,
      station_to_id: request.station_to_id,
      currency: request.currency,
      lang: request.lang,
      ...config
    });
    
    // Normalize response
    const normalized = normalizeGetBaggageResponse(rawResponse);
    
    // Validate normalized data
    if (!validateNormalizedBaggage(normalized.baggage_items)) {
      throw new Error('Invalid baggage data received from API');
    }

    const result: NormalizedBaggageResponse = {
      ...normalized,
      request_info: {
        interval_id: request.interval_id,
        station_from_id: request.station_from_id,
        station_to_id: request.station_to_id,
        currency: request.currency,
        lang: request.lang,
        request_timestamp: Date.now(),
        cache_used: false
      }
    };

    // Cache the result
    if (useCache) {
      baggageCache.set(request, result, cacheCustomTTL);
    }

    // Update state
    apiState.loading = false;
    apiState.lastResponse = result;
    
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    apiState.loading = false;
    apiState.error = errorMessage;
    apiState.lastResponse = null;
    
    throw new Error(`Failed to fetch baggage info: ${errorMessage}`);
  }
}

/**
 * Prefetch baggage data for multiple intervals (for optimization)
 */
export async function prefetchBaggageInfo(
  requests: GetBaggageRequest[],
  options: {
    concurrent?: number;
    ignoreErrors?: boolean;
    cacheCustomTTL?: number;
  } = {}
): Promise<Array<{ request: GetBaggageRequest; success: boolean; error?: string }>> {
  const { 
    concurrent = 3, 
    ignoreErrors = true,
    cacheCustomTTL 
  } = options;

  const results: Array<{ request: GetBaggageRequest; success: boolean; error?: string }> = [];
  
  // Process in batches to respect rate limits
  for (let i = 0; i < requests.length; i += concurrent) {
    const batch = requests.slice(i, i + concurrent);
    
    const batchPromises = batch.map(async (request) => {
      try {
        await fetchBaggageInfo(request, { 
          useCache: true,
          cacheCustomTTL 
        });
        return { request, success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { 
          request, 
          success: false, 
          error: errorMessage 
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // If not ignoring errors and we have failures, break
    if (!ignoreErrors && batchResults.some(r => !r.success)) {
      break;
    }

    // Small delay between batches to respect rate limits
    if (i + concurrent < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Get API client statistics and state
 */
export function getBaggageApiStats(): {
  state: BaggageApiState;
  cache: ReturnType<BaggageCache['getStats']>;
  performance: {
    cache_hit_ratio: number;
    average_response_time: string;
    total_requests: number;
  };
} {
  const cacheStats = baggageCache.getStats();
  const cacheHitRatio = apiState.requestCount > 0 
    ? (apiState.cacheHitCount / apiState.requestCount) * 100 
    : 0;

  return {
    state: { ...apiState },
    cache: cacheStats,
    performance: {
      cache_hit_ratio: Math.round(cacheHitRatio * 100) / 100,
      average_response_time: "N/A", // Would need timing tracking
      total_requests: apiState.requestCount
    }
  };
}

/**
 * Clear all cached baggage data
 */
export function clearBaggageCache(): void {
  baggageCache.invalidate();
}

/**
 * Clear cache for specific request
 */
export function clearSpecificBaggageCache(request: GetBaggageRequest): void {
  baggageCache.invalidate(request);
}

// ===============================
// Utility Functions
// ===============================

/**
 * Check if baggage should be requested for an interval
 * Based on get_routes response indicating request_get_baggage = 1
 */
export function shouldRequestBaggage(routeData: { request_get_baggage?: number | string }): boolean {
  const value = routeData.request_get_baggage;
  return value === 1 || value === "1";
}

/**
 * Build baggage request from route interval data
 */
export function buildBaggageRequestFromInterval(
  intervalId: string,
  options: {
    stationFromId?: string;
    stationToId?: string;
    currency?: "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
    lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";
  } = {}
): GetBaggageRequest {
  return {
    interval_id: intervalId,
    station_from_id: options.stationFromId,
    station_to_id: options.stationToId,
    currency: (options.currency || 'EUR') as "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK",
    lang: (options.lang || 'ro') as "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro"
  };
}

/**
 * Calculate total baggage cost for selected items
 */
export function calculateBaggageCost(
  selectedItems: Array<{ baggage_id: string; quantity: number }>,
  availableItems: BaggageItem[]
): {
  total_cost: number;
  currency: string;
  breakdown: Array<{
    baggage_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    title: string;
  }>;
} {
  const breakdown: Array<{
    baggage_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    title: string;
  }> = [];

  let totalCost = 0;
  let currency = 'EUR';

  selectedItems.forEach(selected => {
    const item = availableItems.find(b => b.baggage_id === selected.baggage_id);
    if (!item) return;

    const unitPrice = item.price;
    const totalPrice = unitPrice * selected.quantity;
    
    totalCost += totalPrice;
    currency = item.currency || currency;

    breakdown.push({
      baggage_id: selected.baggage_id,
      quantity: selected.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      title: item.baggage_title || `Bagaj ${item.baggage_id}`
    });
  });

  return {
    total_cost: Math.round(totalCost * 100) / 100, // Round to 2 decimals
    currency,
    breakdown
  };
}

/**
 * Validate baggage selection against limits
 */
export function validateBaggageSelection(
  selectedItems: Array<{ baggage_id: string; quantity: number }>,
  availableItems: BaggageItem[]
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  selectedItems.forEach(selected => {
    const item = availableItems.find(b => b.baggage_id === selected.baggage_id);
    if (!item) {
      errors.push(`Bagaj ${selected.baggage_id} nu este disponibil`);
      return;
    }

    // Check max_per_person limit
    if (item.max_per_person && selected.quantity > item.max_per_person) {
      errors.push(
        `${item.baggage_title || 'Bagaj'}: maxim ${item.max_per_person} per persoană (selectat: ${selected.quantity})`
      );
    }

    // Check max_in_bus limit (warning only - depends on other passengers)
    if (item.max_in_bus && selected.quantity > item.max_in_bus) {
      warnings.push(
        `${item.baggage_title || 'Bagaj'}: maxim ${item.max_in_bus} per autobuz`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ===============================
// React Hooks (Optional)
// ===============================

/**
 * Hook for tracking API state (if using React)
 * This would typically be in a separate file
 */
export function getBaggageApiState(): BaggageApiState {
  return { ...apiState };
}
