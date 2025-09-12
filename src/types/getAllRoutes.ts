/**
 * TYPES FOR GET_ALL_ROUTES API
 * 
 * Types for the get_all_routes.php API response
 * Provides detailed route information including stations, baggage, discounts, etc.
 */

// ===============================
// Main Response Types
// ===============================

export interface GetAllRoutesResponse {
  item: RouteDetailsItem[];
}

export interface RouteDetailsItem {
  route_id: string;
  route_back_id?: string;
  buy: '0' | '1';
  reserve: '0' | '1';
  request: '0' | '1';
  international: '0' | '1';
  inland: '0' | '1';
  lock_order: '0' | '1';
  lock_min: string;
  reserve_min: string;
  start_sale_day: string;
  stop_sale_hours: string;
  cancel_free_min: string;
  route_name: string;
  carrier: string;
  comfort: string;
  bustype: string;
  baggage: BaggageItem[];
  luggage: string;
  route_info: string;
  from: RoutePoint;
  to: RoutePoint;
  schledules: ScheduleInfo;
  stations: StationItem[];
  intervals: IntervalItem[];
  discounts: DiscountItem[];
  cancel_hours_info: CancelHoursInfo[];
  route_foto: string[];
  regulations_url?: string;
}

// ===============================
// Supporting Types
// ===============================

export interface RoutePoint {
  point_id: string;
  point_name: string;
}

export interface ScheduleInfo {
  days: string;
  departure: string;
  time_in_way: string;
}

export interface StationItem {
  point_id: string;
  point_name: string;
  station_name: string;
  platform?: string;
  station_lat?: string;
  station_lon?: string;
  date_arrival: string;
  arrival: string;
  date_departure: string;
  departure: string;
  day_in_way: string;
  point_change?: '1';
  transfer_time?: TransferTime;
}

export interface TransferTime {
  d: string;
  h: string;
  m: string;
}

export interface IntervalItem {
  from_id: string;
  to_id: string[];
}

export interface DiscountItem {
  discount_id: string;
  discount_name: string;
}

export interface BaggageItem {
  baggage_id: string;
  baggage_type_id: string;
  baggage_type: string;
  baggage_type_abbreviated: string;
  baggage_title: string;
  length: string;
  width: string;
  height: string;
  kg: string;
  max_in_bus: string;
  max_per_person: string;
  typ: string;
  price: string;
  currency: string;
}

export interface CancelHoursInfo {
  hours_after_depar: string;
  hours_before_depar: string;
  cancel_rate: string;
  money_back: string;
}

// ===============================
// Error Types
// ===============================

export interface GetAllRoutesError {
  error: 'dealer_no_activ' | 'empty_timetable_id' | 'empty_route_id' | 'route_no_found' | 'route_data_no_found';
  detal?: string;
}

// ===============================
// Request Types
// ===============================

export interface GetAllRoutesRequest {
  login: string;
  password: string;
  session?: string;
  timetable_id: string;
  lang: 'en' | 'ru' | 'ua' | 'de' | 'pl' | 'cz';
}