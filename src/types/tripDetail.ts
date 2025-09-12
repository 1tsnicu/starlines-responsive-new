/**
 * TRIP DETAIL TYPES
 * 
 * Comprehensive TypeScript types for the trip detail page with seat selection
 * Supports both simple routes and multi-segment transfers
 */

// ===============================
// Core Trip Detail Types
// ===============================

export type Currency = "EUR" | "USD" | "MDL" | "RON" | "PLN" | "RUB" | "UAH" | "CZK";

export interface Discount {
  discount_id: string;
  discount_name: string;
  discount_price: number;
  discount_price_max?: number;
  discount_currency?: string;
}

export interface DiscountsResponse {
  route_id: string;
  discounts: Discount[];
}

export interface DiscountSelection {
  discount_id: string;
  discount_name: string;
  discount_price: number;
  discount_currency: string;
  passengers: number;
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
  price: number;
  currency: string;
}

export interface BaggageSelection {
  baggage_id: string;
  baggage_title: string;
  baggage_type: string;
  price: number;
  currency: string;
  quantity: number;
  passengers: number;
}

// ===============================
// Booking Types
// ===============================

export interface PassengerData {
  name: string;
  surname: string;
  birth_date: string;
  phone?: string;
  email?: string;
}

export interface BookingRequest {
  login: string;
  password: string;
  session?: string;
  partner?: string;
  v?: string;
  date: string[];
  interval_id: string[];
  station_from_id?: number[];
  station_to_id?: number[];
  seat: string[][];
  name: string[];
  surname: string[];
  middlename?: string[];
  birth_date: string[];
  doc_type?: number[];
  doc_number?: string[];
  doc_expire_date?: string[];
  citizenship?: string[];
  gender?: string[];
  discount_id?: number[][];
  baggage?: string[][];
  phone: string;
  phone2?: string;
  email: string;
  info?: string;
  currency: string;
  lang: string;
}

export interface BookingResponse {
  order_id: number;
  reservation_until: string;
  reservation_until_min: string;
  security: string;
  status: string;
  price_total: number;
  currency: string;
  promocode_info?: {
    promocode_valid: number;
    promocode_name: string;
    price_promocode: number;
  };
  [tripIndex: string]: any; // For trip data (0, 1, etc.)
}

export interface TripBookingData {
  trip_id: number;
  interval_id: string;
  route_id: string;
  trans: string;
  date_from: string;
  time_from: string;
  point_id_from: string;
  point_id_to: string;
  point_from: string;
  station_from: string;
  date_to: string;
  time_to: string;
  point_to: string;
  station_to: string;
  route_name: string;
  route_back: number;
  carrier: string;
  passengers: PassengerBookingData[];
}

export interface PassengerBookingData {
  passenger_id: number;
  transaction_id: number;
  name: string;
  surname: string;
  birth_date: string;
  seat: string;
  discount: string | null;
  price: number;
  baggage?: BaggageBookingData[];
}

export interface BaggageBookingData {
  baggage_id: string;
  baggage_type_id: string;
  baggage_type: string;
  baggage_type_abbreviated: string;
  baggage_title: string;
  length: string;
  width: string;
  height: string;
  kg: string;
  price: number;
  currency: string;
  baggage_ticket_id: number;
}

export interface BookingSummary {
  totalPrice: number;
  currency: string;
  passengers: number;
  trips: number;
  selectedSeats: string[][];
  selectedDiscounts: Record<string, string>[];
  selectedBaggage: Record<string, string[]>;
  promocode?: {
    name: string;
    discount: number;
  };
}

export interface RouteItem {
  trans: "bus";
  interval_id: string;
  route_name: string;
  has_plan: 0 | 1;
  carrier: string;
  comfort?: string;          // "wifi,220v,conditioner,..."
  rating?: string;           // "4.6"
  reviews?: string;          // "93"
  logo?: string;             // "333.png"
  timetable_id?: string;
  request_get_free_seats: 0 | 1;
  request_get_discount?: 0 | 1;
  request_get_baggage?: 0 | 1;

  day_open?: string;

  need_orderdata?: 0 | 1;
  can_cyrillic_orderdata?: 0 | 1;
  need_birth?: 0 | 1;
  need_doc?: 0 | 1;
  need_doc_expire_date?: 0 | 1;
  need_citizenship?: 0 | 1;
  need_gender?: 0 | 1;
  need_middlename?: 0 | 1;

  lock_order?: string;       // "1"
  lock_min?: string;         // "30"
  reserve_min?: string;      // "0"
  max_seats?: string;        // "10"
  start_sale_day?: string;   // "180"
  stop_sale_hours?: number;  // 0
  cancel_free_min?: string;  // "5"

  date_from: string;
  time_from: string;
  point_from?: string;
  station_from?: string;
  station_from_lat?: string;
  station_from_lon?: string;
  platform_from?: string | null;

  date_to: string;
  time_to: string;
  point_to?: string;
  station_to?: string;
  station_to_lat?: string;
  station_to_lon?: string;
  platform_to?: string | null;

  time_in_way?: string;      // "21:30"

  price_one_way?: string;    // "90"
  price_one_way_max?: string;
  price_two_way?: string;

  currency?: Currency;
  bonus_eur?: string;
  discounts?: Discount[] | null;

  free_seats?: Array<number | string>;
  luggage?: string;
  route_info?: string;

  cancel_hours_info?: Array<{
    hours_after_depar: string;
    hours_before_depar: string;
    cancel_rate: string;
    money_back: string;
  }>;

  change_route?: ChangeLeg[];
  
  // Additional fields from get_all_routes
  bustype?: string;                    // "Berkhof (49 seats)"
  stations?: Array<{
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
    transfer_time?: {
      d: string;
      h: string;
      m: string;
    };
  }>;
  discounts?: Array<{
    discount_id: string;
    discount_name: string;
  }>;
  baggage?: Array<{
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
  }>;
}

export interface ChangeLeg {
  date_from: string;
  time_from: string;
  date_to: string;
  time_to: string;
  point_from: string;
  station_from: string;
  station_from_lat?: string;
  station_from_lon?: string;
  point_to: string;
  station_to: string;
  station_to_id?: string;
  station_to_lat?: string;
  station_to_lon?: string;
  free_seats?: Array<number | string>;
  trans: "bus";
  change_typ?: "manual" | "auto";
  change_stations?: number;
  transfer_time?: { d: number; h: number; m: number };
  bustype_id?: string;
  has_plan?: 0 | 1;
  price_one_way?: string;
  currency?: string;
}

export interface FreeSeatItem {
  seat_number: number | string;
  seat_free: 0 | 1;
  seat_price?: number;
  seat_curency?: Currency;
}

export interface FreeSeatsTrip {
  bustype_id: string;
  has_plan: 0 | 1;
  free_seat: FreeSeatItem[];
}

export interface FreeSeatsResponse {
  trips: FreeSeatsTrip[];
}

export interface PlanResponse {
  plan_type: string; // == bustype_id
  floors: Array<{
    number: number;
    rows: { row: Array<{ seat: string[] }> };
  }>;
}

// ===============================
// Trip Detail Page Props
// ===============================

export interface TripDetailProps {
  intervalIdMain?: string;       // ex: "local|14916|..."
  intervalIdsAll?: string[];    // ex: pentru rute cu transfer ["local|14916|...", "11626|..."]
  timetableId?: string;
  hasPlan?: 0 | 1;
  requestGetFreeSeats?: 0 | 1;
  changeRoute?: Array<ChangeLeg>; // segmente de transfer din răspunsul get_routes
  routeMeta?: RouteSummary;      // nume, carrier, rating, comfort, times etc.
  currency?: string;             // "EUR"
  lang?: string;                 // "ru"
  searchContext?: {
    dateThere: string;          // ex: "2023-11-30"
    dateBack?: string;          // pentru retur
    id_from: string;            // "3"
    id_to: string;              // "6"
    station_id_from?: string;   // "123"
    station_id_to?: string;
    currency: "EUR";
    lang: "ru";
  };
  // Allow passing route data directly from parent component
  routeData?: RouteItem;
}

export interface RouteSummary {
  route_name: string;
  carrier: string;
  rating?: string;
  reviews?: string;
  logo?: string;
  comfort?: string[];
  time_in_way?: string;
  price_one_way?: number;
  price_one_way_max?: number;
  currency: Currency;
  date_from: string;
  time_from: string;
  point_from: string;
  station_from?: string;
  date_to: string;
  time_to: string;
  point_to: string;
  station_to?: string;
  luggage?: string;
  route_info?: string;
  cancel_hours_info?: Array<{
    hours_after_depar: string;
    hours_before_depar: string;
    cancel_rate: string;
    money_back: string;
  }>;
}

// ===============================
// Seat Map Types
// ===============================

export interface SeatInfo {
  number: string | null;
  icon?: string | null;
  isEmpty: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  isOccupied?: boolean;
  price?: number;
  currency?: Currency;
}

export interface PlanRow {
  seats: SeatInfo[];
  rowIndex: number;
}

export interface FloorInfo {
  number: number;
  rows: PlanRow[];
}

export interface BusPlan {
  planType: string;
  version: 1.1 | 2.0;
  floors: FloorInfo[];
  orientation: 'h' | 'v';
  busTypeId: string;
}

export interface SeatMapData {
  bustype_id: string;
  plan?: BusPlan;
  freeSeats: FreeSeatItem[];
  hasPlan: 0 | 1;
}

// ===============================
// Seat Selection Types
// ===============================

export interface SeatSelection {
  bustype_id: string;
  selectedSeats: string[];
  maxSeats: number;
  totalPrice: number;
  currency: Currency;
}

export interface TripSeatSelection {
  [bustype_id: string]: SeatSelection;
}

export interface SeatSelectionSummary {
  totalSeats: number;
  totalPrice: number;
  currency: Currency;
  segments: Array<{
    bustype_id: string;
    segmentName: string;
    selectedSeats: string[];
    price: number;
  }>;
}

// ===============================
// API Request/Response Types
// ===============================

export interface GetFreeSeatsRequest {
  interval_id: string;
  currency: string;
  lang: string;
}

export interface GetPlanRequest {
  bustype_id: string;
  position: "h";
  v?: "2.0";
}

// ===============================
// Component Props Types
// ===============================

export interface TripSummaryProps {
  route: RouteSummary;
  returnRoute?: RouteSummary; // Pentru călătoriile dus-întors
  passengers: number;
  onPassengersChange: (count: number) => void;
  isRoundTrip?: boolean;
  outboundDiscount?: DiscountSelection | null;
  returnDiscount?: DiscountSelection | null;
  outboundBaggage?: Record<string, BaggageSelection>;
  returnBaggage?: Record<string, BaggageSelection>;
  outboundTotalPrice?: number;
  returnTotalPrice?: number;
  currency?: string;
}

export interface SeatMapProps {
  seatMapData: SeatMapData;
  selectedSeats: string[];
  maxSeats: number;
  onSeatSelect: (seatNumber: string) => void;
  onSeatDeselect: (seatNumber: string) => void;
  loading?: boolean;
}

export interface SegmentSeatMapProps {
  segment: ChangeLeg;
  seatMapData?: SeatMapData;
  selectedSeats: string[];
  maxSeats: number;
  onSeatSelect: (seatNumber: string) => void;
  onSeatDeselect: (seatNumber: string) => void;
  loading?: boolean;
}

export interface LegendProps {
  className?: string;
}

export interface RouteSummary {
  route_name: string;
  carrier: string;
  rating?: string;
  reviews?: string;
  logo?: string;
  comfort?: string[];
  time_in_way?: string;
  price_one_way?: number;
  price_one_way_max?: number;
  currency?: string;
  date_from?: string;
  time_from?: string;
  point_from?: string;
  station_from?: string;
  date_to?: string;
  time_to?: string;
  point_to?: string;
  station_to?: string;
  luggage?: string;
  route_info?: string;
  cancel_hours_info?: CancelInfo[];
}

export interface TripSummaryProps {
  route: RouteSummary;
  passengers: number;
  onPassengersChange: (count: number) => void;
}

// ===============================
// Error Types
// ===============================

export interface TripDetailError {
  code: 'route_not_found' | 'seats_unavailable' | 'plan_unavailable' | 'network_error' | 'api_error';
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ===============================
// State Types
// ===============================

export interface TripDetailState {
  loading: boolean;
  error: TripDetailError | null;
  route: RouteItem | null;
  seatMaps: Record<string, SeatMapData>;
  seatSelection: TripSeatSelection;
  passengers: number;
  activeSegment: string | null;
}

// ===============================
// Utility Types
// ===============================

export type SeatStatus = 'available' | 'occupied' | 'selected' | 'disabled' | 'empty';

export interface SeatStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  cursor: string;
  opacity: number;
}
