/**
 * FREE SEATS CACHE MANAGEMENT
 * 
 * Sistem de cache optimizat pentru date de locuri libere
 * TTL variabil: 2-10 minute în funcție de ocupare
 */

import type {
  NormalizedSeatsResponse,
  FreeSeat,
  SeatsCacheEntry,
  SeatsCacheStats,
  GetFreeSeatsRequest
} from '@/types/getFreeSeats';

import { createSeatsCacheKey, parseSeatsCacheKey } from './getFreeSeatsHttp';

// ===============================
// Cache Configuration
// ===============================

interface SeatsCacheConfig {
  max_entries?: number;
  default_ttl_ms?: number;
  min_ttl_ms?: number;
  max_ttl_ms?: number;
  cleanup_interval_ms?: number;
  enable_compression?: boolean;
  debug?: boolean;
}

const DEFAULT_SEATS_CACHE_CONFIG: SeatsCacheConfig = {
  max_entries: 500,
  default_ttl_ms: 5 * 60 * 1000, // 5 minutes
  min_ttl_ms: 2 * 60 * 1000,     // 2 minutes  
  max_ttl_ms: 10 * 60 * 1000,    // 10 minutes
  cleanup_interval_ms: 30 * 1000, // 30 seconds
  enable_compression: false,
  debug: false
};

// ===============================
// Cache Store
// ===============================

class SeatsCacheStore {
  private store = new Map<string, SeatsCacheEntry>();
  private config: SeatsCacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private stats: SeatsCacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    total_entries: 0,
    memory_usage_kb: 0,
    hit_rate: 0,
    last_cleanup: new Date().toISOString()
  };

  constructor(config: SeatsCacheConfig = {}) {
    this.config = { ...DEFAULT_SEATS_CACHE_CONFIG, ...config };
    this.startCleanupTimer();
  }

  // ===============================
  // TTL Calculation
  // ===============================

  private calculateTTL(seatsData: NormalizedSeatsResponse): number {
    const { min_ttl_ms, max_ttl_ms, default_ttl_ms } = this.config;
    
    if (!seatsData.all_seats.length) {
      return default_ttl_ms || 5 * 60 * 1000;
    }
    
    // Calculate occupancy rate
    const occupancyRate = 1 - (seatsData.free_seats / seatsData.total_seats);
    
    // Dynamic TTL based on occupancy:
    // - Low occupancy (0-30%): longer cache (more stable)
    // - Medium occupancy (30-70%): medium cache
    // - High occupancy (70-100%): shorter cache (changes frequently)
    let ttlMultiplier: number;
    
    if (occupancyRate <= 0.3) {
      ttlMultiplier = 1.0; // Full TTL
    } else if (occupancyRate <= 0.7) {
      ttlMultiplier = 0.7; // 70% of max TTL
    } else {
      ttlMultiplier = 0.4; // 40% of max TTL
    }
    
    const calculatedTTL = (max_ttl_ms || 10 * 60 * 1000) * ttlMultiplier;
    
    // Ensure TTL is within bounds
    return Math.max(
      min_ttl_ms || 2 * 60 * 1000,
      Math.min(calculatedTTL, max_ttl_ms || 10 * 60 * 1000)
    );
  }

  // ===============================
  // Core Cache Operations
  // ===============================

  set(key: string, data: NormalizedSeatsResponse): void {
    const now = Date.now();
    const ttl = this.calculateTTL(data);
    
    const entry: SeatsCacheEntry = {
      key,
      data,
      created_at: now,
      expires_at: now + ttl,
      ttl_ms: ttl,
      access_count: 0,
      last_accessed: now,
      size_bytes: this.estimateSize(data)
    };

    // Check if cache is full
    if (this.store.size >= (this.config.max_entries || 500)) {
      this.evictOldest();
    }

    this.store.set(key, entry);
    this.updateStats();

    if (this.config.debug) {
      console.log(`[SeatsCache] SET ${key} (TTL: ${Math.round(ttl / 1000)}s, Occupancy: ${Math.round((1 - data.free_seats / data.total_seats) * 100)}%)`);
    }
  }

  get(key: string): NormalizedSeatsResponse | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now > entry.expires_at) {
      this.store.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      
      if (this.config.debug) {
        console.log(`[SeatsCache] EXPIRED ${key}`);
      }
      
      return null;
    }

    // Update access info
    entry.access_count++;
    entry.last_accessed = now;
    
    this.stats.hits++;
    this.updateHitRate();

    if (this.config.debug) {
      const remainingTTL = Math.round((entry.expires_at - now) / 1000);
      console.log(`[SeatsCache] HIT ${key} (TTL remaining: ${remainingTTL}s)`);
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expires_at) {
      this.store.delete(key);
      this.stats.evictions++;
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  clear(): void {
    this.store.clear();
    this.updateStats();
    
    if (this.config.debug) {
      console.log('[SeatsCache] CLEARED');
    }
  }

  // ===============================
  // Advanced Operations
  // ===============================

  getAllByInterval(intervalId: string): NormalizedSeatsResponse[] {
    const results: NormalizedSeatsResponse[] = [];
    
    for (const [key, entry] of this.store.entries()) {
      if (Date.now() > entry.expires_at) {
        this.store.delete(key);
        this.stats.evictions++;
        continue;
      }
      
      const cacheKey = parseSeatsCacheKey(key);
      if (cacheKey && cacheKey.interval_id === intervalId) {
        results.push(entry.data);
      }
    }
    
    return results;
  }

  invalidateByInterval(intervalId: string): number {
    let deletedCount = 0;
    
    for (const [key] of this.store.entries()) {
      const cacheKey = parseSeatsCacheKey(key);
      if (cacheKey && cacheKey.interval_id === intervalId) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      this.updateStats();
      
      if (this.config.debug) {
        console.log(`[SeatsCache] INVALIDATED ${deletedCount} entries for interval ${intervalId}`);
      }
    }
    
    return deletedCount;
  }

  preloadSeats(requests: GetFreeSeatsRequest[]): string[] {
    const keys: string[] = [];
    
    requests.forEach(request => {
      const key = createSeatsCacheKey(request);
      keys.push(key);
      
      // Mark as preloading to prevent duplicate requests
      if (!this.store.has(key)) {
        // Create placeholder entry
        const placeholder: SeatsCacheEntry = {
          key,
          data: {
            interval_id: request.interval_id || '',
            currency: request.currency || 'EUR',
            lang: request.lang || 'en',
            vehicle_type: 'bus',
            trains: [],
            buses: [],
            all_seats: [],
            total_seats: 0,
            free_seats: 0,
            response_time: new Date().toISOString()
          },
          created_at: Date.now(),
          expires_at: Date.now() + 30000, // 30 seconds placeholder
          ttl_ms: 30000,
          access_count: 0,
          last_accessed: Date.now(),
          size_bytes: 500,
          is_placeholder: true
        };
        
        this.store.set(key, placeholder);
      }
    });
    
    return keys;
  }

  // ===============================
  // Maintenance Operations
  // ===============================

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.last_accessed < oldestTime) {
        oldestTime = entry.last_accessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.store.delete(oldestKey);
      this.stats.evictions++;
      
      if (this.config.debug) {
        console.log(`[SeatsCache] EVICTED ${oldestKey}`);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires_at) {
        this.store.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.stats.evictions += cleanedCount;
      this.updateStats();
      
      if (this.config.debug) {
        console.log(`[SeatsCache] CLEANUP removed ${cleanedCount} expired entries`);
      }
    }
    
    this.stats.last_cleanup = new Date().toISOString();
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanup_interval_ms || 30000);
  }

  // ===============================
  // Statistics & Monitoring
  // ===============================

  private estimateSize(data: NormalizedSeatsResponse): number {
    // Rough estimation of memory usage
    const jsonString = JSON.stringify(data);
    return jsonString.length * 2; // Assuming UTF-16 encoding
  }

  private updateStats(): void {
    this.stats.total_entries = this.store.size;
    
    let totalSize = 0;
    for (const entry of this.store.values()) {
      totalSize += entry.size_bytes;
    }
    this.stats.memory_usage_kb = Math.round(totalSize / 1024);
    
    this.updateHitRate();
  }

  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hit_rate = totalRequests > 0 
      ? Math.round((this.stats.hits / totalRequests) * 10000) / 100 
      : 0;
  }

  getStats(): SeatsCacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  getDetailedStats(): SeatsCacheStats & {
    entries: Array<{
      key: string;
      interval_id: string;
      train_id?: string;
      vagon_id?: string;
      expires_in_seconds: number;
      access_count: number;
      size_kb: number;
      occupancy_rate: number;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.store.entries()).map(([key, entry]) => {
      const cacheKey = parseSeatsCacheKey(key);
      const occupancyRate = entry.data.total_seats > 0 
        ? 1 - (entry.data.free_seats / entry.data.total_seats)
        : 0;
      
      return {
        key,
        interval_id: cacheKey?.interval_id || '',
        train_id: cacheKey?.train_id,
        vagon_id: cacheKey?.vagon_id,
        expires_in_seconds: Math.max(0, Math.round((entry.expires_at - now) / 1000)),
        access_count: entry.access_count,
        size_kb: Math.round(entry.size_bytes / 1024),
        occupancy_rate: Math.round(occupancyRate * 10000) / 100
      };
    });
    
    return {
      ...this.getStats(),
      entries
    };
  }

  // ===============================
  // Cleanup
  // ===============================

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
  }
}

// ===============================
// Singleton Instance
// ===============================

let seatsCacheInstance: SeatsCacheStore | null = null;

export function getSeatsCacheInstance(config?: SeatsCacheConfig): SeatsCacheStore {
  if (!seatsCacheInstance) {
    seatsCacheInstance = new SeatsCacheStore(config);
  }
  return seatsCacheInstance;
}

export function destroySeatsCacheInstance(): void {
  if (seatsCacheInstance) {
    seatsCacheInstance.destroy();
    seatsCacheInstance = null;
  }
}

// ===============================
// Convenience Functions
// ===============================

export function cacheSeats(
  request: GetFreeSeatsRequest, 
  data: NormalizedSeatsResponse,
  config?: SeatsCacheConfig
): void {
  const cache = getSeatsCacheInstance(config);
  const key = createSeatsCacheKey(request);
  cache.set(key, data);
}

export function getCachedSeats(
  request: GetFreeSeatsRequest,
  config?: SeatsCacheConfig
): NormalizedSeatsResponse | null {
  const cache = getSeatsCacheInstance(config);
  const key = createSeatsCacheKey(request);
  return cache.get(key);
}

export function hasCachedSeats(
  request: GetFreeSeatsRequest,
  config?: SeatsCacheConfig
): boolean {
  const cache = getSeatsCacheInstance(config);
  const key = createSeatsCacheKey(request);
  return cache.has(key);
}

export function invalidateSeatsCache(
  intervalId: string,
  config?: SeatsCacheConfig
): number {
  const cache = getSeatsCacheInstance(config);
  return cache.invalidateByInterval(intervalId);
}

export function getSeatsCacheStats(config?: SeatsCacheConfig): SeatsCacheStats {
  const cache = getSeatsCacheInstance(config);
  return cache.getStats();
}

// ===============================
// Export Types and Configuration
// ===============================

export { SeatsCacheStore, DEFAULT_SEATS_CACHE_CONFIG };
export type { SeatsCacheConfig };
