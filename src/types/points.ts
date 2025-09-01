// Types for Bussystem get_points API
// Handles cities, stations, airports, countries with full normalization

export interface PointCity {
  point_id: string;           // "3"
  name: string;               // "Praha" - display name in current language
  name_localized?: string;    // Localized name (point_ru_name, point_ua_name, etc.)
  latin_name?: string;        // "Praha" - Latin transliteration
  country_id?: string;        // "1"
  country_name?: string;      // "Czechia"
  country_iso3?: string;      // "CZE"
  country_iso2?: string;      // "CZ"
  latitude?: number;          // 50.08909
  longitude?: number;         // 14.44057
  population?: number;
  currency?: string;          // "CZK"
  time_zone?: string | number;// "1" or 1
  // When requesting group_by_point / group_by_iata:
  stations?: PointStation[];
  airports?: PointAirport[];
}

export interface PointStation {
  station_id?: string;
  point_id?: string;          // Parent city ID
  station_name: string;       // "Автовокзал «Флоренц»"
  station_address?: string;
  latitude?: number;
  longitude?: number;
}

export interface PointAirport {
  iata?: string;              // "PRG"
  icao?: string;              // "LKPR"
  airport_name: string;       // "Václav Havel Airport Prague"
  latitude?: number;
  longitude?: number;
}

export interface CountryItem {
  country_id: string;         // "1"
  name: string;               // "Czech" - display name in current language
  iso3?: string;              // "CZE"
  iso2?: string;              // "CZ"
  names?: Record<string, string>; // { en: "Czech", ru: "Чехия", ua: "Чехія", etc. }
  currency?: string;          // "CZK"
  time_zone?: string | number;
}

export interface CountryGroup {
  country_name: string;       // "Ukraine"
  country_id?: string;        // "2"
  currency?: string;          // "UAH"
  time_zone?: string | number;
  points: Array<{
    point_id: string;
    point_name: string;
    point_name_detail?: string;
  }>;
}

// Request parameters
export interface PointsRequestBase extends Record<string, unknown> {
  lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";
  login?: string;             // Will be set by API client
  password?: string;          // Will be set by API client
  json?: 1;                   // Force JSON response
}

export interface AutocompleteRequest extends PointsRequestBase {
  autocomplete: string;       // Search term (min 2-3 characters)
  trans?: "all" | "bus" | "train" | "air" | "travel" | "hotel";
  all?: 0 | 1;               // 0 = popular only, 1 = all points
}

export interface CountryPointsRequest extends PointsRequestBase {
  country_id: string;         // Filter by country
  trans?: "all" | "bus" | "train" | "air" | "travel" | "hotel";
}

export interface ConnectionPointsRequest extends PointsRequestBase {
  point_id_from?: string;     // Cities accessible from this point
  point_id_to?: string;       // Cities that can reach this point
  trans?: "all" | "bus" | "train" | "air" | "travel" | "hotel";
}

export interface BoundingBoxRequest extends PointsRequestBase {
  boundLatSW: number;         // Southwest latitude
  boundLonSW: number;         // Southwest longitude
  boundLatNE: number;         // Northeast latitude
  boundLonNE: number;         // Northeast longitude
  boundLotNE?: number;        // Typo workaround - same as boundLonNE
  trans?: "all" | "bus" | "train" | "air" | "travel" | "hotel";
}

export interface GroupedPointsRequest extends PointsRequestBase {
  viev?: "group_country" | "get_country";  // Response format
  trans?: "all" | "bus" | "train" | "air" | "travel" | "hotel";
  group_by_point?: 0 | 1;     // Include stations for bus/train
  group_by_iata?: 0 | 1;      // Include airports for air
}

// Raw API response types (before normalization)
export interface RawPointResponse {
  point_id?: string | number;
  pointId?: string | number;
  id?: string | number;
  point_name?: string;
  point_latin_name?: string;
  point_ru_name?: string;
  point_ua_name?: string;
  point_de_name?: string;
  point_pl_name?: string;
  point_cz_name?: string;
  point_ro_name?: string;
  country_id?: string | number;
  country_name?: string;
  country?: string;
  country_kod?: string;       // ISO3
  country_kod_two?: string;   // ISO2
  latitude?: string | number;
  longitude?: string | number;
  population?: string | number;
  currency?: string;
  time_zone?: string | number;
  // Stations (when group_by_point=1)
  stations?: Array<{
    station_id?: string;
    station_name?: string;
    station_address?: string;
    latitude?: string | number;
    longitude?: string | number;
  }>;
  // Airports (when group_by_iata=1)
  airports?: Array<{
    iata?: string;
    icao?: string;
    airport_name?: string;
    latitude?: string | number;
    longitude?: string | number;
  }>;
}

export interface RawCountryResponse {
  country_id?: string | number;
  country_name?: string;
  country_en?: string;
  country_ru?: string;
  country_ua?: string;
  country_de?: string;
  country_pl?: string;
  country_cz?: string;
  country_ro?: string;
  country_kod?: string;       // ISO3
  country_kod_two?: string;   // ISO2
  currency?: string;
  time_zone?: string | number;
}

export interface RawCountryGroupResponse {
  county_name?: string;       // Note: typo in API response
  country_name?: string;
  country_id?: string | number;
  currency?: string;
  time_zone?: string | number;
  points?: {
    item?: Array<{
      point_id: string | number;
      point_name: string;
      point_name_detail?: string;
    }>;
  } | Array<{
    point_id: string | number;
    point_name: string;
    point_name_detail?: string;
  }>;
}

// Utility types
export type TransportType = "all" | "bus" | "train" | "air" | "travel" | "hotel";
export type LanguageCode = "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";

// Search and filtering types
export interface PointSearchOptions {
  query?: string;
  transport?: TransportType;
  language?: LanguageCode;
  country?: string;
  includeStations?: boolean;
  includeAirports?: boolean;
  limit?: number;
}

export interface PointsCache {
  [key: string]: {
    data: PointCity[] | CountryItem[] | CountryGroup[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  };
}

// Error types
export interface PointsApiError {
  error: string;
  code?: string;
  message?: string;
}

// Success response wrapper
export interface PointsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: PointsApiError;
  cached?: boolean;
  timestamp?: number;
}
