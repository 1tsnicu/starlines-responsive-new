// Intelligent caching system for bus plans
// Optimizes performance and reduces API calls

import type {
  NormalizedPlanResponse,
  PlanCacheEntry,
  PlanCacheStats,
  GetPlanRequest
} from '@/types/getPlan';

import { createPlanCacheKey } from './getPlanHttp';

// Cache configuration
const CACHE_CONFIG = {
  max_entries: 100,
  default_ttl_ms: 30 * 60 * 1000, // 30 minutes
  max_ttl_ms: 2 * 60 * 60 * 1000, // 2 hours
  cleanup_interval_ms: 5 * 60 * 1000, // 5 minutes
  size_limit_kb: 10 * 1024 // 10MB
};

/**
 * Plan Cache Manager
 */
class PlanCacheManager {
  private cache: Map<string, PlanCacheEntry> = new Map();
  private stats: PlanCacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    total_entries: 0,
    memory_usage_kb: 0,
    hit_rate: 0,
    last_cleanup: new Date().toISOString()
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Calculate entry size in bytes
   */
  private calculateEntrySize(entry: PlanCacheEntry): number {
    return JSON.stringify(entry).length;
  }

  /**
   * Update memory usage statistics
   */
  private updateMemoryUsage(): void {
    let totalBytes = 0;
    this.cache.forEach(entry => {
      totalBytes += entry.size_bytes;
    });
    this.stats.memory_usage_kb = Math.round(totalBytes / 1024);
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hit_rate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
  }

  /**
   * Determine TTL based on plan characteristics
   */
  private calculateTTL(plan: NormalizedPlanResponse): number {
    // Plans are relatively static, use longer TTL
    const baseTTL = CACHE_CONFIG.default_ttl_ms;
    
    // Increase TTL for plans with more seats (likely more stable)
    const totalSeats = plan.plan.floors.reduce((total, floor) => {
      return total + floor.rows.reduce((rowTotal, row) => {
        return rowTotal + row.seats.filter(seat => !seat.isEmpty).length;
      }, 0);
    }, 0);
    
    // More seats = longer cache (up to max TTL)
    const seatMultiplier = Math.min(2, 1 + (totalSeats / 100));
    const calculatedTTL = Math.min(baseTTL * seatMultiplier, CACHE_CONFIG.max_ttl_ms);
    
    return calculatedTTL;
  }

  /**
   * Evict entries to make space
   */
  private evictEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (LRU)
    entries.sort((a, b) => a[1].last_accessed - b[1].last_accessed);
    
    // Remove oldest 20% of entries
    const evictCount = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < evictCount && entries.length > 0; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.stats.evictions++;
    }
    
    this.updateMemoryUsage();
  }

  /**
   * Check if cache is over size limit
   */
  private isOverSizeLimit(): boolean {
    return this.stats.memory_usage_kb > CACHE_CONFIG.size_limit_kb;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires_at) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.updateMemoryUsage();
      this.stats.last_cleanup = new Date().toISOString();
    }
    
    // Evict entries if over size limit
    if (this.isOverSizeLimit()) {
      this.evictEntries();
    }
    
    this.stats.total_entries = this.cache.size;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.cleanup_interval_ms);
  }

  /**
   * Store plan in cache
   */
  set(key: string, data: NormalizedPlanResponse): void {
    const now = Date.now();
    const ttl = this.calculateTTL(data);
    
    const entry: PlanCacheEntry = {
      key,
      data,
      created_at: now,
      expires_at: now + ttl,
      ttl_ms: ttl,
      access_count: 0,
      last_accessed: now,
      size_bytes: 0
    };
    
    // Calculate size
    entry.size_bytes = this.calculateEntrySize(entry);
    
    // Check if we need to make space
    if (this.cache.size >= CACHE_CONFIG.max_entries || this.isOverSizeLimit()) {
      this.evictEntries();
    }
    
    this.cache.set(key, entry);
    this.updateMemoryUsage();
    this.stats.total_entries = this.cache.size;
  }

  /**
   * Get plan from cache
   */
  get(key: string): NormalizedPlanResponse | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    const now = Date.now();
    
    // Check if expired
    if (now > entry.expires_at) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      this.updateMemoryUsage();
      return null;
    }
    
    // Update access statistics
    entry.access_count++;
    entry.last_accessed = now;
    
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data;
  }

  /**
   * Remove specific entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateMemoryUsage();
      this.stats.total_entries = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all cached plans
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      total_entries: 0,
      memory_usage_kb: 0,
      hit_rate: 0,
      last_cleanup: new Date().toISOString()
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): PlanCacheStats {
    this.stats.total_entries = this.cache.size;
    return { ...this.stats };
  }

  /**
   * Get detailed cache info
   */
  getCacheInfo(): {
    entries: Array<{
      key: string;
      busTypeId: string;
      created: string;
      expires: string;
      accessed: number;
      size_kb: number;
    }>;
    config: typeof CACHE_CONFIG;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      busTypeId: entry.data.busTypeId,
      created: new Date(entry.created_at).toISOString(),
      expires: new Date(entry.expires_at).toISOString(),
      accessed: entry.access_count,
      size_kb: Math.round(entry.size_bytes / 1024)
    }));
    
    return {
      entries: entries.sort((a, b) => b.accessed - a.accessed),
      config: CACHE_CONFIG
    };
  }

  /**
   * Preload plans for common bus types
   */
  async preloadPlans(busTypeIds: string[], getPlanFn: (busTypeId: string) => Promise<NormalizedPlanResponse | null>): Promise<void> {
    const preloadPromises = busTypeIds.map(async (busTypeId) => {
      const key = createPlanCacheKey({ bustype_id: busTypeId });
      
      // Skip if already cached
      if (this.get(key)) {
        return;
      }
      
      try {
        const plan = await getPlanFn(busTypeId);
        if (plan) {
          this.set(key, plan);
        }
      } catch (error) {
        console.warn(`Failed to preload plan for bus type ${busTypeId}:`, error);
      }
    });
    
    await Promise.all(preloadPromises);
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Global cache instance
export const planCache = new PlanCacheManager();

// Convenience functions
export function getCachedPlan(key: string): NormalizedPlanResponse | null {
  return planCache.get(key);
}

export function setCachedPlan(key: string, data: NormalizedPlanResponse): void {
  planCache.set(key, data);
}

export function clearPlanCache(): void {
  planCache.clear();
}

export function getPlanCacheStats(): PlanCacheStats {
  return planCache.getStats();
}

export function getPlanCacheInfo() {
  return planCache.getCacheInfo();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    planCache.destroy();
  });
}
