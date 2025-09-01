/**
 * FREE SEATS API CLIENT
 * 
 * Client principal pentru get_free_seats cu cache inteligent
 * Combină HTTP client, normalizare și cache management
 */

import type {
  GetFreeSeatsRequest,
  NormalizedSeatsResponse,
  FreeSeat,
  GetFreeSeatsError,
  SeatsCacheStats
} from '@/types/getFreeSeats';

import { getFreeSeats, type GetFreeSeatsConfig } from './getFreeSeatsHttp';
import { normalizeGetFreeSeats } from './normalizeGetFreeSeats';
import { 
  getSeatsCacheInstance,
  cacheSeats,
  getCachedSeats,
  hasCachedSeats,
  invalidateSeatsCache,
  getSeatsCacheStats,
  type SeatsCacheConfig 
} from './seatsCache';

// ===============================
// API Client Configuration
// ===============================

export interface FreeSeatsApiConfig {
  http?: GetFreeSeatsConfig;
  cache?: SeatsCacheConfig;
  force_refresh?: boolean;
  fallback_on_error?: boolean;
  debug?: boolean;
}

const DEFAULT_API_CONFIG: FreeSeatsApiConfig = {
  http: {
    timeout_ms: 15000,
    max_retries: 3,
    rate_limit: {
      requests_per_minute: 20,
      requests_per_hour: 100
    },
    fallback_to_xml: true,
    debug: false
  },
  cache: {
    max_entries: 500,
    default_ttl_ms: 5 * 60 * 1000,
    min_ttl_ms: 2 * 60 * 1000,
    max_ttl_ms: 10 * 60 * 1000,
    cleanup_interval_ms: 30 * 1000,
    debug: false
  },
  force_refresh: false,
  fallback_on_error: true,
  debug: false
};

// ===============================
// Main API Functions
// ===============================

/**
 * Obține locurile libere pentru un interval
 * Cu cache inteligent și fallback
 */
export async function getFreeSeatsByInterval(
  request: GetFreeSeatsRequest,
  config: FreeSeatsApiConfig = {}
): Promise<NormalizedSeatsResponse> {
  const finalConfig = { ...DEFAULT_API_CONFIG, ...config };
  
  if (finalConfig.debug) {
    console.log('[FreeSeatsApi] Request:', {
      interval_id: request.interval_id,
      train_id: request.train_id,
      vagon_id: request.vagon_id,
      force_refresh: finalConfig.force_refresh
    });
  }
  
  // Check cache first (unless force refresh)
  if (!finalConfig.force_refresh) {
    const cachedData = getCachedSeats(request, finalConfig.cache);
    if (cachedData) {
      if (finalConfig.debug) {
        console.log('[FreeSeatsApi] Cache HIT');
      }
      return cachedData;
    }
  }
  
  try {
    // Make API request
    const rawResponse = await getFreeSeats(request, finalConfig.http);
    
    // Normalize response
    const normalizedResponse = normalizeGetFreeSeats(rawResponse);
    
    // Cache the result
    cacheSeats(request, normalizedResponse, finalConfig.cache);
    
    if (finalConfig.debug) {
      console.log('[FreeSeatsApi] Success:', {
        interval_id: normalizedResponse.interval_id,
        vehicle_type: normalizedResponse.vehicle_type,
        total_seats: normalizedResponse.total_seats,
        free_seats: normalizedResponse.free_seats
      });
    }
    
    return normalizedResponse;
    
  } catch (error) {
    if (finalConfig.debug) {
      console.error('[FreeSeatsApi] Error:', error);
    }
    
    // Try fallback to cached data if enabled
    if (finalConfig.fallback_on_error) {
      const cachedData = getCachedSeats(request, finalConfig.cache);
      if (cachedData) {
        if (finalConfig.debug) {
          console.log('[FreeSeatsApi] Fallback to cache');
        }
        return cachedData;
      }
    }
    
    throw error;
  }
}

/**
 * Obține locurile libere pentru trenuri (cu toate vagoanele)
 */
export async function getFreeSeatsForTrain(
  intervalId: string,
  trainId: string,
  options: {
    login: string;
    password: string;
    currency?: string;
    lang?: string;
    session?: string;
  },
  config: FreeSeatsApiConfig = {}
): Promise<NormalizedSeatsResponse> {
  const request: GetFreeSeatsRequest = {
    interval_id: intervalId,
    train_id: trainId,
    login: options.login,
    password: options.password,
    currency: options.currency || 'EUR',
    lang: options.lang || 'en',
    session: options.session
  };
  
  return getFreeSeatsByInterval(request, config);
}

/**
 * Obține locurile libere pentru un vagon specific
 */
export async function getFreeSeatsForVagon(
  intervalId: string,
  trainId: string,
  vagonId: string,
  options: {
    login: string;
    password: string;
    currency?: string;
    lang?: string;
    session?: string;
  },
  config: FreeSeatsApiConfig = {}
): Promise<NormalizedSeatsResponse> {
  const request: GetFreeSeatsRequest = {
    interval_id: intervalId,
    train_id: trainId,
    vagon_id: vagonId,
    login: options.login,
    password: options.password,
    currency: options.currency || 'EUR',
    lang: options.lang || 'en',
    session: options.session
  };
  
  return getFreeSeatsByInterval(request, config);
}

/**
 * Obține locurile libere pentru autobuze
 */
export async function getFreeSeatsForBus(
  intervalId: string,
  options: {
    login: string;
    password: string;
    currency?: string;
    lang?: string;
    session?: string;
  },
  config: FreeSeatsApiConfig = {}
): Promise<NormalizedSeatsResponse> {
  const request: GetFreeSeatsRequest = {
    interval_id: intervalId,
    login: options.login,
    password: options.password,
    currency: options.currency || 'EUR',
    lang: options.lang || 'en',
    session: options.session
  };
  
  return getFreeSeatsByInterval(request, config);
}

// ===============================
// Batch Operations
// ===============================

/**
 * Obține locurile libere pentru multiple intervale
 */
export async function getFreeSeatsBatch(
  requests: GetFreeSeatsRequest[],
  config: FreeSeatsApiConfig = {}
): Promise<{
  results: NormalizedSeatsResponse[];
  errors: Array<{ request: GetFreeSeatsRequest; error: GetFreeSeatsError }>;
}> {
  const results: NormalizedSeatsResponse[] = [];
  const errors: Array<{ request: GetFreeSeatsRequest; error: GetFreeSeatsError }> = [];
  
  // Process requests with concurrency limit
  const BATCH_SIZE = 5;
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (request) => {
      try {
        const result = await getFreeSeatsByInterval(request, config);
        return { success: true, result, request };
      } catch (error) {
        return { 
          success: false, 
          error: error as GetFreeSeatsError, 
          request 
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(batchResult => {
      if (batchResult.success) {
        results.push(batchResult.result);
      } else {
        errors.push({
          request: batchResult.request,
          error: batchResult.error
        });
      }
    });
    
    // Small delay between batches to avoid overwhelming the API
    if (i + BATCH_SIZE < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return { results, errors };
}

/**
 * Preîncarcă locurile libere pentru multiple intervale
 */
export async function preloadFreeSeats(
  requests: GetFreeSeatsRequest[],
  config: FreeSeatsApiConfig = {}
): Promise<void> {
  const cache = getSeatsCacheInstance(config.cache);
  
  // Mark as preloading to prevent duplicate requests
  const preloadKeys = cache.preloadSeats(requests);
  
  // Load in background
  getFreeSeatsBatch(requests, { ...config, force_refresh: true })
    .then(({ results }) => {
      if (config.debug) {
        console.log(`[FreeSeatsApi] Preloaded ${results.length} seat configurations`);
      }
    })
    .catch(error => {
      if (config.debug) {
        console.error('[FreeSeatsApi] Preload error:', error);
      }
    });
}

// ===============================
// Utility Functions
// ===============================

/**
 * Obține doar locurile libere dintr-un răspuns
 */
export function extractFreeSeats(response: NormalizedSeatsResponse): FreeSeat[] {
  return response.all_seats.filter(seat => seat.is_free);
}

/**
 * Grupează locurile după vagon
 */
export function groupSeatsByVagon(response: NormalizedSeatsResponse): Map<string, FreeSeat[]> {
  const groups = new Map<string, FreeSeat[]>();
  
  response.all_seats.forEach(seat => {
    const vagonId = seat.vagon_id || 'default';
    if (!groups.has(vagonId)) {
      groups.set(vagonId, []);
    }
    groups.get(vagonId)!.push(seat);
  });
  
  return groups;
}

/**
 * Calculează statistici pentru locuri
 */
export function calculateSeatsStatistics(response: NormalizedSeatsResponse) {
  const totalSeats = response.total_seats;
  const freeSeats = response.free_seats;
  const occupiedSeats = totalSeats - freeSeats;
  const occupancyRate = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;
  
  const prices = response.all_seats
    .map(seat => seat.price)
    .filter(price => price > 0);
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
    : 0;
  
  return {
    total_seats: totalSeats,
    free_seats: freeSeats,
    occupied_seats: occupiedSeats,
    occupancy_rate: Math.round(occupancyRate * 100) / 100,
    pricing: {
      min_price: minPrice,
      max_price: maxPrice,
      avg_price: Math.round(avgPrice * 100) / 100,
      currency: response.currency
    },
    vehicle_type: response.vehicle_type,
    train_count: response.trains.length,
    bus_count: response.buses.length
  };
}

/**
 * Găsește cele mai bune locuri disponibile
 */
export function findBestAvailableSeats(
  response: NormalizedSeatsResponse,
  criteria: {
    max_results?: number;
    prefer_window?: boolean;
    prefer_aisle?: boolean;
    max_price?: number;
    preferred_class?: string;
  } = {}
): FreeSeat[] {
  const {
    max_results = 10,
    prefer_window = false,
    prefer_aisle = false,
    max_price,
    preferred_class
  } = criteria;
  
  let availableSeats = extractFreeSeats(response);
  
  // Filter by price
  if (max_price) {
    availableSeats = availableSeats.filter(seat => seat.price <= max_price);
  }
  
  // Filter by class
  if (preferred_class) {
    availableSeats = availableSeats.filter(seat => 
      seat.class?.toLowerCase() === preferred_class.toLowerCase()
    );
  }
  
  // Sort by preferences
  availableSeats.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Window preference (assume seat numbers ending in 1 or 6 are window seats)
    if (prefer_window) {
      const aIsWindow = /[16]$/.test(a.seat_number);
      const bIsWindow = /[16]$/.test(b.seat_number);
      if (aIsWindow) scoreA += 10;
      if (bIsWindow) scoreB += 10;
    }
    
    // Aisle preference (assume seat numbers ending in 2 or 5 are aisle seats)
    if (prefer_aisle) {
      const aIsAisle = /[25]$/.test(a.seat_number);
      const bIsAisle = /[25]$/.test(b.seat_number);
      if (aIsAisle) scoreA += 10;
      if (bIsAisle) scoreB += 10;
    }
    
    // Price preference (lower is better)
    scoreA -= a.price * 0.1;
    scoreB -= b.price * 0.1;
    
    return scoreB - scoreA;
  });
  
  return availableSeats.slice(0, max_results);
}

// ===============================
// Cache Management
// ===============================

/**
 * Invalidează cache-ul pentru un interval
 */
export function invalidateIntervalCache(
  intervalId: string,
  config?: SeatsCacheConfig
): number {
  return invalidateSeatsCache(intervalId, config);
}

/**
 * Obține statistici cache
 */
export function getApiCacheStats(config?: SeatsCacheConfig): SeatsCacheStats {
  return getSeatsCacheStats(config);
}

/**
 * Verifică dacă datele sunt în cache
 */
export function isDataCached(
  request: GetFreeSeatsRequest,
  config?: SeatsCacheConfig
): boolean {
  return hasCachedSeats(request, config);
}

// ===============================
// Export Configuration
// ===============================

export { DEFAULT_API_CONFIG as DEFAULT_FREE_SEATS_API_CONFIG };
// Export types for external use
export type { 
  GetFreeSeatsRequest,
  NormalizedSeatsResponse,
  FreeSeat,
  GetFreeSeatsError,
  SeatsCacheStats
} from '@/types/getFreeSeats';
