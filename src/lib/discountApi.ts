/**
 * GET DISCOUNT API CLIENT
 * 
 * Client pentru API get_discount cu caching inteligent și gestiunea stării
 * Integrare cu getDiscountHttp și normalizeGetDiscount
 */

import { 
  getDiscount
} from '@/lib/getDiscountHttp';
import { 
  normalizeGetDiscountResponse,
  validateNormalizedDiscounts
} from '@/lib/normalizeGetDiscount';
import type {
  GetDiscountRequest,
  GetDiscountConfig,
  NormalizedDiscountResponse,
  RawGetDiscountResponse,
  DiscountItem,
  DiscountCacheKey,
  DiscountCacheEntry,
  DiscountCacheStats
} from '@/types/getDiscount';

// ===============================
// Cache Management
// ===============================

interface DiscountCacheEntryInternal {
  data: NormalizedDiscountResponse;
  timestamp: number;
  ttl: number;
  access_count: number;
  last_accessed: number;
}

class DiscountCache {
  private cache = new Map<string, DiscountCacheEntryInternal>();
  private readonly defaultTTL = 15 * 60 * 1000; // 15 minute
  private readonly maxEntries = 100;
  
  private generateKey(request: GetDiscountRequest): string {
    const { interval_id, currency = 'EUR', lang = 'en' } = request;
    return `discount:${interval_id}:${currency}:${lang}`;
  }
  
  get(request: GetDiscountRequest): NormalizedDiscountResponse | null {
    const key = this.generateKey(request);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access stats
    entry.access_count++;
    entry.last_accessed = now;
    
    return entry.data;
  }
  
  set(
    request: GetDiscountRequest, 
    data: NormalizedDiscountResponse, 
    customTTL?: number
  ): void {
    const key = this.generateKey(request);
    const now = Date.now();
    
    // Determine TTL based on data characteristics
    const ttl = customTTL || this.calculateTTL(data);
    
    const entry: DiscountCacheEntryInternal = {
      data,
      timestamp: now,
      ttl,
      access_count: 1,
      last_accessed: now
    };
    
    this.cache.set(key, entry);
    
    // Cleanup if cache is too large
    this.cleanup();
  }
  
  private calculateTTL(data: NormalizedDiscountResponse): number {
    // Base TTL
    let ttl = this.defaultTTL;
    
    // Adjust based on number of discounts
    if (data.discounts.length === 0) {
      ttl = 5 * 60 * 1000; // 5 minute pentru răspunsuri goale
    } else if (data.discounts.length > 10) {
      ttl = 30 * 60 * 1000; // 30 minute pentru răspunsuri complexe
    }
    
    // Adjust based on discount types
    const hasComplexDiscounts = data.discounts.some(d => 
      d.type === 'group' || d.requires_document || d.age_min !== undefined
    );
    
    if (hasComplexDiscounts) {
      ttl = Math.max(ttl, 20 * 60 * 1000); // Minim 20 minute pentru discounturi complexe
    }
    
    return ttl;
  }
  
  private cleanup(): void {
    if (this.cache.size <= this.maxEntries) {
      return;
    }
    
    // Sort by last accessed time and remove oldest
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.last_accessed - b.last_accessed);
    
    const toRemove = entries.slice(0, entries.length - this.maxEntries);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): DiscountCacheStats {
    const entries = Array.from(this.cache.values());
    const totalAccess = entries.reduce((sum, entry) => sum + entry.access_count, 0);
    const totalEntries = entries.length;
    
    return {
      total_entries: totalEntries,
      hit_rate: totalAccess > 0 ? Math.round((totalAccess / (totalAccess + totalEntries)) * 100) : 0,
      memory_usage: this.estimateMemoryUsage()
    };
  }
  
  private estimateMemoryUsage(): number {
    // Rough estimation în KB
    return this.cache.size * 2; // ~2KB per entry estimation
  }
}

// Global cache instance
const discountCache = new DiscountCache();

// ===============================
// API Statistics
// ===============================

interface DiscountApiStats {
  requests: {
    total: number;
    successful: number;
    failed: number;
    cache_hits: number;
  };
  performance: {
    average_response_time: number;
    total_requests: number;
    cache_hit_ratio: number;
  };
  cache: DiscountCacheStats;
  state: {
    loading: boolean;
    last_request: number;
    error: string | null;
  };
}

const apiStats: DiscountApiStats = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    cache_hits: 0
  },
  performance: {
    average_response_time: 0,
    total_requests: 0,
    cache_hit_ratio: 0
  },
  cache: {
    total_entries: 0,
    hit_rate: 0,
    memory_usage: 0
  },
  state: {
    loading: false,
    last_request: 0,
    error: null
  }
};

function updateApiStats(
  success: boolean, 
  fromCache: boolean, 
  responseTime?: number, 
  error?: string
): void {
  apiStats.requests.total++;
  apiStats.state.last_request = Date.now();
  
  if (success) {
    apiStats.requests.successful++;
    apiStats.state.error = null;
  } else {
    apiStats.requests.failed++;
    apiStats.state.error = error || 'Unknown error';
  }
  
  if (fromCache) {
    apiStats.requests.cache_hits++;
  }
  
  if (responseTime !== undefined) {
    const totalTime = apiStats.performance.average_response_time * apiStats.performance.total_requests;
    apiStats.performance.total_requests++;
    apiStats.performance.average_response_time = (totalTime + responseTime) / apiStats.performance.total_requests;
  }
  
  // Update cache hit ratio
  apiStats.performance.cache_hit_ratio = apiStats.requests.total > 0 
    ? Math.round((apiStats.requests.cache_hits / apiStats.requests.total) * 100)
    : 0;
  
  // Update cache stats
  apiStats.cache = discountCache.getStats();
}

// ===============================
// Main API Functions
// ===============================

export async function fetchDiscountInfo(
  request: GetDiscountRequest,
  options: {
    useCache?: boolean;
    cacheCustomTTL?: number;
    config?: Partial<GetDiscountConfig>;
  } = {}
): Promise<NormalizedDiscountResponse> {
  const { 
    useCache = true, 
    cacheCustomTTL,
    config = {}
  } = options;
  
  apiStats.state.loading = true;
  const startTime = Date.now();
  
  try {
    // Check cache first
    if (useCache) {
      const cached = discountCache.get(request);
      if (cached) {
        updateApiStats(true, true);
        apiStats.state.loading = false;
        return cached;
      }
    }
    
    // Make API request
    const rawResponse: RawGetDiscountResponse = await getDiscount(request, {
      timeout: 10000,
      retryAttempts: 2,
      retryDelay: 1000,
      useXmlFallback: true,
      ...config
    });
    
    // Normalize response
    const cacheKey = `${request.interval_id}:${request.currency || 'EUR'}:${request.lang || 'en'}`;
    const normalizedResponse = normalizeGetDiscountResponse(rawResponse, cacheKey);
    
    // Validate normalized data
    const validation = validateNormalizedDiscounts(normalizedResponse);
    if (!validation.valid) {
      console.warn('Discount validation warnings:', validation.errors, validation.warnings);
    }
    
    // Cache the response
    if (useCache) {
      discountCache.set(request, normalizedResponse, cacheCustomTTL);
    }
    
    const responseTime = Date.now() - startTime;
    updateApiStats(true, false, responseTime);
    apiStats.state.loading = false;
    
    return normalizedResponse;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    updateApiStats(false, false, responseTime, errorMessage);
    apiStats.state.loading = false;
    
    console.error('Error fetching discount info:', error);
    throw error;
  }
}

// ===============================
// Utility Functions
// ===============================

export async function prefetchDiscountInfo(
  requests: GetDiscountRequest[],
  config?: Partial<GetDiscountConfig>
): Promise<void> {
  // Prefetch multiple discount requests in parallel
  const promises = requests.map(request => 
    fetchDiscountInfo(request, { useCache: true, config })
      .catch(error => {
        console.warn(`Failed to prefetch discounts for ${request.interval_id}:`, error);
        return null;
      })
  );
  
  await Promise.allSettled(promises);
}

export function getDiscountApiStats(): DiscountApiStats {
  return {
    ...apiStats,
    cache: discountCache.getStats()
  };
}

export function clearDiscountCache(): void {
  discountCache.clear();
  
  // Reset cache-related stats
  apiStats.requests.cache_hits = 0;
  apiStats.performance.cache_hit_ratio = 0;
  apiStats.cache = discountCache.getStats();
}

// ===============================
// Selection Validation
// ===============================

export function validateDiscountSelection(
  discount: DiscountItem,
  passengerAge?: number,
  totalPassengers?: number,
  hasDocument?: boolean
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Age validation
  if (discount.age_min !== undefined || discount.age_max !== undefined) {
    if (passengerAge === undefined) {
      errors.push('Vârsta pasagerului este necesară pentru acest discount');
    } else {
      if (discount.age_min !== undefined && passengerAge < discount.age_min) {
        errors.push(`Vârsta minimă pentru acest discount este ${discount.age_min} ani`);
      }
      
      if (discount.age_max !== undefined && passengerAge > discount.age_max) {
        errors.push(`Vârsta maximă pentru acest discount este ${discount.age_max} ani`);
      }
    }
  }
  
  // Group size validation
  if (discount.min_passengers !== undefined) {
    if (totalPassengers === undefined) {
      warnings.push('Numărul total de pasageri nu este specificat');
    } else if (totalPassengers < discount.min_passengers) {
      errors.push(`Acest discount necesită minim ${discount.min_passengers} pasageri (aveți ${totalPassengers})`);
    }
  }
  
  // Document validation
  if (discount.requires_document && !hasDocument) {
    errors.push('Acest discount necesită un document valid');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ===============================
// Quick Access Functions
// ===============================

export function findDiscountById(
  discounts: DiscountItem[], 
  discountId: string
): DiscountItem | undefined {
  return discounts.find(d => d.discount_id === discountId);
}

export function getApplicableDiscounts(
  discounts: DiscountItem[],
  passengerAge?: number,
  totalPassengers?: number,
  hasDocument?: boolean
): DiscountItem[] {
  return discounts.filter(discount => {
    const validation = validateDiscountSelection(
      discount, 
      passengerAge, 
      totalPassengers, 
      hasDocument
    );
    return validation.valid;
  });
}

export function calculateDiscountSavings(
  discounts: DiscountItem[],
  basePrice: number = 100
): Array<{
  discount: DiscountItem;
  absolute_savings: number;
  percentage_savings: number;
  final_price: number;
}> {
  return discounts.map(discount => {
    const absolute_savings = Math.min(discount.price, basePrice);
    const percentage_savings = basePrice > 0 ? (absolute_savings / basePrice) * 100 : 0;
    const final_price = basePrice - absolute_savings;
    
    return {
      discount,
      absolute_savings,
      percentage_savings,
      final_price
    };
  });
}

// ===============================
// Main API Export
// ===============================

export const discountApi = {
  fetchDiscountInfo,
  getApplicableDiscounts,
  validateDiscountSelection,
  prefetchDiscountInfo,
  clearCache: () => discountCache.clear(),
  getCacheStats: () => discountCache.getStats()
};

export default discountApi;
