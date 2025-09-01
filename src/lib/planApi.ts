// Main API client for get_plan with comprehensive functionality
// Integrates HTTP client, normalization, caching, and error handling

import { getPlan, createPlanCacheKey } from './getPlanHttp';
import { normalizePlanResponse, validatePlan, getPlanStatistics } from './normalizePlan';
import { planCache, getCachedPlan, setCachedPlan, getPlanCacheStats } from './planCache';

import type {
  GetPlanRequest,
  PlanApiResponse,
  NormalizedPlanResponse,
  BusPlan,
  BusPlanConfig,
  GetPlanError
} from '@/types/getPlan';

// Default configuration
const DEFAULT_CONFIG: BusPlanConfig = {
  orientation: 'h',
  version: 2.0,
  showSeatNumbers: true,
  enableSelection: true,
  selectionMode: 'multiple'
};

// API credentials configuration
const API_CONFIG = {
  login: import.meta.env.VITE_BUSSYSTEM_LOGIN || 'demo_login',
  password: import.meta.env.VITE_BUSSYSTEM_PASSWORD || 'demo_password'
};

/**
 * Get bus plan by bus type ID
 */
export async function getBusPlan(
  busTypeId: string,
  options: {
    orientation?: 'h' | 'v';
    version?: 1.1 | 2.0;
    useCache?: boolean;
    session?: string;
  } = {}
): Promise<PlanApiResponse> {
  const startTime = Date.now();
  
  const {
    orientation = 'h',
    version = 2.0,
    useCache = true,
    session
  } = options;
  
  // Validate input
  if (!busTypeId) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: 'Bus type ID is required',
        retryable: false
      },
      cached: false,
      response_time_ms: Date.now() - startTime
    };
  }
  
  // Check cache first
  const cacheKey = createPlanCacheKey({ bustype_id: busTypeId, position: orientation, v: version });
  
  if (useCache) {
    const cached = getCachedPlan(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        response_time_ms: Date.now() - startTime
      };
    }
  }
  
  try {
    // Prepare request
    const request: GetPlanRequest = {
      login: API_CONFIG.login,
      password: API_CONFIG.password,
      bustype_id: busTypeId,
      position: orientation,
      v: version,
      session
    };
    
    console.log('[getPlan API] Request:', { busTypeId, orientation, version });
    
    // Make API call
    const response = await getPlan(request);
    
    if (!response.success) {
      return {
        success: false,
        error: (response as { success: false; error: GetPlanError }).error,
        cached: false,
        response_time_ms: Date.now() - startTime
      };
    }
    
    // Normalize response
    const normalizedResponse = normalizePlanResponse(
      response.data,
      busTypeId,
      version,
      orientation
    );
    
    // Validate normalized data
    const validation = validatePlan(normalizedResponse.plan);
    if (!validation.isValid) {
      console.warn('[getPlan API] Validation warnings:', validation.errors);
    }
    
    // Cache the result
    if (useCache) {
      setCachedPlan(cacheKey, normalizedResponse);
    }
    
    console.log('[getPlan API] Success:', {
      busTypeId,
      floors: normalizedResponse.plan.floors.length,
      totalSeats: getPlanStatistics(normalizedResponse.plan).totalSeats
    });
    
    return {
      success: true,
      data: normalizedResponse,
      cached: false,
      response_time_ms: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('[getPlan API] Error:', error);
    
    const planError: GetPlanError = {
      code: 'unknown_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: { error },
      retryable: true
    };
    
    return {
      success: false,
      error: planError,
      cached: false,
      response_time_ms: Date.now() - startTime
    };
  }
}

/**
 * Get multiple bus plans efficiently
 */
export async function getMultipleBusPlans(
  busTypeIds: string[],
  options: {
    orientation?: 'h' | 'v';
    version?: 1.1 | 2.0;
    useCache?: boolean;
    concurrency?: number;
  } = {}
): Promise<{ [busTypeId: string]: PlanApiResponse }> {
  const {
    orientation = 'h',
    version = 2.0,
    useCache = true,
    concurrency = 3
  } = options;
  
  const results: { [busTypeId: string]: PlanApiResponse } = {};
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < busTypeIds.length; i += concurrency) {
    const batch = busTypeIds.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (busTypeId) => {
      const result = await getBusPlan(busTypeId, { orientation, version, useCache });
      return { busTypeId, result };
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ busTypeId, result }) => {
      results[busTypeId] = result;
    });
  }
  
  return results;
}

/**
 * Check if bus plan exists in cache
 */
export function isBusPlanCached(
  busTypeId: string,
  orientation: 'h' | 'v' = 'h',
  version: 1.1 | 2.0 = 2.0
): boolean {
  const cacheKey = createPlanCacheKey({ bustype_id: busTypeId, position: orientation, v: version });
  return getCachedPlan(cacheKey) !== null;
}

/**
 * Preload bus plans for better performance
 */
export async function preloadBusPlans(
  busTypeIds: string[],
  options: {
    orientation?: 'h' | 'v';
    version?: 1.1 | 2.0;
  } = {}
): Promise<{ success: number; failed: number; errors: string[] }> {
  const { orientation = 'h', version = 2.0 } = options;
  
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  console.log(`[preloadBusPlans] Preloading ${busTypeIds.length} bus plans...`);
  
  for (const busTypeId of busTypeIds) {
    try {
      const result = await getBusPlan(busTypeId, { orientation, version, useCache: true });
      
      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(`${busTypeId}: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      failed++;
      errors.push(`${busTypeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`[preloadBusPlans] Complete: ${success} success, ${failed} failed`);
  
  return { success, failed, errors };
}

/**
 * Get plan statistics for analysis
 */
export function analyzeBusPlan(plan: BusPlan): {
  statistics: ReturnType<typeof getPlanStatistics>;
  insights: {
    planComplexity: 'simple' | 'moderate' | 'complex';
    layoutType: 'single-deck' | 'double-deck';
    seatDensity: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
} {
  const stats = getPlanStatistics(plan);
  
  // Analyze plan complexity
  let planComplexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (stats.totalFloors > 1 || stats.totalRows > 15) planComplexity = 'moderate';
  if (stats.totalFloors > 2 || stats.totalRows > 25 || stats.totalSeats > 60) planComplexity = 'complex';
  
  // Determine layout type
  const layoutType = stats.totalFloors > 1 ? 'double-deck' : 'single-deck';
  
  // Calculate seat density
  let seatDensity: 'low' | 'medium' | 'high' = 'low';
  if (stats.totalSeats > 30) seatDensity = 'medium';
  if (stats.totalSeats > 50) seatDensity = 'high';
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (planComplexity === 'complex') {
    recommendations.push('Consider implementing floor-by-floor navigation');
  }
  
  if (seatDensity === 'high') {
    recommendations.push('Use zoom functionality for better seat visibility');
  }
  
  if (stats.availableSeats < stats.totalSeats * 0.3) {
    recommendations.push('High occupancy - consider showing only available seats');
  }
  
  return {
    statistics: stats,
    insights: {
      planComplexity,
      layoutType,
      seatDensity,
      recommendations
    }
  };
}

/**
 * Clear plan cache
 */
export function clearBusPlanCache(): void {
  planCache.clear();
}

/**
 * Get cache statistics
 */
export function getBusPlanCacheStats() {
  return getPlanCacheStats();
}

/**
 * Export configuration for external use
 */
export const planApiConfig = {
  default: DEFAULT_CONFIG,
  api: API_CONFIG
};

// Export convenience functions
export {
  normalizePlanResponse,
  validatePlan,
  getPlanStatistics
} from './normalizePlan';

export {
  createPlanCacheKey
} from './getPlanHttp';

export {
  getCachedPlan,
  setCachedPlan
} from './planCache';

// Export types for external use
export type {
  GetPlanRequest,
  PlanApiResponse,
  NormalizedPlanResponse,
  BusPlan,
  BusPlanConfig,
  GetPlanError,
  SeatInfo,
  FloorInfo,
  PlanRow
} from '@/types/getPlan';
