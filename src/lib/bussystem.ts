// src/lib/bussystem.ts - Complete Bussystem API Client
import { useState, useEffect } from 'react';
import { mockBussystemAPI } from './mock-data';
import type { OutboundSelection, ReturnSearchParams, IntervalId } from '../types/return';
import type { GetFreeSeatsResponse } from '../types/seats';
import type { GetPlanResponse } from '../types/plan';
import type { GetDiscountsResponse } from '../types/discounts';
import type { GetBaggageResponse } from '../types/baggage';
import type { NewOrderPayload, NewOrderResponse } from '../types/newOrder';
import type { BuyTicketRequest, BuyTicketResponse } from '../types/buy';

// Configuration for Partner Affiliate Integration
export interface BussystemConfig {
  // API Configuration
  baseUrl: string;           // https://test-api.bussystem.eu/server
  login: string;             // Your test login
  password: string;          // Your test password
  
  // Partner Configuration
  partnerId: string;         // Your partner=XXXX ID
  
  // Booking URLs
  bookingBaseUrl: string;    // https://booking.bussystem.eu
  iframeBaseUrl: string;     // https://iframe.bussystem.eu/booking
  
  // Options
  useMockData: boolean;      // true for development, false for real API
  defaultLang: string;       // "ru", "en", "ro"
  defaultCurrency: string;   // "EUR", "UAH", "USD"
}

// Default configuration for testing
export const defaultBussystemConfig: BussystemConfig = {
  baseUrl: 'https://test-api.bussystem.eu/server',
  login: 'you_login',        // Will be replaced with real credentials
  password: 'you_password',  // Will be replaced with real credentials
  partnerId: 'XXXX',         // Will be replaced with real partner ID
  bookingBaseUrl: 'https://booking.bussystem.eu',
  iframeBaseUrl: 'https://iframe.bussystem.eu/booking',
  useMockData: true,         // Start with mock data
  defaultLang: 'ru',
  defaultCurrency: 'EUR'
};

// Partner Affiliate specific functions
export class BussystemPartnerAPI {
  constructor(private config: BussystemConfig = defaultBussystemConfig) {}

  // Generate booking URL for partner redirect
  generateBookingUrl(params: {
    pointFromId?: string;
    pointToId?: string;
    date?: string;
    routeId?: string;
    orderId?: string;
    security?: string;
    passengers?: number;
    timeFrom?: string;
    timeTo?: string;
  }): string {
    const { bookingBaseUrl, partnerId, defaultLang, defaultCurrency } = this.config;
    const urlParams = new URLSearchParams();
    
    // Always include partner ID
    urlParams.append('partner', partnerId);
    urlParams.append('lang', defaultLang);
    urlParams.append('currency', defaultCurrency);
    
    // Add specific parameters
    if (params.pointFromId) urlParams.append('city_from', params.pointFromId);
    if (params.pointToId) urlParams.append('city_to', params.pointToId);
    if (params.date) urlParams.append('date_from', params.date);
    if (params.routeId) urlParams.append('route_id', params.routeId);
    if (params.passengers) urlParams.append('passengers', params.passengers.toString());
    if (params.timeFrom) urlParams.append('time_from', params.timeFrom);
    if (params.timeTo) urlParams.append('time_to', params.timeTo);
    
    // For payment page
    if (params.orderId && params.security) {
      return `${bookingBaseUrl}/payment?id=${params.orderId}&code=${params.security}&${urlParams.toString()}`;
    }
    
    // For deeplink
    if (params.routeId) {
      return `${bookingBaseUrl}/deeplink?${urlParams.toString()}`;
    }
    
    // For general search
    return `${bookingBaseUrl}?${urlParams.toString()}`;
  }

  // Generate iframe URL
  generateIframeUrl(params: {
    pointFromId?: string;
    pointToId?: string;
    date?: string;
    orderId?: string;
    security?: string;
  }): string {
    const { iframeBaseUrl, partnerId, defaultLang, defaultCurrency } = this.config;
    const urlParams = new URLSearchParams();
    
    urlParams.append('partner', partnerId);
    urlParams.append('lang', defaultLang);
    urlParams.append('currency', defaultCurrency);
    
    if (params.pointFromId) urlParams.append('point_from_id', params.pointFromId);
    if (params.pointToId) urlParams.append('point_to_id', params.pointToId);
    if (params.date) urlParams.append('date', params.date);
    if (params.orderId) urlParams.append('order_id', params.orderId);
    if (params.security) urlParams.append('security', params.security);
    
    return `${iframeBaseUrl}?${urlParams.toString()}`;
  }

  // Modified API call to include partner ID
  private async makeApiCall<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    if (this.config.useMockData) {
      // Use existing mock data for development
      return mockBussystemAPI.makeRequest(endpoint, data);
    }

    const requestData = {
      ...data,
      login: this.config.login,
      password: this.config.password,
      partner: this.config.partnerId, // Always include partner ID
    };

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Partner-specific workflow methods
  async searchRoutes(params: {
    pointFromId: string;
    pointToId: string;
    date: string;
  }) {
    return this.makeApiCall('/curl/get_routes.php', {
      point_from_id: params.pointFromId,
      point_to_id: params.pointToId,
      date_from: params.date,
      lang: this.config.defaultLang,
    });
  }

  async createOrder(orderData: NewOrderPayload) {
    // For partners, we create order but redirect for payment
    const result = await this.makeApiCall<NewOrderResponse>('/curl/new_order.php', orderData);
    
    // Generate payment URL for redirect
    if (result.order_id && result.security) {
      result.payment_url = this.generateBookingUrl({
        orderId: result.order_id.toString(),
        security: result.security,
      });
    }
    
    return result;
  }

  // Check if order was paid (after user returns from payment)
  async checkOrderStatus(orderId: string, security: string) {
    return this.makeApiCall('/curl/get_order.php', {
      order_id: orderId,
      security: security,
    });
  }

  // Get available seats
  async getSeats(intervalId: string) {
    return this.makeApiCall<GetFreeSeatsResponse>('/curl/get_free_seats.php', {
      interval_id: intervalId,
      lang: this.config.defaultLang,
    });
  }

  // Search points/cities
  async searchPoints(query: string) {
    return this.makeApiCall<BussPoint[]>('/curl/get_points.php', {
      autocomplete: query,
      lang: this.config.defaultLang,
    });
  }
}

// Create global instance for easy use
export const bussystemAPI = new BussystemPartnerAPI();

// Types
type Json = Record<string, unknown>;

export interface BussPoint {
  point_id: string;
  point_ru_name: string | null;
  point_ua_name: string | null;
  point_latin_name: string | null;
  point_name: string | null;
  country_name: string | null;
  country_kod: string | null;
  country_id: string | null;
  point_name_detail: string | null;
  priority: string | null;
}

export interface RouteSummary {
  trans: "bus" | "train" | string;
  interval_id: string;              // Key for new_order / buy flow
  route_name: string;
  
  has_plan: 0 | 1;
  carrier?: string;
  
  comfort?: string;                 // "wifi,220v,conditioner,music,tv"
  rating?: string;                  // "4.6"
  reviews?: string;                 // "93"
  logo?: string;                    // "333.png"
  
  timetable_id?: string;
  request_get_free_seats?: 0 | 1;  // If 1 -> call /get_free_seats
  request_get_discount?: 0 | 1;    // If 1 -> call /get_discount
  request_get_baggage?: 0 | 1;     // If 1 -> baggage info endpoint
  
  day_open?: string;
  
  // "need_*" helps build passenger form for new_order
  need_orderdata?: 0 | 1;
  can_cyrillic_orderdata?: 0 | 1;
  need_birth?: 0 | 1;
  need_doc?: 0 | 1;
  need_doc_expire_date?: 0 | 1;
  need_citizenship?: 0 | 1;
  need_gender?: 0 | 1;
  need_middlename?: 0 | 1;
  
  lock_order?: "0" | "1";
  lock_min?: string;               // "30"
  reserve_min?: string;            // "0"
  max_seats?: string;              // "10"
  start_sale_day?: string;         // "180"
  stop_sale_hours?: number;        // 0
  cancel_free_min?: string;        // "5"
  
  date_from: string;               // "2023-11-30"
  time_from: string;               // "12:00:00"
  point_from: string;              // "Прага"
  station_from?: string;
  station_from_lat?: string;
  station_from_lon?: string;
  platform_from?: string;
  
  date_to: string;                 // "2023-12-01"
  time_to: string;                 // "10:30:00"
  point_to: string;                // "Киев"
  station_to?: string;
  station_to_lat?: string;
  station_to_lon?: string;
  platform_to?: string;
  time_in_way?: string;            // "21:30"
  
  price_one_way?: string;          // "90"
  price_one_way_max?: string;
  price_two_way?: string;
  currency?: string;               // "EUR"
  
  bonus_eur?: string;
  
  discounts?: Array<{
    discount_id: string;
    discount_name: string;
    discount_price: number;
  }>;
  
  free_seats?: Array<number | string>; // May come directly in response
  luggage?: string;               // Baggage text
  route_info?: string;            // Info text
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

export interface OrderInfo {
  order_id: string;
  security?: string;
  lock_min?: number;
  status?: string;
  price?: number;
  currency?: string;
  passengers?: PassengerInfo[];
  // Add more fields as needed
}

export interface TicketInfo {
  ticket_id?: string;
  order_id?: string;
  status?: string;
  price?: number;
  currency?: string;
  passenger_info?: PassengerInfo;
  // Add more fields as needed
}

export interface PassengerInfo {
  first_name: string;
  last_name: string;
  phone?: string;
  seat_no?: string;
  document_type?: string;
  document_number?: string;
  birth_date?: string;
  gender?: string;
  // Add more fields as required by operators
}

// Generic API response types
export interface ApiResponse {
  error?: string;
  [key: string]: unknown;
}

export interface SeatsResponse extends ApiResponse {
  free_seats?: number;
  total_seats?: number;
  available_count?: number;
  total_count?: number;
  seats?: Array<{
    seat_no: string;
    status: string;
    price?: number;
  }>;
}

export interface PlanResponse extends ApiResponse {
  plan?: Array<{
    row: number;
    seats: Array<{
      seat_no: string;
      x: number;
      y: number;
      status: string;
    }>;
  }>;
}

// Configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_BUSSYSTEM === "true" || 
                   import.meta.env.DEV && !import.meta.env.VITE_BUSS_LOGIN;

const BASE_URL = import.meta.env.DEV 
  ? "/api/bussystem"  // Always use proxy in development
  : (import.meta.env.VITE_BUSS_BASE_URL || "https://test-api.bussystem.eu/server");
const LOGIN = import.meta.env.VITE_BUSS_LOGIN || "";
const PASSWORD = import.meta.env.VITE_BUSS_PASSWORD || "";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json", // Force JSON response instead of XML
};

// Helper function with timeout
function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error("Request timeout")), ms)
    ),
  ]);
}

// Generic POST helper
async function post<T = ApiResponse>(path: string, body: Json): Promise<T> {
  if (!LOGIN || !PASSWORD) {
    throw new Error("BUSS login/password lipsesc din .env");
  }
  
  const url = `${BASE_URL}${path}`;
  const payload = { 
    login: LOGIN, 
    password: PASSWORD, 
    json: 1, // Force JSON response
    ...body 
  };

  const request = fetch(url, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  let res: Response;
  try {
    res = await withTimeout(request, 15000);
  } catch (e: unknown) {
    if ((e as Error)?.message === "Request timeout") {
      throw new Error("Bussystem API: timeout la solicitare.");
    }
    throw e;
  }

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok && !contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bussystem API: HTTP ${res.status} - ${text}`);
  }

  if (contentType.includes("application/json")) {
    const data = await res.json();
    
    if (data?.error) {
      throw new Error(`Bussystem API error: ${String(data.error)}`);
    }
    
    return data as T;
  } else {
    // Handle XML response
    const text = await res.text();
    if (text.includes("<error>dealer_no_activ</error>")) {
      throw new Error("dealer_no_activ");
    }
    throw new Error("Răspuns XML neașteptat; asigură-te că trimiți Accept: application/json");
  }
}

// ------------- SEARCH & INFO ------------- 

/**
 * Autocomplete cities/points
 */
export async function getPoints(params: {
  autocomplete?: string;
  lang?: string; // "ru" | "en" | "ua"
  session?: string;
}): Promise<BussPoint[]> {
  if (USE_MOCK_API) {
    return mockBussystemAPI.getPoints(params);
  }
  return post<BussPoint[]>("/curl/get_points.php", params);
}

/**
 * Search available routes between two points
 * ⚠️ ATENȚIE: Nu abuzați - max ~100:1 ratio (100 căutări pentru 1 comandă plătită)
 */
export async function getRoutes(params: {
  date: string;            // "YYYY-MM-DD"
  id_from: string;         // "3" from get_points
  id_to: string;           // "6" from get_points
  station_id_from?: string; // "123" from get_points
  trans?: "bus" | "train"; // transport type
  change?: "auto" | "no";  // "auto" for multi-carrier connections
  currency?: string;       // "EUR"
  lang?: string;           // "ru"
  v?: string;              // "1.1"
  session?: string;
}): Promise<RouteSummary[]> {
  if (USE_MOCK_API) {
    return mockBussystemAPI.getRoutes(params);
  }
  return post<RouteSummary[]>("/curl/get_routes.php", {
    json: 1,
    trans: "bus",
    change: "auto",
    currency: "EUR",
    lang: "ru",
    v: "1.1",
    ...params,
  });
}

/**
 * Get all routes schedule for a specific route
 */
export async function getAllRoutes(params: { 
  interval_id: string;     // Key from get_routes response
  session?: string;
}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/get_all_routes.php", {
    route_id: params.interval_id, // Map interval_id to route_id for API
    session: params.session,
  });
}

/**
 * Get discounts for a route (if supported)
 * IMPORTANT: Only call this when request_get_discount = 1
 * For request_get_discount = 0, use discounts field from get_routes response
 */
export async function getDiscounts(params: { 
  interval_id: string;     // Key from get_routes response
  currency?: string;       // "EUR"
  lang?: string;           // "ru"
  v?: string;              // API version
  session?: string;
}): Promise<GetDiscountsResponse> {
  const { interval_id, currency = "EUR", lang = "ru", v, session } = params;
  
  if (USE_MOCK_API) {
    return (mockBussystemAPI as {
      getDiscounts: (params: {
        interval_id: string;
        currency?: string;
        lang?: string;
        v?: string;
        session?: string;
      }) => Promise<GetDiscountsResponse>
    }).getDiscounts({ interval_id, currency, lang, v, session });
  }
  
  return post<GetDiscountsResponse>("/curl/get_discount.php", {
    json: 1,
    interval_id,
    currency,
    lang,
    ...(v ? { v } : {}),
    session,
  });
}

// ------------- BAGGAGE ------------- 

export async function getBaggage(params: {
  interval_id: string;     // Key from get_routes response
  station_id_to?: string;  // Station ID if fixed on return
  currency?: string;       // "EUR"
  lang?: string;           // "ru"
  v?: string;              // API version
  session?: string;
}): Promise<GetBaggageResponse> {
  const { interval_id, station_id_to, currency = "EUR", lang = "ru", v, session } = params;
  
  if (USE_MOCK_API) {
    return (mockBussystemAPI as {
      getBaggage: (params: {
        interval_id: string;
        station_id_to?: string;
        currency?: string;
        lang?: string;
        v?: string;
        session?: string;
      }) => Promise<GetBaggageResponse>;
    }).getBaggage(params);
  }

  return post<GetBaggageResponse>("/curl/get_baggage.php", {
    json: 1,
    interval_id,
    ...(station_id_to ? { station_id_to } : {}),
    currency,
    lang,
    ...(v ? { v } : {}),
    session,
  });
}

// ------------- SEATS & SEATING ------------- 

/**
 * Get free seats for bus/train + wagon info for trains
 * Respectă request_get_free_seats din get_routes response:
 * - 0: folosește free_seats din get_routes (nu chema această funcție)
 * - 1: OBLIGATORIU să chemi această funcție pentru locuri exacte
 */
export async function getFreeSeats(params: {
  interval_id: string;     // Key from get_routes response
  date?: string;           // YYYY-MM-DD (poate fi opțional)
  currency?: string;       // "EUR"
  lang?: string;           // "ru"
  v?: string;              // "1.1"
  session?: string;
}): Promise<GetFreeSeatsResponse> {
  if (USE_MOCK_API) {
    return (mockBussystemAPI as { 
      getFreeSeats: (params: {
        interval_id: string;
        date?: string;
        currency?: string;
        lang?: string;
        v?: string;
        session?: string;
      }) => Promise<GetFreeSeatsResponse>
    }).getFreeSeats(params);
  }
  return post<GetFreeSeatsResponse>("/curl/get_free_seats.php", {
    json: 1,
    interval_id: params.interval_id,
    currency: params.currency || "EUR",
    lang: params.lang || "ru",
    v: params.v || "1.1",
    session: params.session,
  });
}

/**
 * Get seating plan (optional, for visual seat selection)
 * Folosește când has_plan = 1 pentru afișarea grafică a locurilor
 */
export async function getPlan(params: { 
  bustype_id: string;      // bustype_id from get_free_seats response
  position?: "h" | "v";    // "h" = horizontal orientation (default)
  v?: string;              // API version "2.0" (default)
  session?: string;
}): Promise<GetPlanResponse> {
  const { bustype_id, position = "h", v = "2.0", session } = params;
  
  if (USE_MOCK_API) {
    return (mockBussystemAPI as {
      getPlan: (params: {
        bustype_id: string;
        position?: string;
        v?: string;
        session?: string;
      }) => Promise<GetPlanResponse>
    }).getPlan({ bustype_id, position, v, session });
  }
  
  return post<GetPlanResponse>("/curl/get_plan.php", {
    json: 1,
    bustype_id,
    position,
    v,
    session,
  });
}

// ------------- ORDERS & BOOKING ------------- 

/**
 * Create new order (locks seats for reservation)
 * Follows complete Bussystem API specification for new_order
 */
export async function newOrder(payload: NewOrderPayload): Promise<NewOrderResponse> {
  if (USE_MOCK_API) {
    return (mockBussystemAPI as {
      newOrder: (payload: NewOrderPayload) => Promise<NewOrderResponse>;
    }).newOrder(payload);
  }

  // Pentru new_order, trimitem exact payload-ul așa cum este (include login/password)
  return post<NewOrderResponse>("/curl/new_order.php", {
    json: 1,
    ...payload
  });
}

/**
 * Buy ticket from created order
 */
export async function buyTicket(req: BuyTicketRequest): Promise<BuyTicketResponse> {
  const { order_id, lang = "ru", v = "1.1" } = req;
  
  // Use mock API for development
  if (USE_MOCK_API) {
    return (mockBussystemAPI as {
      buyTicket: (params: { order_id: number; lang?: string; v?: string }) => Promise<BuyTicketResponse>;
    }).buyTicket({ order_id, lang, v });
  }
  
  return post<BuyTicketResponse>("/curl/buy_ticket.php", {
    json: 1,
    order_id,
    lang,
    v,
  });
}

/**
 * Cancel ticket/order (may have fees depending on route)
 */
export async function cancelTicket(params: {
  order_id?: string;
  ticket_id?: string;
  session?: string;
}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/cancel_ticket.php", params);
}

// ------------- RESERVATION (Pay on Board) ------------- 

/**
 * Validate before reservation with pay-on-board
 */
export async function reserveValidation(params: {
  order_id: string;
  phone?: string;
  session?: string;
}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/reserve_validation.php", params);
}

/**
 * Validate SMS code for phone verification
 */
export async function smsValidation(params: {
  phone: string;
  code: string;
  session?: string;
}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/sms_validation.php", params);
}

/**
 * Finalize reservation with pay-on-board
 */
export async function reserveTicket(params: {
  order_id: string;
  session?: string;
}): Promise<ApiResponse> {
  if (USE_MOCK_API) {
    return mockBussystemAPI.reserveTicket(params);
  }
  return post<ApiResponse>("/curl/reserve_ticket.php", params);
}

// ------------- INFO RETRIEVAL ------------- 

/**
 * Get order details
 */
export async function getOrder(params: { 
  order_id: string; 
  session?: string;
}): Promise<OrderInfo> {
  if (USE_MOCK_API) {
    return mockBussystemAPI.getOrder(params);
  }
  return post<OrderInfo>("/curl/get_order.php", params);
}

/**
 * Get ticket details
 */
export async function getTicket(params: { 
  ticket_id: string; 
  session?: string;
}): Promise<TicketInfo> {
  return post<TicketInfo>("/curl/get_ticket.php", params);
}

// ------------- LISTS ------------- 

/**
 * Get list of orders
 */
export async function getOrders(params: { session?: string } = {}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/get_orders.php", params);
}

/**
 * Get list of tickets
 */
export async function getTickets(params: { session?: string } = {}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/get_tickets.php", params);
}

/**
 * Get cash info (uses same endpoint as getTickets per documentation)
 */
export async function getCash(params: { session?: string } = {}): Promise<ApiResponse> {
  return post<ApiResponse>("/curl/get_tickets.php", params);
}

// ------------- AFFILIATE / DISPATCHER ------------- 

/**
 * Get orders for affiliates
 */
export async function getAffiliateOrders(params: { session?: string } = {}): Promise<ApiResponse> {
  return post<ApiResponse>("/server/curl_partner/get_orders.php", params);
}

/**
 * Get tickets for dispatchers/operators
 */
export async function getDispatcherTickets(params: { session?: string } = {}): Promise<ApiResponse> {
  return post<ApiResponse>("/server/curl_dispatcher/get_tickets.php", params);
}

// ------------- HEALTH CHECK ------------- 

/**
 * Ping API to check connectivity
 */
export async function ping(): Promise<ApiResponse> {
  if (USE_MOCK_API) {
    return mockBussystemAPI.ping();
  }
  return post<ApiResponse>("/curl/ping.php", {});
}

// ------------- PRINT TICKET URL HELPER ------------- 

/**
 * Build URL for printing ticket PDF/HTML
 */
export function buildPrintTicketURL(args: {
  order_id: string;
  security: string;
  lang?: string;
}): string {
  const { order_id, security, lang = "ru" } = args;
  // For print URLs, always use the direct API URL since it's opened in a new window
  const baseUrl = import.meta.env.VITE_BUSS_BASE_URL?.replace("/server", "") || 
    "https://test-api.bussystem.eu";
  return `${baseUrl}/viev/frame/print_ticket.php?order_id=${encodeURIComponent(
    order_id
  )}&security=${encodeURIComponent(security)}&lang=${encodeURIComponent(lang)}`;
}

// ------------- REACT HOOKS ------------- 

/**
 * Hook for autocomplete points with debouncing
 */
export function usePointsAutocomplete(query: string, debounceMs: number = 300) {
  const [data, setData] = useState<BussPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!query || query.length < 2) {
        setData([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await getPoints({ autocomplete: query, lang: "ru" });
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError((e as Error)?.message || "Unknown error");
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(() => {
      run();
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, debounceMs]);

  return { data, loading, error };
}

/**
 * Hook for searching routes with caching
 */
export function useRouteSearch(params: {
  id_from?: string;        // point ID from get_points
  id_to?: string;          // point ID from get_points
  date?: string;           // YYYY-MM-DD
  station_id_from?: string; // optional station ID
  trans?: "bus" | "train";
  change?: "auto" | "no";
  currency?: string;
  lang?: string;
  session?: string;
}) {
  const [data, setData] = useState<RouteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    let cancelled = false;

    async function search() {
      if (!params.id_from || !params.id_to || !params.date) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const routes = await getRoutes({
          id_from: params.id_from,
          id_to: params.id_to,
          date: params.date,
          station_id_from: params.station_id_from,
          trans: params.trans || "bus",
          change: params.change || "auto",
          currency: params.currency || "EUR",
          lang: params.lang || "ru",
          session: params.session,
        });
        
        if (!cancelled) {
          setData(routes);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError((e as Error)?.message || "Unknown error");
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    search();

    return () => {
      cancelled = true;
    };
  }, [params.id_from, params.id_to, params.date, params.station_id_from, params.trans, params.change, params.currency, params.lang, params.session]);

  return { data, loading, error, refetch: () => {} }; // Add refetch if needed
}

/**
 * Search return routes (dus-întors) with proper direction inversion
 * ⚠️ ATENȚIE: Respectă toate regulile pentru căutarea rutelor de retur
 */
export async function getRoutesReturn(params: ReturnSearchParams): Promise<RouteSummary[]> {
  const {
    outbound: {
      id_from, id_to, station_id_from, station_id_to, date_arrival_go, intervals,
    },
    date_return,
    trans = "bus",
    currency = "EUR",
    lang = "ru",
    v = "1.1",
    session
  } = params;

  // 1) Validare: data retur >= data sosirii de la dus
  if (date_return < date_arrival_go) {
    throw new Error(`Data retur (${date_return}) nu poate fi mai devreme decât data sosirii dus (${date_arrival_go}).`);
  }

  // 2) Inversează direcția și stațiile
  const payload: Record<string, unknown> = {
    json: 1,
    date: date_return,
    id_from: id_to,        // swap: destinația dus devine originea retur
    id_to: id_from,        // swap: originea dus devine destinația retur
    interval_id: intervals, // OBLIGATORIU: toate interval_id din dus (nemodificate!)
    trans,
    change: "auto",
    currency,
    lang,
    v,
    session,
  };

  // 3) Maparea stațiilor: dacă la dus ai fixat station_id_from, la retur devine station_id_to
  if (station_id_from) {
    payload.station_id_to = station_id_from; // te întorci CĂTRE aceeași stație
  }
  if (station_id_to) {
    payload.station_id_from = station_id_to; // pleci DE LA destinația dus
  }

  if (USE_MOCK_API) {
    // Pentru mock, simulează inversarea direcției
    return (mockBussystemAPI as {
      getRoutesReturn: (params: {
        date: string;
        id_from: string;
        id_to: string;
        station_id_from?: string;
        station_id_to?: string;
        interval_id: string | string[];
        trans?: "bus" | "train";
        change?: "auto" | "no";
        currency?: string;
        lang?: string;
        v?: string;
        session?: string;
      }) => Promise<RouteSummary[]>
    }).getRoutesReturn({
      date: date_return,
      id_from: id_to,
      id_to: id_from,
      station_id_from: station_id_to,
      station_id_to: station_id_from,
      interval_id: intervals,
      trans,
      change: "auto",
      currency,
      lang,
      v,
      session,
    });
  }

  return post<RouteSummary[]>("/curl/get_routes.php", payload);
}

/**
 * Helper pentru a extrage interval_id din răspunsul de la dus
 * Gestionează atât rutele simple cât și cele cu transferuri externe (trips[])
 */
export function extractIntervalsFromRoute(route: RouteSummary): IntervalId[] {
  // Dacă ruta are transferuri externe (trips[]), extrage toate interval_id
  if (route.trips && route.trips.length > 0) {
    return route.trips.map(trip => trip.interval_id);
  }
  
  // Altfel, folosește interval_id principal
  return [route.interval_id];
}

/**
 * Helper pentru a crea OutboundSelection din ruta selectată la dus
 */
export function createOutboundSelection(
  route: RouteSummary,
  searchParams: {
    id_from: string;
    id_to: string;
    station_id_from?: string;
    station_id_to?: string;
    date: string;
  }
): OutboundSelection {
  return {
    id_from: searchParams.id_from,
    id_to: searchParams.id_to,
    station_id_from: searchParams.station_id_from,
    station_id_to: searchParams.station_id_to,
    date_go: searchParams.date,
    date_arrival_go: route.date_to, // data sosirii din răspunsul API
    intervals: extractIntervalsFromRoute(route),
    selected_route: route,
  };
}

/**
 * Validează dacă data de retur este validă față de data sosirii dus
 */
export function validateReturnDate(arrivalDate: string, returnDate: string): boolean {
  return returnDate >= arrivalDate;
}

/**
 * Calculează data minimă pentru retur (= data sosirii dus)
 */
export function getMinReturnDate(arrivalDate: string): string {
  return arrivalDate;
}
