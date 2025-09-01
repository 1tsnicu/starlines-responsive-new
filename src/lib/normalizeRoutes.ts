/**
 * ROUTES RESPONSE NORMALIZER
 * 
 * Normalizează răspunsurile brute de la API (XML/JSON) în modele TypeScript unificate
 * Gestionează transformări de date, validări, agregări și timezone-uri
 */

import type { 
  RawGetRoutesResponse, 
  RawTripSegment,
  RouteOption, 
  TripSegment, 
  TransferInfo,
  CancelPolicy,
  DateTimeLike,
  TransportMode 
} from '@/types/routes';

// ===============================
// Utility Functions
// ===============================

function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return '';
}

function safeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(safeString);
  if (typeof value === 'string') return [value];
  return [];
}

function safeBinary(value: unknown): 0 | 1 {
  if (value === 1 || value === '1') return 1;
  return 0;
}

function createDateTime(
  date: string, 
  time: string, 
  utc?: number,
  timezone?: string
): DateTimeLike {
  return {
    date: safeString(date),
    time: safeString(time),
    mktime_utc: utc ? safeNumber(utc) : undefined,
    timezone,
    display: timezone ? `${time} (${timezone})` : time
  };
}

function calculateDuration(fromUtc?: number, toUtc?: number): string | undefined {
  if (!fromUtc || !toUtc) return undefined;
  
  const diffMs = (toUtc - fromUtc) * 1000;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateOptionId(segments: TripSegment[]): string {
  const segmentHashes = segments.map(s => 
    `${s.route_id}-${s.interval_id}-${s.date_from}-${s.time_from}`
  );
  return btoa(segmentHashes.join('|')).replace(/[^a-zA-Z0-9]/g, '');
}

// ===============================
// Segment Normalizer
// ===============================

function normalizeSegment(raw: RawTripSegment): TripSegment {
  // Determine transport mode
  const rawTrans = safeString(raw.trans).toLowerCase();
  let trans: TransportMode = 'bus';
  if (rawTrans === 'train') trans = 'train';
  else if (rawTrans === 'air') trans = 'air';
  
  // Parse comfort features
  let comfort: string[] = [];
  if (raw.comfort) {
    if (Array.isArray(raw.comfort)) {
      comfort = raw.comfort.map(safeString);
    } else if (typeof raw.comfort === 'string') {
      // Split by common delimiters
      comfort = raw.comfort.split(/[,|;]/).map(s => s.trim()).filter(Boolean);
    }
  }
  
  // Parse free seats info
  const freeSeatsInfo = raw.free_seats_info ? {
    count: raw.free_seats_info.count ? {
      sitting: safeNumber(raw.free_seats_info.count.sitting),
      standing: safeNumber(raw.free_seats_info.count.standing)
    } : undefined,
    sitting: safeNumber(raw.free_seats_info.sitting),
    standing: safeNumber(raw.free_seats_info.standing),
    current_free_seats_typ: safeString(raw.free_seats_info.current_free_seats_typ) as "sitting" | "standing" | undefined,
    description: safeString(raw.free_seats_info.description)
  } : undefined;
  
  return {
    // Transport info
    trans,
    route_id: safeString(raw.route_id) || safeNumber(raw.route_id).toString(),
    interval_id: safeString(raw.interval_id),
    bus_id: raw.bus_id ? safeString(raw.bus_id) : undefined,
    
    // Capabilities
    has_plan: (raw.has_plan === 0 || raw.has_plan === 1 || raw.has_plan === 2) ? raw.has_plan : undefined,
    request_get_free_seats: safeBinary(raw.request_get_free_seats),
    request_get_discount: safeBinary(raw.request_get_discount),
    request_get_baggage: safeBinary(raw.request_get_baggage),
    timetable_id: raw.timetable_id ? safeNumber(raw.timetable_id) : undefined,
    
    // Departure
    date_from: safeString(raw.date_from),
    time_from: safeString(raw.time_from),
    mktime_utc_from: raw.mktime_utc_from ? safeNumber(raw.mktime_utc_from) : undefined,
    point_from_id: safeString(raw.point_from_id) || safeNumber(raw.point_from_id).toString(),
    point_from_name: safeString(raw.point_from_name),
    station_from_id: raw.station_from_id ? safeString(raw.station_from_id) : undefined,
    station_from_name: raw.station_from_name ? safeString(raw.station_from_name) : undefined,
    station_from_lat: raw.station_from_lat ? safeNumber(raw.station_from_lat) : undefined,
    station_from_lon: raw.station_from_lon ? safeNumber(raw.station_from_lon) : undefined,
    
    // Arrival
    date_to: safeString(raw.date_to),
    time_to: safeString(raw.time_to),
    mktime_utc_to: raw.mktime_utc_to ? safeNumber(raw.mktime_utc_to) : undefined,
    point_to_id: safeString(raw.point_to_id) || safeNumber(raw.point_to_id).toString(),
    point_to_name: safeString(raw.point_to_name),
    station_to_id: raw.station_to_id ? safeString(raw.station_to_id) : undefined,
    station_to_name: raw.station_to_name ? safeString(raw.station_to_name) : undefined,
    station_to_lat: raw.station_to_lat ? safeNumber(raw.station_to_lat) : undefined,
    station_to_lon: raw.station_to_lon ? safeNumber(raw.station_to_lon) : undefined,
    
    // Availability
    free_seats_info: freeSeatsInfo,
    
    // Operator
    carrier: raw.carrier ? safeString(raw.carrier) : undefined,
    carrier_id: raw.carrier_id ? safeString(raw.carrier_id) : undefined,
    logo_url: raw.logo_url ? safeString(raw.logo_url) : undefined,
    
    // Comfort
    comfort,
    
    // Pricing (INFORMATIVE)
    price_one_way: raw.price_one_way ? safeNumber(raw.price_one_way) : undefined,
    price_one_way_max: raw.price_one_way_max ? safeNumber(raw.price_one_way_max) : undefined,
    price_tax: raw.price_tax ? safeNumber(raw.price_tax) : undefined,
    provision: raw.provision ? safeNumber(raw.provision) : undefined,
    currency: safeString(raw.currency) || 'EUR',
    
    // Policies
    eticket: (raw.eticket === 0 || raw.eticket === 1 || raw.eticket === 2) ? raw.eticket : undefined,
    only_original: safeBinary(raw.only_original),
    international: safeBinary(raw.international),
    
    // Constraints
    need_birth: safeBinary(raw.need_birth),
    need_doc: safeBinary(raw.need_doc),
    need_citizenship: safeBinary(raw.need_citizenship),
    fast_booking: safeBinary(raw.fast_booking),
    max_seats: raw.max_seats ? safeNumber(raw.max_seats) : undefined,
    stop_sale_hours: raw.stop_sale_hours ? safeNumber(raw.stop_sale_hours) : undefined,
    start_sale_day: raw.start_sale_day ? safeNumber(raw.start_sale_day) : undefined
  };
}

// ===============================
// Transfer Info Normalizer
// ===============================

function normalizeTransferInfo(raw: Record<string, unknown>): TransferInfo | undefined {
  if (!raw.change_stations && !raw.change_typ && !raw.transfer_time) {
    return undefined;
  }
  
  let transferTime;
  if (raw.transfer_time && typeof raw.transfer_time === 'object') {
    const timeObj = raw.transfer_time as Record<string, unknown>;
    transferTime = {
      d: safeNumber(timeObj.d),
      h: safeNumber(timeObj.h),
      m: safeNumber(timeObj.m)
    };
  }
  
  return {
    change_stations: safeBinary(raw.change_stations),
    change_type: safeString(raw.change_typ) as "manual" | "auto" || "manual",
    transfer_time: transferTime
  };
}

// ===============================
// Cancel Policy Normalizer
// ===============================

function normalizeCancelPolicy(raw: RawTripSegment): CancelPolicy | undefined {
  const policy: CancelPolicy = {};
  let hasPolicyData = false;
  
  if (raw.cancel_free_min) {
    policy.cancel_free_min = safeNumber(raw.cancel_free_min);
    hasPolicyData = true;
  }
  
  if (raw.stop_sale_hours) {
    policy.stop_sale_hours = safeNumber(raw.stop_sale_hours);
    hasPolicyData = true;
  }
  
  if (raw.cancel_hours_info && Array.isArray(raw.cancel_hours_info)) {
    policy.cancel_hours_info = raw.cancel_hours_info.map(item => ({
      hours_after_depar: item.hours_after_depar ? safeNumber(item.hours_after_depar) : undefined,
      hours_before_depar: item.hours_before_depar ? safeNumber(item.hours_before_depar) : undefined,
      cancel_rate: item.cancel_rate ? safeNumber(item.cancel_rate) : undefined,
      money_back: item.money_back ? safeNumber(item.money_back) : undefined
    }));
    hasPolicyData = true;
  }
  
  return hasPolicyData ? policy : undefined;
}

// ===============================
// Route Option Aggregator
// ===============================

function aggregateRouteOption(
  segments: TripSegment[], 
  rawTransferInfo?: Record<string, unknown>,
  originalResponse?: Record<string, unknown>
): RouteOption {
  if (segments.length === 0) {
    throw new Error('Cannot create route option with no segments');
  }
  
  // Determine overall transport mode
  const modes = [...new Set(segments.map(s => s.trans))];
  const trans: TransportMode = modes.length > 1 ? 'mixed' : modes[0];
  
  // Journey times (first departure, last arrival)
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  
  const departure = createDateTime(
    firstSegment.date_from,
    firstSegment.time_from,
    firstSegment.mktime_utc_from
  );
  
  const arrival = createDateTime(
    lastSegment.date_to,
    lastSegment.time_to,
    lastSegment.mktime_utc_to
  );
  
  // Calculate duration
  const duration = calculateDuration(
    firstSegment.mktime_utc_from,
    lastSegment.mktime_utc_to
  );
  
  // Transfer info
  const transfers: TransferInfo[] = [];
  const transferInfo = normalizeTransferInfo(rawTransferInfo || {});
  if (transferInfo) {
    transfers.push(transferInfo);
  }
  
  // Aggregate pricing (INFORMATIVE ONLY)
  const prices = segments
    .map(s => s.price_one_way)
    .filter((p): p is number => typeof p === 'number');
  const priceFrom = prices.length > 0 ? Math.min(...prices) : undefined;
  const priceTo = prices.length > 0 ? Math.max(...prices) : undefined;
  
  // Aggregate capabilities
  const canGetPlan = segments.some(s => s.has_plan === 1 || s.has_plan === 2);
  const canGetSeats = segments.some(s => s.request_get_free_seats === 1);
  const canGetDiscounts = segments.some(s => s.request_get_discount === 1);
  const canGetBaggage = segments.some(s => s.request_get_baggage === 1);
  const canGetTimetable = segments.some(s => s.timetable_id && s.timetable_id > 0);
  
  // Aggregate policies
  const cancelPolicies = segments
    .map(normalizeCancelPolicy)
    .filter((p): p is CancelPolicy => p !== undefined);
  const cancelPolicy = cancelPolicies.length > 0 ? cancelPolicies[0] : undefined;
  
  // Booking types (simplified - would need more API info)
  const bookingTypes: ("buy" | "reserve" | "request")[] = ["buy"];
  
  // E-ticket availability
  const eticketAvailable = segments.some(s => s.eticket === 1 || s.eticket === 2);
  const requiresOriginalDocs = segments.some(s => s.only_original === 1);
  
  // Operators and features
  const carriers = [...new Set(segments.map(s => s.carrier).filter(Boolean))];
  const mainCarrier = carriers[0];
  const comfortFeatures = [...new Set(segments.flatMap(s => s.comfort || []))];
  
  // Check if needs revalidation (heuristic)
  const needsRevalidation = rawTransferInfo ? Object.keys(rawTransferInfo).length > 0 : false;
  
  return {
    option_id: generateOptionId(segments),
    trans,
    segments,
    departure,
    arrival,
    duration,
    transfers,
    transfer_count: Math.max(0, segments.length - 1),
    
    // Pricing
    price_from: priceFrom,
    price_to: priceTo,
    currency: segments[0].currency,
    price_disclaimer: "informative_only",
    
    // Capabilities
    canGetPlan,
    canGetSeats,
    canGetDiscounts,
    canGetBaggage,
    canGetTimetable,
    
    // Policies
    cancel_policy: cancelPolicy,
    booking_types: bookingTypes,
    eticket_available: eticketAvailable,
    requires_original_docs: requiresOriginalDocs,
    
    // Operators
    main_carrier: mainCarrier,
    carriers,
    comfort_features: comfortFeatures,
    
    // Internal
    needs_revalidation: needsRevalidation,
    original_response: originalResponse
  };
}

// ===============================
// Main Normalizer
// ===============================

/**
 * Normalizează răspunsul complet get_routes în RouteOption[]
 */
export function normalizeRoutesResponse(
  raw: RawGetRoutesResponse,
  searchUsedTransfers: boolean = false
): RouteOption[] {
  if (!raw.item || !Array.isArray(raw.item)) {
    console.warn('No route items in response');
    return [];
  }
  
  const options: RouteOption[] = [];
  
  for (const item of raw.item) {
    try {
      // Extract trip segments
      if (!item.trips || !item.trips.item || !Array.isArray(item.trips.item)) {
        console.warn('No trip segments in route item:', item);
        continue;
      }
      
      // Normalize each segment
      const segments = item.trips.item.map(normalizeSegment);
      
      if (segments.length === 0) {
        console.warn('No valid segments found in route item');
        continue;
      }
      
      // Create route option
      const option = aggregateRouteOption(
        segments,
        item, // transfer info at item level
        item as Record<string, unknown> // original response
      );
      
      // Mark if search used transfers (for revalidation)
      option.needs_revalidation = searchUsedTransfers;
      
      options.push(option);
      
    } catch (error) {
      console.error('Failed to normalize route item:', error, item);
      // Continue with other items
    }
  }
  
  console.log(`✅ Normalized ${options.length} route options from ${raw.item.length} raw items`);
  return options;
}

// ===============================
// Validation Helpers
// ===============================

/**
 * Validează că un RouteOption este complet și corect
 */
export function validateRouteOption(option: RouteOption): boolean {
  try {
    // Basic required fields
    if (!option.option_id || !option.segments || option.segments.length === 0) {
      return false;
    }
    
    // Each segment must have required fields
    for (const segment of option.segments) {
      if (!segment.route_id || !segment.interval_id || 
          !segment.date_from || !segment.time_from ||
          !segment.date_to || !segment.time_to) {
        return false;
      }
    }
    
    // Journey consistency
    if (!option.departure || !option.arrival) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Filtrează opțiunile valide
 */
export function filterValidOptions(options: RouteOption[]): RouteOption[] {
  return options.filter(validateRouteOption);
}

// ===============================
// Export All
// ===============================

export {
  normalizeSegment,
  normalizeTransferInfo,
  normalizeCancelPolicy,
  aggregateRouteOption,
  calculateDuration,
  createDateTime,
  generateOptionId
};

// Export types
export type { RouteOption, TripSegment, TransferInfo, CancelPolicy, DateTimeLike };
