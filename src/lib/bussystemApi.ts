/**
 * BUSSYSTEM API INTEGRATION
 * 
 * Integrare completă cu API-ul Bussystem folosind exemplele reale
 */

import { RouteItem, ChangeLeg } from '@/types/tripDetail';

// ===============================
// API Configuration
// ===============================

const API_BASE_URL = import.meta.env.DEV ? '/api/backend' : '/api/backend';

// ===============================
// Types for Bussystem API
// ===============================

interface BussystemRouteResponse {
  trans: string;
  interval_id: string;
  route_name: string;
  has_plan: 0 | 1;
  carrier: string;
  comfort?: string;
  rating?: string;
  reviews?: string;
  logo?: string;
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
  lock_order?: string;
  lock_min?: string;
  reserve_min?: string;
  max_seats?: string;
  start_sale_day?: string;
  stop_sale_hours?: number;
  cancel_free_min?: string;
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
  }> | null;
  free_seats?: Array<number | string>;
  luggage?: string;
  route_info?: string;
  cancel_hours_info?: Array<{
    hours_after_depar: string;
    hours_before_depar: string;
    cancel_rate: string;
    money_back: string;
  }>;
  change_route?: Array<{
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
    trans: string;
    change_typ?: "manual" | "auto";
    change_stations?: number;
    transfer_time?: { d: number; h: number; m: number };
  }>;
}

// ===============================
// API Functions
// ===============================

/**
 * Încarcă datele rutei din API-ul Bussystem
 */
export async function loadRouteFromBussystemAPI(intervalId: string): Promise<RouteItem> {
  try {
    // Pentru moment, simulăm răspunsul API-ului folosind datele din exemplu
    // În implementarea reală, aici ai face call către API-ul tău care la rândul său
    // apelează Bussystem API-ul
    
    const mockResponse: BussystemRouteResponse = {
      trans: "bus",
      interval_id: intervalId,
      route_name: "Прага - Киев",
      has_plan: 0,
      carrier: "Bus trans",
      comfort: "wifi,220v,conditioner,music,tv",
      rating: "4.6",
      reviews: "93",
      logo: "333.png",
      timetable_id: "local|14916|Mjc...DA=",
      request_get_free_seats: 0,
      request_get_discount: 0,
      request_get_baggage: 0,
      day_open: "Пн. Вт. Ср. Чт. Пт. Сб. Вс.",
      need_orderdata: 1,
      can_cyrillic_orderdata: 0,
      need_birth: 0,
      need_doc: 0,
      need_doc_expire_date: 0,
      need_citizenship: 0,
      need_gender: 0,
      need_middlename: 0,
      lock_order: "1",
      lock_min: "30",
      reserve_min: "0",
      max_seats: "10",
      start_sale_day: "180",
      stop_sale_hours: 0,
      cancel_free_min: "5",
      date_from: "2023-11-30",
      time_from: "12:00:00",
      point_from: "Прага",
      station_from: "Автовокзал \"Флоренц\", пл.3",
      station_from_lat: "50.0895953782425",
      station_from_lon: "14.440726339817",
      platform_from: "3",
      date_to: "2023-12-01",
      time_to: "10:30:00",
      point_to: "Киев",
      station_to: "Автостанция \"Киев\", ул. С. Петлюры, 32, (Ж/Д Вокзал), пл.33-38",
      station_to_lat: "50.4427213824899",
      station_to_lon: "30.4932510852814",
      platform_to: "33-38",
      time_in_way: "21:30",
      price_one_way: "90",
      price_one_way_max: "90",
      price_two_way: "180",
      currency: "EUR",
      bonus_eur: "1.35",
      discounts: [
        {
          discount_id: "34172",
          discount_name: "10% Пенсионеры",
          discount_price: 81
        },
        {
          discount_id: "34835",
          discount_name: "50% Дети 0-5 лет",
          discount_price: 45
        }
      ],
      free_seats: [1, 2, "3", "4", 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      luggage: "1 шт. до 50 кг - бесплатно. Каждый след. - 10 EUR.",
      route_info: "Велосипед (сложенный и упакованный) и детскую коляску (сложена и упакованная) перевозить можно за условия договоренности и свободного места в багажном отделении за дополнительную плату, которую огласит водитель при посадке. Перевозка животных без места – 50% от стоимости билета.",
      cancel_hours_info: [
        {
          hours_after_depar: "10001",
          hours_before_depar: "48",
          cancel_rate: "20",
          money_back: "72"
        },
        {
          hours_after_depar: "48",
          hours_before_depar: "24",
          cancel_rate: "50",
          money_back: "45"
        },
        {
          hours_after_depar: "24",
          hours_before_depar: "0",
          cancel_rate: "100",
          money_back: "0"
        }
      ]
    };

    // Convertim răspunsul Bussystem la formatul nostru
    const routeItem: RouteItem = {
      trans: mockResponse.trans as "bus",
      interval_id: mockResponse.interval_id,
      route_name: mockResponse.route_name,
      has_plan: mockResponse.has_plan,
      carrier: mockResponse.carrier,
      comfort: mockResponse.comfort,
      rating: mockResponse.rating,
      reviews: mockResponse.reviews,
      logo: mockResponse.logo,
      timetable_id: mockResponse.timetable_id,
      request_get_free_seats: mockResponse.request_get_free_seats,
      request_get_discount: mockResponse.request_get_discount,
      request_get_baggage: mockResponse.request_get_baggage,
      day_open: mockResponse.day_open,
      need_orderdata: mockResponse.need_orderdata,
      can_cyrillic_orderdata: mockResponse.can_cyrillic_orderdata,
      need_birth: mockResponse.need_birth,
      need_doc: mockResponse.need_doc,
      need_doc_expire_date: mockResponse.need_doc_expire_date,
      need_citizenship: mockResponse.need_citizenship,
      need_gender: mockResponse.need_gender,
      need_middlename: mockResponse.need_middlename,
      lock_order: mockResponse.lock_order,
      lock_min: mockResponse.lock_min,
      reserve_min: mockResponse.reserve_min,
      max_seats: mockResponse.max_seats,
      start_sale_day: mockResponse.start_sale_day,
      stop_sale_hours: mockResponse.stop_sale_hours,
      cancel_free_min: mockResponse.cancel_free_min,
      date_from: mockResponse.date_from,
      time_from: mockResponse.time_from,
      point_from: mockResponse.point_from,
      station_from: mockResponse.station_from,
      station_from_lat: mockResponse.station_from_lat,
      station_from_lon: mockResponse.station_from_lon,
      platform_from: mockResponse.platform_from,
      date_to: mockResponse.date_to,
      time_to: mockResponse.time_to,
      point_to: mockResponse.point_to,
      station_to: mockResponse.station_to,
      station_to_lat: mockResponse.station_to_lat,
      station_to_lon: mockResponse.station_to_lon,
      platform_to: mockResponse.platform_to,
      time_in_way: mockResponse.time_in_way,
      price_one_way: mockResponse.price_one_way,
      price_one_way_max: mockResponse.price_one_way_max,
      price_two_way: mockResponse.price_two_way,
      currency: mockResponse.currency as any,
      bonus_eur: mockResponse.bonus_eur,
      discounts: mockResponse.discounts,
      free_seats: mockResponse.free_seats,
      luggage: mockResponse.luggage,
      route_info: mockResponse.route_info,
      cancel_hours_info: mockResponse.cancel_hours_info,
      change_route: mockResponse.change_route as ChangeLeg[] | undefined,
    };

    return routeItem;
  } catch (error) {
    console.error('Error loading route from Bussystem API:', error);
    throw new Error('Eroare la încărcarea datelor rutei din API-ul Bussystem');
  }
}

/**
 * Încarcă ruta cu transfer (exemplu: Киев - Львов - Прага)
 */
export async function loadTransferRouteFromBussystemAPI(intervalId: string): Promise<RouteItem> {
  try {
    const mockResponse: BussystemRouteResponse = {
      trans: "bus",
      interval_id: intervalId,
      route_name: "Киев - Львов - Прага",
      has_plan: 1,
      carrier: "Mega bus",
      comfort: "tv,1_baggage_free,sms_ticket,wifi,music,conditioner,220v",
      rating: "4.2",
      reviews: "20",
      logo: "123.png",
      timetable_id: "local|14915|Mjc1...jAw",
      request_get_free_seats: 1,
      request_get_discount: 1,
      request_get_baggage: 1,
      day_open: "Пн. Вт. Ср. Чт. Пт.",
      need_orderdata: 1,
      can_cyrillic_orderdata: 0,
      need_birth: 1,
      need_doc: 0,
      need_doc_expire_date: 0,
      need_citizenship: 0,
      need_gender: 0,
      need_middlename: 0,
      lock_order: "1",
      lock_min: "180",
      reserve_min: "0",
      max_seats: "10",
      start_sale_day: "180",
      stop_sale_hours: 0,
      cancel_free_min: "5",
      date_from: "2023-12-14",
      time_from: "06:30:00",
      station_from: "Автостанция \"Киев\", ул. С. Петлюры, 32, (Ж/Д Вокзал)",
      station_from_lat: "50.4427213824899",
      station_from_lon: "30.4932510852814",
      platform_from: null,
      date_to: "2023-12-15",
      time_to: "08:00:00",
      point_to: "Прага",
      station_to: "Автовокзал \"Флоренц\"",
      station_to_lat: "50.0895953782425",
      station_to_lon: "14.440726339817",
      platform_to: null,
      time_in_way: "26:30",
      price_one_way: "90",
      price_one_way_max: "100",
      price_two_way: "180",
      currency: "EUR",
      bonus_eur: "1.35",
      discounts: null,
      free_seats: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
      luggage: "1 шт. до 50 кг - бесплатно. Каждый след. 1 кг - 2 EUR.",
      route_info: "Велосипед (сложенный и упакованный) и детскую коляску (сложена и упакованная) перевозить можно за условия договоренности и свободного места в багажном отделении за дополнительную плату, которую огласит водитель при посадке. Перевозка животных без места – 50% от стоимости билета.",
      cancel_hours_info: [
        {
          hours_after_depar: "10001",
          hours_before_depar: "48",
          cancel_rate: "50",
          money_back: "45"
        },
        {
          hours_after_depar: "48",
          hours_before_depar: "12",
          cancel_rate: "90",
          money_back: "9"
        },
        {
          hours_after_depar: "12",
          hours_before_depar: "0",
          cancel_rate: "100",
          money_back: "0"
        }
      ],
      change_route: [
        {
          date_from: "2023-12-14",
          time_from: "06:30:00",
          date_to: "2023-12-14",
          time_to: "15:25:00",
          point_from: "Киев",
          station_from: "Автостанция \"Киев\", ул. С. Петлюры, 32, (Ж/Д Вокзал)",
          station_from_lat: "50.4427213824899",
          station_from_lon: "30.4932510852814",
          point_to: "Львов",
          station_to: "Автовокзал \"Дворцовый\", пл. Дворцовая, 1",
          station_to_id: "187",
          station_to_lat: "49.8403379438605",
          station_to_lon: "23.9954240620136",
          free_seats: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
          trans: "bus"
        },
        {
          date_from: "2023-12-14",
          time_from: "15:30:00",
          date_to: "2023-12-15",
          time_to: "08:00:00",
          point_from: "Львов",
          station_from: "Автовокзал \"Дворцовый\", пл. Дворцовая, 1",
          station_from_lat: "49.8403379438605",
          station_from_lon: "23.9954240620136",
          point_to: "Прага",
          station_to: "Автовокзал \"Флоренц\"",
          station_to_lat: "50.0895953782425",
          station_to_lon: "14.440726339817",
          free_seats: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
          trans: "bus",
          change_typ: "manual",
          change_stations: 0,
          transfer_time: { d: 0, h: 0, m: 5 }
        }
      ]
    };

    // Convertim la formatul nostru (similar cu funcția de mai sus)
    const routeItem: RouteItem = {
      trans: mockResponse.trans as "bus",
      interval_id: mockResponse.interval_id,
      route_name: mockResponse.route_name,
      has_plan: mockResponse.has_plan,
      carrier: mockResponse.carrier,
      comfort: mockResponse.comfort,
      rating: mockResponse.rating,
      reviews: mockResponse.reviews,
      logo: mockResponse.logo,
      timetable_id: mockResponse.timetable_id,
      request_get_free_seats: mockResponse.request_get_free_seats,
      request_get_discount: mockResponse.request_get_discount,
      request_get_baggage: mockResponse.request_get_baggage,
      day_open: mockResponse.day_open,
      need_orderdata: mockResponse.need_orderdata,
      can_cyrillic_orderdata: mockResponse.can_cyrillic_orderdata,
      need_birth: mockResponse.need_birth,
      need_doc: mockResponse.need_doc,
      need_doc_expire_date: mockResponse.need_doc_expire_date,
      need_citizenship: mockResponse.need_citizenship,
      need_gender: mockResponse.need_gender,
      need_middlename: mockResponse.need_middlename,
      lock_order: mockResponse.lock_order,
      lock_min: mockResponse.lock_min,
      reserve_min: mockResponse.reserve_min,
      max_seats: mockResponse.max_seats,
      start_sale_day: mockResponse.start_sale_day,
      stop_sale_hours: mockResponse.stop_sale_hours,
      cancel_free_min: mockResponse.cancel_free_min,
      date_from: mockResponse.date_from,
      time_from: mockResponse.time_from,
      point_from: mockResponse.point_from,
      station_from: mockResponse.station_from,
      station_from_lat: mockResponse.station_from_lat,
      station_from_lon: mockResponse.station_from_lon,
      platform_from: mockResponse.platform_from,
      date_to: mockResponse.date_to,
      time_to: mockResponse.time_to,
      point_to: mockResponse.point_to,
      station_to: mockResponse.station_to,
      station_to_lat: mockResponse.station_to_lat,
      station_to_lon: mockResponse.station_to_lon,
      platform_to: mockResponse.platform_to,
      time_in_way: mockResponse.time_in_way,
      price_one_way: mockResponse.price_one_way,
      price_one_way_max: mockResponse.price_one_way_max,
      price_two_way: mockResponse.price_two_way,
      currency: mockResponse.currency as any,
      bonus_eur: mockResponse.bonus_eur,
      discounts: mockResponse.discounts,
      free_seats: mockResponse.free_seats,
      luggage: mockResponse.luggage,
      route_info: mockResponse.route_info,
      cancel_hours_info: mockResponse.cancel_hours_info,
      change_route: mockResponse.change_route as ChangeLeg[] | undefined,
    };

    return routeItem;
  } catch (error) {
    console.error('Error loading transfer route from Bussystem API:', error);
    throw new Error('Eroare la încărcarea rutei cu transfer din API-ul Bussystem');
  }
}
