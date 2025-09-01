/**
 * GET ALL ROUTES NORMALIZER
 * 
 * Normalizare răspunsuri XML/JSON în modele TypeScript structurate
 * Gestionează toate tipurile de structuri de date (arrays, objects, mixed)
 */

import type {
  RawGetAllRoutesResponse,
  RouteSchedule,
  BaggageItem,
  ScheduleStation,
  RouteDiscount,
  CancelHourInfo,
  RouteInterval,
  TransferTime,
  RawBaggageItem,
  RawScheduleStation,
  RawRouteDiscount,
  RawCancelHourInfo,
  RawRouteInterval
} from '@/types/getAllRoutes';

// ===============================
// Utility Functions
// ===============================

function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? 0 : num;
}

function safeBinary(value: unknown): 0 | 1 {
  if (value === null || value === undefined) return 0;
  const num = safeNumber(value);
  return num > 0 ? 1 : 0;
}

function parseCommaList(value: unknown): string[] {
  if (!value) return [];
  const str = safeString(value);
  if (!str) return [];
  
  return str.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function normalizeItemArray<T>(
  rawData: { item?: T[] | T } | T[] | undefined,
  defaultValue: T[] = []
): T[] {
  if (!rawData) return defaultValue;
  
  // If it's already an array
  if (Array.isArray(rawData)) {
    return rawData;
  }
  
  // If it has an 'item' property
  if (typeof rawData === 'object' && rawData !== null && 'item' in rawData) {
    const itemData = (rawData as { item?: T[] | T }).item;
    if (!itemData) return defaultValue;
    
    return Array.isArray(itemData) ? itemData : [itemData];
  }
  
  // Single object - wrap in array
  return [rawData as T];
}

// ===============================
// Baggage Normalization
// ===============================

function normalizeBaggageItem(raw: RawBaggageItem): BaggageItem {
  return {
    baggage_id: safeString(raw.baggage_id),
    baggage_type_id: safeString(raw.baggage_type_id),
    baggage_type: safeString(raw.baggage_type),
    baggage_title: safeString(raw.baggage_title),
    
    // Physical dimensions
    length: raw.length ? safeNumber(raw.length) : undefined,
    width: raw.width ? safeNumber(raw.width) : undefined,
    height: raw.height ? safeNumber(raw.height) : undefined,
    kg: raw.kg ? safeNumber(raw.kg) : undefined,
    
    // Quantity limits
    max_in_bus: raw.max_in_bus ? safeNumber(raw.max_in_bus) : undefined,
    max_per_person: raw.max_per_person ? safeNumber(raw.max_per_person) : undefined,
    
    // Pricing
    typ: safeString(raw.typ),
    price: safeNumber(raw.price),
    currency: safeString(raw.currency),
    
    // Additional info
    description: raw.description ? safeString(raw.description) : undefined,
    icon: raw.icon ? safeString(raw.icon) : undefined
  };
}

function normalizeBaggage(rawBaggage: RawGetAllRoutesResponse['baggage']): BaggageItem[] {
  if (!rawBaggage) return [];
  
  const rawItems = normalizeItemArray(rawBaggage);
  return rawItems.map(normalizeBaggageItem);
}

// ===============================
// Station/Schedule Normalization
// ===============================

function normalizeTransferTime(raw: RawScheduleStation['transfer_time']): TransferTime | undefined {
  if (!raw) return undefined;
  
  return {
    d: safeNumber(raw.d),
    h: safeNumber(raw.h),
    m: safeNumber(raw.m)
  };
}

function normalizeScheduleStation(raw: RawScheduleStation): ScheduleStation {
  return {
    // Location identifiers
    point_id: safeString(raw.point_id),
    point_name: safeString(raw.point_name),
    station_name: raw.station_name ? safeString(raw.station_name) : undefined,
    station_lat: raw.station_lat ? safeNumber(raw.station_lat) : undefined,
    station_lon: raw.station_lon ? safeNumber(raw.station_lon) : undefined,
    
    // Arrival timing
    date_arrival: raw.date_arrival ? safeString(raw.date_arrival) : undefined,
    arrival: raw.arrival ? safeString(raw.arrival) : undefined,
    
    // Departure timing
    date_departure: raw.date_departure ? safeString(raw.date_departure) : undefined,
    departure: raw.departure ? safeString(raw.departure) : undefined,
    
    // Multi-day support
    day_in_way: raw.day_in_way ? safeNumber(raw.day_in_way) : undefined,
    
    // Transfer information
    point_change: raw.point_change,
    transfer_time: normalizeTransferTime(raw.transfer_time),
    
    // Additional station info
    platform: raw.platform ? safeString(raw.platform) : undefined,
    station_info: raw.station_info ? safeString(raw.station_info) : undefined,
    amenities: raw.amenities ? parseCommaList(raw.amenities) : undefined
  };
}

function normalizeStations(rawStations: RawGetAllRoutesResponse['stations']): ScheduleStation[] {
  if (!rawStations) return [];
  
  const rawItems = normalizeItemArray(rawStations);
  return rawItems.map(normalizeScheduleStation);
}

// ===============================
// Discounts Normalization
// ===============================

function normalizeRouteDiscount(raw: RawRouteDiscount): RouteDiscount {
  const discountTypeValue = raw.discount_type ? safeString(raw.discount_type) : undefined;
  const validDiscountTypes = ["age", "student", "group", "promo"];
  
  return {
    discount_id: safeString(raw.discount_id),
    discount_name: safeString(raw.discount_name),
    discount_type: discountTypeValue && validDiscountTypes.includes(discountTypeValue) 
      ? discountTypeValue as "age" | "student" | "group" | "promo" 
      : undefined,
    percentage: raw.percentage ? safeNumber(raw.percentage) : undefined,
    description: raw.description ? safeString(raw.description) : undefined
  };
}

function normalizeDiscounts(rawDiscounts: RawGetAllRoutesResponse['discounts']): RouteDiscount[] {
  if (!rawDiscounts) return [];
  
  const rawItems = normalizeItemArray(rawDiscounts);
  return rawItems.map(normalizeRouteDiscount);
}

// ===============================
// Cancel Policy Normalization
// ===============================

function normalizeCancelHourInfo(raw: RawCancelHourInfo): CancelHourInfo {
  return {
    hours_after_depar: raw.hours_after_depar ? safeNumber(raw.hours_after_depar) : undefined,
    hours_before_depar: raw.hours_before_depar ? safeNumber(raw.hours_before_depar) : undefined,
    cancel_rate: safeNumber(raw.cancel_rate),
    money_back: raw.money_back ? safeNumber(raw.money_back) : undefined
  };
}

function normalizeCancelHours(rawCancelHours: RawGetAllRoutesResponse['cancel_hours_info']): CancelHourInfo[] {
  if (!rawCancelHours) return [];
  
  const rawItems = normalizeItemArray(rawCancelHours);
  return rawItems.map(normalizeCancelHourInfo);
}

// ===============================
// Intervals Normalization
// ===============================

function normalizeRouteInterval(raw: RawRouteInterval): RouteInterval {
  return {
    interval_id: safeString(raw.interval_id),
    from_point_id: safeString(raw.from_point_id),
    to_point_id: safeString(raw.to_point_id),
    departure_time: raw.departure_time ? safeString(raw.departure_time) : undefined,
    arrival_time: raw.arrival_time ? safeString(raw.arrival_time) : undefined,
    price: raw.price ? safeNumber(raw.price) : undefined,
    currency: raw.currency ? safeString(raw.currency) : undefined
  };
}

function normalizeIntervals(rawIntervals: RawGetAllRoutesResponse['intervals']): RouteInterval[] {
  if (!rawIntervals) return [];
  
  const rawItems = normalizeItemArray(rawIntervals);
  return rawItems.map(normalizeRouteInterval);
}

// ===============================
// Photo Array Normalization
// ===============================

function normalizePhotos(rawPhotos: string | string[] | undefined): string[] {
  if (!rawPhotos) return [];
  
  if (typeof rawPhotos === 'string') {
    // Check if it's a comma-separated list
    if (rawPhotos.includes(',')) {
      return parseCommaList(rawPhotos);
    }
    return [rawPhotos];
  }
  
  return Array.isArray(rawPhotos) ? rawPhotos : [];
}

// ===============================
// Main Normalization Function
// ===============================

/**
 * Normalize raw get_all_routes response to structured TypeScript model
 * 
 * @param rawResponse - Raw API response (JSON or parsed XML)
 * @returns Normalized RouteSchedule object
 */
export function normalizeGetAllRoutesResponse(rawResponse: RawGetAllRoutesResponse): RouteSchedule {
  // Handle API errors
  if (rawResponse.result === 0 && rawResponse.error) {
    throw new Error(`API Error: ${rawResponse.error}`);
  }
  
  const schedule: RouteSchedule = {
    // Route identification
    route_id: safeString(rawResponse.route_id),
    route_back_id: rawResponse.route_back_id ? safeString(rawResponse.route_back_id) : undefined,
    route_name: rawResponse.route_name ? safeString(rawResponse.route_name) : undefined,
    timetable_id: safeString(rawResponse.timetable_id),
    
    // Operator information
    carrier: rawResponse.carrier ? safeString(rawResponse.carrier) : undefined,
    carrier_id: rawResponse.carrier_id ? safeString(rawResponse.carrier_id) : undefined,
    logo_url: rawResponse.logo_url ? safeString(rawResponse.logo_url) : undefined,
    bustype: rawResponse.bustype ? safeString(rawResponse.bustype) : undefined,
    
    // Comfort features (parse CSV to array)
    comfort: rawResponse.comfort ? parseCommaList(rawResponse.comfort) : undefined,
    
    // Booking capabilities
    buy: rawResponse.buy,
    reserve: rawResponse.reserve,
    request: rawResponse.request,
    
    // Booking constraints
    lock_order: rawResponse.lock_order,
    lock_min: rawResponse.lock_min ? safeNumber(rawResponse.lock_min) : undefined,
    reserve_min: rawResponse.reserve_min ? safeNumber(rawResponse.reserve_min) : undefined,
    max_seats: rawResponse.max_seats ? safeNumber(rawResponse.max_seats) : undefined,
    
    // Sale timing
    start_sale_day: rawResponse.start_sale_day ? safeNumber(rawResponse.start_sale_day) : undefined,
    stop_sale_hours: rawResponse.stop_sale_hours ? safeNumber(rawResponse.stop_sale_hours) : undefined,
    
    // Baggage information
    baggage: normalizeBaggage(rawResponse.baggage),
    luggage: rawResponse.luggage ? safeString(rawResponse.luggage) : undefined,
    
    // Schedule details
    schledules: rawResponse.schledules ? {
      days: rawResponse.schledules.days ? safeNumber(rawResponse.schledules.days) : undefined,
      departure: rawResponse.schledules.departure ? safeString(rawResponse.schledules.departure) : undefined,
      time_in_way: rawResponse.schledules.time_in_way ? safeString(rawResponse.schledules.time_in_way) : undefined
    } : undefined,
    
    stations: normalizeStations(rawResponse.stations),
    intervals: normalizeIntervals(rawResponse.intervals),
    
    // Pricing options
    discounts: normalizeDiscounts(rawResponse.discounts),
    
    // Policies
    cancel_free_min: rawResponse.cancel_free_min ? safeNumber(rawResponse.cancel_free_min) : undefined,
    cancel_hours_info: normalizeCancelHours(rawResponse.cancel_hours_info),
    
    // Additional information
    route_info: rawResponse.route_info ? safeString(rawResponse.route_info) : undefined,
    route_foto: normalizePhotos(rawResponse.route_foto),
    regulations_url: rawResponse.regulations_url ? safeString(rawResponse.regulations_url) : undefined,
    
    // Metadata
    last_updated: new Date().toISOString(),
    cache_ttl: 30 // 30 minutes cache TTL
  };
  
  // Create consolidated cancel policy
  if (schedule.cancel_free_min || schedule.cancel_hours_info?.length) {
    schedule.cancel_policy = {
      cancel_free_min: schedule.cancel_free_min,
      cancel_hours_info: schedule.cancel_hours_info,
      description: generateCancelPolicyDescription(schedule.cancel_free_min, schedule.cancel_hours_info)
    };
  }
  
  return schedule;
}

// ===============================
// Helper Functions
// ===============================

function generateCancelPolicyDescription(
  cancelFreeMin?: number,
  cancelHours?: CancelHourInfo[]
): string {
  const parts: string[] = [];
  
  if (cancelFreeMin && cancelFreeMin > 0) {
    const hours = Math.floor(cancelFreeMin / 60);
    const minutes = cancelFreeMin % 60;
    
    if (hours > 0) {
      parts.push(`Anulare gratuită până la ${hours}h${minutes > 0 ? ` ${minutes}min` : ''} înainte de plecare`);
    } else {
      parts.push(`Anulare gratuită până la ${minutes} minute înainte de plecare`);
    }
  }
  
  if (cancelHours && cancelHours.length > 0) {
    const policies = cancelHours.map(policy => {
      let timeDesc = '';
      
      if (policy.hours_before_depar !== undefined) {
        timeDesc = `${policy.hours_before_depar}h înainte`;
      } else if (policy.hours_after_depar !== undefined) {
        timeDesc = `${policy.hours_after_depar}h după`;
      }
      
      const feeDesc = `${policy.cancel_rate}% comision`;
      return `${timeDesc}: ${feeDesc}`;
    });
    
    parts.push(`Politici anulare: ${policies.join(', ')}`);
  }
  
  return parts.join('. ') || 'Politică de anulare nu este specificată';
}

/**
 * Validate that a normalized schedule has minimum required data
 */
export function validateNormalizedSchedule(schedule: RouteSchedule): boolean {
  return !!(
    schedule.route_id &&
    schedule.timetable_id &&
    (schedule.stations?.length || schedule.schledules)
  );
}

/**
 * Get summary information from schedule for quick display
 */
export function getScheduleSummary(schedule: RouteSchedule) {
  const stationCount = schedule.stations?.length || 0;
  const firstStation = schedule.stations?.[0];
  const lastStation = schedule.stations?.[stationCount - 1];
  
  const freeBaggage = schedule.baggage?.filter(item => item.price === 0) || [];
  const paidBaggage = schedule.baggage?.filter(item => item.price > 0) || [];
  
  const hasPhotos = schedule.route_foto && schedule.route_foto.length > 0;
  const hasDiscounts = schedule.discounts && schedule.discounts.length > 0;
  
  return {
    station_count: stationCount,
    first_station: firstStation?.point_name,
    last_station: lastStation?.point_name,
    departure_time: firstStation?.departure || schedule.schledules?.departure,
    arrival_time: lastStation?.arrival,
    total_time: schedule.schledules?.time_in_way,
    free_baggage_count: freeBaggage.length,
    paid_baggage_count: paidBaggage.length,
    has_photos: hasPhotos,
    has_discounts: hasDiscounts,
    booking_types: [
      schedule.buy === 1 && 'buy',
      schedule.reserve === 1 && 'reserve',
      schedule.request === 1 && 'request'
    ].filter(Boolean) as string[]
  };
}
