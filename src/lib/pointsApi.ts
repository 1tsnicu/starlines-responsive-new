// Bussystem get_points API client with caching and comprehensive functionality
// Handles all point/city/country operations with proper error handling

import { apiPost, createCacheKey, logApiRequest } from './http';
import { 
  normalizeCityList, 
  normalizeCountryList, 
  normalizeCountryGroups,
  normalizeCityWithStations,
  normalizeCityWithAirports,
  validatePointCity,
  sortCitiesByName,
  groupCitiesByCountry
} from './normalizePoints';

import type {
  PointCity,
  CountryItem,
  CountryGroup,
  LanguageCode,
  TransportType,
  PointsApiResponse,
  AutocompleteRequest,
  CountryPointsRequest,
  ConnectionPointsRequest,
  BoundingBoxRequest,
  GroupedPointsRequest
} from '../types/points';

const POINTS_ENDPOINT = '/curl/get_points.php';

// Cache configuration
const CACHE_CONFIG = {
  autocomplete: 5 * 60 * 1000, // 5 minutes
  countries: 30 * 60 * 1000,   // 30 minutes
  cities: 15 * 60 * 1000,      // 15 minutes
  connections: 10 * 60 * 1000, // 10 minutes
  stations: 20 * 60 * 1000,    // 20 minutes
};

class PointsCache {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const cache = new PointsCache();

// Clear expired cache entries every 5 minutes
setInterval(() => cache.clearExpired(), 5 * 60 * 1000);

/**
 * Base Points API Client
 */
export class PointsAPI {
  private defaultLang: LanguageCode = 'en';

  constructor(defaultLang: LanguageCode = 'en') {
    this.defaultLang = defaultLang;
  }

  /**
   * Set default language
   */
  setDefaultLanguage(lang: LanguageCode): void {
    this.defaultLang = lang;
  }

  /**
   * Autocomplete search for cities/points
   */
  async autocomplete(
    query: string, 
    options: {
      transport?: TransportType;
      lang?: LanguageCode;
      includeAll?: boolean;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      transport = 'all',
      lang = this.defaultLang,
      includeAll = true,
      useCache = true
    } = options;

    // Validate input
    if (!query || query.length < 2) {
      return {
        success: false,
        error: { error: 'Query must be at least 2 characters', code: 'INVALID_QUERY' }
      };
    }

    // Check cache
    const cacheKey = createCacheKey('autocomplete', { query, transport, lang, includeAll });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: AutocompleteRequest = {
        autocomplete: query,
        trans: transport,
        all: includeAll ? 1 : 0,
        lang,
      };

      logApiRequest(POINTS_ENDPOINT, request);
      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      
      const cities = normalizeCityList(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      // Cache result
      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.autocomplete);
      }

      logApiRequest(POINTS_ENDPOINT, request, { count: sortedCities.length });

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      logApiRequest(POINTS_ENDPOINT, { autocomplete: query }, undefined, error as Error);
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Autocomplete request failed',
          code: 'AUTOCOMPLETE_ERROR'
        }
      };
    }
  }

  /**
   * Get cities by country
   */
  async getCitiesByCountry(
    countryId: string,
    options: {
      transport?: TransportType;
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      transport = 'all',
      lang = this.defaultLang,
      useCache = true
    } = options;

    if (!countryId) {
      return {
        success: false,
        error: { error: 'Country ID is required', code: 'INVALID_COUNTRY_ID' }
      };
    }

    const cacheKey = createCacheKey('country-cities', { countryId, transport, lang });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: CountryPointsRequest = {
        country_id: countryId,
        trans: transport,
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const cities = normalizeCityList(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.cities);
      }

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get cities by country',
          code: 'COUNTRY_CITIES_ERROR'
        }
      };
    }
  }

  /**
   * Get cities accessible from a point
   */
  async getCitiesFrom(
    pointId: string,
    options: {
      transport?: TransportType;
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      transport = 'all',
      lang = this.defaultLang,
      useCache = true
    } = options;

    if (!pointId) {
      return {
        success: false,
        error: { error: 'Point ID is required', code: 'INVALID_POINT_ID' }
      };
    }

    const cacheKey = createCacheKey('cities-from', { pointId, transport, lang });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: ConnectionPointsRequest = {
        point_id_from: pointId,
        trans: transport,
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const cities = normalizeCityList(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.connections);
      }

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get cities from point',
          code: 'CITIES_FROM_ERROR'
        }
      };
    }
  }

  /**
   * Get cities that can reach a point
   */
  async getCitiesTo(
    pointId: string,
    options: {
      transport?: TransportType;
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      transport = 'all',
      lang = this.defaultLang,
      useCache = true
    } = options;

    if (!pointId) {
      return {
        success: false,
        error: { error: 'Point ID is required', code: 'INVALID_POINT_ID' }
      };
    }

    const cacheKey = createCacheKey('cities-to', { pointId, transport, lang });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: ConnectionPointsRequest = {
        point_id_to: pointId,
        trans: transport,
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const cities = normalizeCityList(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.connections);
      }

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get cities to point',
          code: 'CITIES_TO_ERROR'
        }
      };
    }
  }

  /**
   * Get cities within bounding box (for map view)
   */
  async getCitiesInBounds(
    bounds: {
      swLat: number;
      swLon: number;
      neLat: number;
      neLon: number;
    },
    options: {
      transport?: TransportType;
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      transport = 'all',
      lang = this.defaultLang,
      useCache = true
    } = options;

    // Validate bounds
    if (bounds.swLat >= bounds.neLat || bounds.swLon >= bounds.neLon) {
      return {
        success: false,
        error: { error: 'Invalid bounding box coordinates', code: 'INVALID_BOUNDS' }
      };
    }

    const cacheKey = createCacheKey('cities-bounds', { ...bounds, transport, lang });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: BoundingBoxRequest = {
        boundLatSW: bounds.swLat,
        boundLonSW: bounds.swLon,
        boundLatNE: bounds.neLat,
        boundLonNE: bounds.neLon,
        boundLotNE: bounds.neLon, // API typo workaround
        trans: transport,
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const cities = normalizeCityList(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.cities);
      }

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get cities in bounds',
          code: 'CITIES_BOUNDS_ERROR'
        }
      };
    }
  }

  /**
   * Get list of countries
   */
  async getCountries(
    options: {
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<CountryItem[]>> {
    const {
      lang = this.defaultLang,
      useCache = true
    } = options;

    const cacheKey = createCacheKey('countries', { lang });
    if (useCache) {
      const cached = cache.get<CountryItem[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: GroupedPointsRequest = {
        viev: 'get_country',
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const countries = normalizeCountryList(response, lang);

      if (useCache) {
        cache.set(cacheKey, countries, CACHE_CONFIG.countries);
      }

      return {
        success: true,
        data: countries,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get countries',
          code: 'COUNTRIES_ERROR'
        }
      };
    }
  }

  /**
   * Get countries grouped with their cities
   */
  async getCountryGroups(
    options: {
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<CountryGroup[]>> {
    const {
      lang = this.defaultLang,
      useCache = true
    } = options;

    const cacheKey = createCacheKey('country-groups', { lang });
    if (useCache) {
      const cached = cache.get<CountryGroup[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: GroupedPointsRequest = {
        viev: 'group_country',
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const groups = normalizeCountryGroups(response, lang);

      if (useCache) {
        cache.set(cacheKey, groups, CACHE_CONFIG.countries);
      }

      return {
        success: true,
        data: groups,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get country groups',
          code: 'COUNTRY_GROUPS_ERROR'
        }
      };
    }
  }

  /**
   * Get cities with their stations (for bus/train)
   */
  async getCitiesWithStations(
    options: {
      transport?: 'bus' | 'train' | 'all';
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      transport = 'all',
      lang = this.defaultLang,
      useCache = true
    } = options;

    const cacheKey = createCacheKey('cities-stations', { transport, lang });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: GroupedPointsRequest = {
        group_by_point: 1,
        trans: transport,
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const cities = normalizeCityWithStations(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.stations);
      }

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get cities with stations',
          code: 'CITIES_STATIONS_ERROR'
        }
      };
    }
  }

  /**
   * Get cities with their airports (for air transport)
   */
  async getCitiesWithAirports(
    options: {
      lang?: LanguageCode;
      useCache?: boolean;
    } = {}
  ): Promise<PointsApiResponse<PointCity[]>> {
    const {
      lang = this.defaultLang,
      useCache = true
    } = options;

    const cacheKey = createCacheKey('cities-airports', { lang });
    if (useCache) {
      const cached = cache.get<PointCity[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }

    try {
      const request: GroupedPointsRequest = {
        trans: 'air',
        group_by_iata: 1,
        lang,
      };

      const response = await apiPost<unknown>(POINTS_ENDPOINT, request);
      const cities = normalizeCityWithAirports(response, lang);
      const validCities = cities.filter(validatePointCity);
      const sortedCities = sortCitiesByName(validCities, lang);

      if (useCache) {
        cache.set(cacheKey, sortedCities, CACHE_CONFIG.stations);
      }

      return {
        success: true,
        data: sortedCities,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Failed to get cities with airports',
          code: 'CITIES_AIRPORTS_ERROR'
        }
      };
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    cache.clear();
  }

  /**
   * Group cities by country for display
   */
  groupCitiesByCountry(cities: PointCity[]): Record<string, PointCity[]> {
    return groupCitiesByCountry(cities);
  }
}

// Export singleton instance
export const pointsAPI = new PointsAPI();

// Export convenience functions
export const {
  autocomplete: pointsAutocomplete,
  getCitiesByCountry: pointsByCountry,
  getCitiesFrom: pointsFrom,
  getCitiesTo: pointsTo,
  getCitiesInBounds: pointsInBounds,
  getCountries: listCountries,
  getCountryGroups: groupByCountry,
  getCitiesWithStations: citiesWithStations,
  getCitiesWithAirports: citiesWithAirports,
  clearCache: clearPointsCache
} = pointsAPI;
