// types/return.ts - Types for return journey functionality

export type IntervalId = string;

export interface OutboundSelection {
  id_from: string;          // "3" - originea de la dus
  id_to: string;            // "6" - destinația de la dus
  station_id_from?: string; // "123" - stația exactă de plecare (opțional)
  station_id_to?: string;   // stația exactă de sosire (opțional)
  date_go: string;          // "2023-11-30" - data plecării dus
  date_arrival_go: string;  // "2023-12-01" - data sosirii dus (din item.date_to)
  intervals: IntervalId[];  // toate interval_id din trips[] sau singur interval
  selected_route?: RouteSummary; // ruta selectată pentru referință
}

export interface ReturnSearchParams {
  outbound: OutboundSelection;
  date_return: string;     // data dorită pentru retur
  trans?: "bus" | "train";
  currency?: string;
  lang?: string;
  v?: string;
  session?: string;
}

export interface TripBooking {
  outbound?: OutboundSelection;
  return?: RouteSummary;
  isRoundTrip: boolean;
}

// Extended RouteSummary to include trip segments
export interface RouteSummary {
  trans: "bus" | "train" | string;
  interval_id: string;
  route_name: string;
  
  has_plan: 0 | 1;
  carrier?: string;
  
  comfort?: string;
  rating?: string;
  reviews?: string;
  logo?: string;
  
  timetable_id?: string;
  request_get_free_seats?: 0 | 1;
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
  
  lock_order?: "0" | "1";
  lock_min?: string;
  reserve_min?: string;
  max_seats?: string;
  start_sale_day?: string;
  stop_sale_hours?: number;
  cancel_free_min?: string;
  
  date_from: string;
  time_from: string;
  point_from: string;
  station_from?: string;
  station_from_lat?: string;
  station_from_lon?: string;
  platform_from?: string;
  
  date_to: string;
  time_to: string;
  point_to: string;
  station_to?: string;
  station_to_lat?: string;
  station_to_lon?: string;
  platform_to?: string;
  time_in_way?: string;
  
  price_one_way?: string;
  price_one_way_max?: string;
  price_two_way?: string;
  currency?: string;
  
  bonus_eur?: string;
  
  discounts?: Array<{
    discount_id: string;
    discount_name: string;
    discount_price: number;
  }>;
  
  free_seats?: Array<number | string>;
  luggage?: string;
  route_info?: string;
  cancel_hours_info?: Array<{
    hours_after_depar: string;
    hours_before_depar: string;
    cancel_rate: string;
    money_back: string;
  }>;
  
  // Pentru transferuri externe (mai multe segmente)
  trips?: Array<{
    interval_id: string;
    route_name: string;
    carrier?: string;
    // ... alte proprietăți pentru segmente
  }>;
}
