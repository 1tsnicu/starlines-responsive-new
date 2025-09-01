/**
 * GET ALL ROUTES API CLIENT
 * 
 * Client API principal cu caching, business logic și state management
 * Implementează toate regulile de business pentru get_all_routes
 */

import { getAllRoutes, isValidTimetableId } from './getAllRoutesHttp';
import { normalizeGetAllRoutesResponse, validateNormalizedSchedule, getScheduleSummary } from './normalizeGetAllRoutes';
import type { 
  RouteSchedule, 
  GetAllRoutesError,
  RouteScheduleState,
  BaggageSelection,
  StationTimelineItem,
  ScheduleStation
} from '@/types/getAllRoutes';
import type { CurrencyCode } from '@/types/routes';

// ===============================
// Cache Management
// ===============================

interface CacheEntry {
  schedule: RouteSchedule;
  timestamp: number;
  ttl: number; // minutes
}

const scheduleCache = new Map<string, CacheEntry>();

function getCacheKey(timetable_id: string, lang: string): string {
  return `schedule_${timetable_id}_${lang}`;
}

function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp > entry.ttl * 60 * 1000;
}

function cleanExpiredCache(): void {
  for (const [key, entry] of scheduleCache.entries()) {
    if (isExpired(entry)) {
      scheduleCache.delete(key);
    }
  }
}

// Clean cache every 5 minutes
setInterval(cleanExpiredCache, 5 * 60 * 1000);

// ===============================
// Main API Functions
// ===============================

/**
 * Get route schedule with caching and normalization
 * 
 * @param timetable_id - Timetable ID from get_routes response
 * @param options - Request options
 * @returns Promise<RouteSchedule>
 */
export async function getRouteSchedule(
  timetable_id: string,
  options: {
    lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz";
    session?: string;
    currency?: CurrencyCode;
    forceRefresh?: boolean;
    timeout?: number;
  } = {}
): Promise<RouteSchedule> {
  const { 
    lang = 'ru', 
    forceRefresh = false, 
    timeout = 30000,
    ...restOptions 
  } = options;
  
  // Validate timetable_id
  if (!isValidTimetableId(timetable_id)) {
    const error: GetAllRoutesError = {
      code: 'EMPTY_TIMETABLE_ID',
      message: 'Invalid or empty timetable_id',
      user_message: 'ID-ul orarului nu este valid. Te rog selectează o rută validă.',
      retry_suggested: false
    };
    throw error;
  }
  
  const cacheKey = getCacheKey(timetable_id, lang);
  
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = scheduleCache.get(cacheKey);
    if (cached && !isExpired(cached)) {
      console.log(`[getAllRoutes] Cache hit for ${cacheKey}`);
      return cached.schedule;
    }
  }
  
  try {
    console.log(`[getAllRoutes] Fetching schedule for timetable_id: ${timetable_id}`);
    
    // Fetch raw data
    const rawResponse = await getAllRoutes(timetable_id, {
      lang,
      timeout,
      ...restOptions
    });
    
    // Normalize response
    const schedule = normalizeGetAllRoutesResponse(rawResponse);
    
    // Validate normalized data
    if (!validateNormalizedSchedule(schedule)) {
      const error: GetAllRoutesError = {
        code: 'ROUTE_DATA_NO_FOUND',
        message: 'Invalid or incomplete schedule data',
        user_message: 'Datele orarului sunt incomplete. Te rog încearcă o altă rută.',
        retry_suggested: false
      };
      throw error;
    }
    
    // Cache the result
    const cacheEntry: CacheEntry = {
      schedule,
      timestamp: Date.now(),
      ttl: schedule.cache_ttl || 30 // Default 30 minutes
    };
    scheduleCache.set(cacheKey, cacheEntry);
    
    console.log(`[getAllRoutes] Successfully cached schedule for ${cacheKey}`);
    return schedule;
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      // Re-throw GetAllRoutesError as-is
      throw error;
    }
    
    // Wrap unexpected errors
    const unexpectedError: GetAllRoutesError = {
      code: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      user_message: 'A apărut o eroare neașteptată. Te rog încearcă din nou.',
      retry_suggested: true
    };
    throw unexpectedError;
  }
}

/**
 * Check if schedule is available for a timetable_id without fetching
 */
export function isScheduleAvailable(timetable_id: string): boolean {
  return isValidTimetableId(timetable_id);
}

/**
 * Get cached schedule if available
 */
export function getCachedSchedule(
  timetable_id: string, 
  lang: string = 'ru'
): RouteSchedule | null {
  const cacheKey = getCacheKey(timetable_id, lang);
  const cached = scheduleCache.get(cacheKey);
  
  if (cached && !isExpired(cached)) {
    return cached.schedule;
  }
  
  return null;
}

// ===============================
// Business Logic Functions
// ===============================

/**
 * Validate baggage selection against business rules
 */
export function validateBaggageSelection(
  baggageItems: BaggageSelection[],
  maxPerPerson?: number,
  maxInBus?: number
): {
  isValid: boolean;
  errors: string[];
  totalPrice: number;
} {
  const errors: string[] = [];
  let totalPrice = 0;
  
  // Group by baggage type for validation
  const typeGroups = baggageItems.reduce((groups, selection) => {
    const typeId = selection.item.baggage_type_id;
    if (!groups[typeId]) {
      groups[typeId] = { items: [], totalQuantity: 0 };
    }
    groups[typeId].items.push(selection);
    groups[typeId].totalQuantity += selection.quantity;
    return groups;
  }, {} as Record<string, { items: BaggageSelection[]; totalQuantity: number }>);
  
  // Validate each type group
  for (const [typeId, group] of Object.entries(typeGroups)) {
    const firstItem = group.items[0].item;
    
    // Check max_per_person
    if (firstItem.max_per_person && group.totalQuantity > firstItem.max_per_person) {
      errors.push(`Maxim ${firstItem.max_per_person} bucăți de ${firstItem.baggage_title} per persoană`);
    }
    
    // Check max_in_bus
    if (firstItem.max_in_bus && group.totalQuantity > firstItem.max_in_bus) {
      errors.push(`Maxim ${firstItem.max_in_bus} bucăți de ${firstItem.baggage_title} per autobuz`);
    }
    
    // Calculate total price
    for (const selection of group.items) {
      totalPrice += selection.item.price * selection.quantity;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    totalPrice
  };
}

/**
 * Generate timeline items for station display
 */
export function generateStationTimeline(schedule: RouteSchedule): StationTimelineItem[] {
  if (!schedule.stations || schedule.stations.length === 0) {
    return [];
  }
  
  const timeline: StationTimelineItem[] = [];
  
  schedule.stations.forEach((station, index) => {
    const isFirst = index === 0;
    const isLast = index === schedule.stations!.length - 1;
    
    // Departure item (except for last station)
    if (!isLast && station.departure) {
      timeline.push({
        station,
        is_departure: true,
        is_arrival: false,
        is_transfer: false,
        day_display: getDayDisplay(station.day_in_way),
        time_display: formatTimeDisplay(station.departure, station.date_departure),
        duration_at_station: calculateStopDuration(station)
      });
    }
    
    // Arrival item (except for first station)
    if (!isFirst && station.arrival) {
      timeline.push({
        station,
        is_departure: false,
        is_arrival: true,
        is_transfer: !!station.point_change || !!station.transfer_time,
        day_display: getDayDisplay(station.day_in_way),
        time_display: formatTimeDisplay(station.arrival, station.date_arrival),
        duration_at_station: calculateStopDuration(station)
      });
    }
  });
  
  return timeline;
}

/**
 * Calculate estimated refund based on cancel policy
 */
export function calculateEstimatedRefund(
  originalPrice: number,
  hoursBeforeDeparture: number,
  cancelPolicy?: RouteSchedule['cancel_policy']
): {
  refundAmount: number;
  refundPercentage: number;
  commission: number;
  isFreeCancel: boolean;
} {
  if (!cancelPolicy) {
    return {
      refundAmount: 0,
      refundPercentage: 0,
      commission: originalPrice,
      isFreeCancel: false
    };
  }
  
  // Check free cancellation window
  if (cancelPolicy.cancel_free_min) {
    const freeMinutes = cancelPolicy.cancel_free_min;
    const freeHours = freeMinutes / 60;
    
    if (hoursBeforeDeparture >= freeHours) {
      return {
        refundAmount: originalPrice,
        refundPercentage: 100,
        commission: 0,
        isFreeCancel: true
      };
    }
  }
  
  // Find applicable cancel rate
  if (cancelPolicy.cancel_hours_info && cancelPolicy.cancel_hours_info.length > 0) {
    for (const policy of cancelPolicy.cancel_hours_info) {
      if (policy.hours_before_depar && hoursBeforeDeparture >= policy.hours_before_depar) {
        const commissionRate = policy.cancel_rate / 100;
        const commission = originalPrice * commissionRate;
        const refund = originalPrice - commission + (policy.money_back || 0);
        
        return {
          refundAmount: Math.max(0, refund),
          refundPercentage: Math.max(0, ((refund / originalPrice) * 100)),
          commission,
          isFreeCancel: false
        };
      }
    }
  }
  
  // No applicable policy - assume no refund
  return {
    refundAmount: 0,
    refundPercentage: 0,
    commission: originalPrice,
    isFreeCancel: false
  };
}

// ===============================
// Helper Functions
// ===============================

function getDayDisplay(dayInWay?: number): string {
  if (!dayInWay || dayInWay === 0) {
    return 'Ziua 1';
  }
  return `Ziua ${dayInWay + 1}`;
}

function formatTimeDisplay(time: string, date?: string): string {
  if (date && date !== new Date().toISOString().split('T')[0]) {
    return `${time} (${date})`;
  }
  return time;
}

function calculateStopDuration(station: ScheduleStation): string | undefined {
  if (!station.arrival || !station.departure) {
    return undefined;
  }
  
  try {
    const arrivalTime = new Date(`2000-01-01T${station.arrival}`);
    const departureTime = new Date(`2000-01-01T${station.departure}`);
    
    const diffMs = departureTime.getTime() - arrivalTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return undefined;
    }
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min oprire`;
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''} oprire`;
    
  } catch (error) {
    return undefined;
  }
}

/**
 * Get booking constraints summary for UI
 */
export function getBookingConstraints(schedule: RouteSchedule): {
  canBuy: boolean;
  canReserve: boolean;
  canRequest: boolean;
  lockTime?: string;
  saleWindow?: string;
  maxSeats?: number;
  restrictions: string[];
} {
  const restrictions: string[] = [];
  
  // Sale timing restrictions
  if (schedule.start_sale_day) {
    restrictions.push(`Vânzarea începe cu ${schedule.start_sale_day} zile înainte`);
  }
  
  if (schedule.stop_sale_hours) {
    restrictions.push(`Vânzarea se oprește cu ${schedule.stop_sale_hours} ore înainte`);
  }
  
  // Lock time info
  let lockTime: string | undefined;
  if (schedule.lock_order === 1 && schedule.lock_min) {
    const hours = Math.floor(schedule.lock_min / 60);
    const minutes = schedule.lock_min % 60;
    
    if (hours > 0) {
      lockTime = `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else {
      lockTime = `${minutes} min`;
    }
  }
  
  // Sale window
  let saleWindow: string | undefined;
  if (schedule.start_sale_day && schedule.stop_sale_hours) {
    saleWindow = `${schedule.start_sale_day} zile - ${schedule.stop_sale_hours} ore`;
  }
  
  return {
    canBuy: schedule.buy === 1,
    canReserve: schedule.reserve === 1,
    canRequest: schedule.request === 1,
    lockTime,
    saleWindow,
    maxSeats: schedule.max_seats,
    restrictions
  };
}

// ===============================
// Export Cache Management
// ===============================

export function clearScheduleCache(): void {
  scheduleCache.clear();
  console.log('[getAllRoutes] Cache cleared');
}

export function getCacheStats(): {
  totalEntries: number;
  expiredEntries: number;
  cacheHitRate?: number;
} {
  const totalEntries = scheduleCache.size;
  let expiredEntries = 0;
  
  for (const entry of scheduleCache.values()) {
    if (isExpired(entry)) {
      expiredEntries++;
    }
  }
  
  return {
    totalEntries,
    expiredEntries
  };
}
