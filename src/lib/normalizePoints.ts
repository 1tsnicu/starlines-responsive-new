// Normalizers for Bussystem get_points API responses
// Converts raw API responses (JSON/XML) to standardized types

import type { 
  PointCity, 
  CountryItem, 
  CountryGroup, 
  PointStation, 
  PointAirport,
  RawPointResponse,
  RawCountryResponse,
  RawCountryGroupResponse,
  LanguageCode
} from '../types/points';

/**
 * Safely convert value to string
 */
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Safely convert value to number
 */
function safeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return !isNaN(num) && isFinite(num) ? num : undefined;
}

/**
 * Get localized name based on language preference
 */
function getLocalizedName(raw: RawPointResponse, lang: LanguageCode = 'en'): string {
  const nameMap = {
    en: raw.point_name || raw.point_latin_name,
    ru: raw.point_ru_name || raw.point_name || raw.point_latin_name,
    ua: raw.point_ua_name || raw.point_name || raw.point_latin_name,
    de: raw.point_de_name || raw.point_name || raw.point_latin_name,
    pl: raw.point_pl_name || raw.point_name || raw.point_latin_name,
    cz: raw.point_cz_name || raw.point_name || raw.point_latin_name,
    ro: raw.point_ro_name || raw.point_name || raw.point_latin_name,
  };
  
  return safeString(nameMap[lang] || raw.point_name || raw.point_latin_name);
}

/**
 * Get localized country name
 */
function getLocalizedCountryName(raw: RawCountryResponse, lang: LanguageCode = 'en'): string {
  const nameMap = {
    en: raw.country_en || raw.country_name,
    ru: raw.country_ru || raw.country_name,
    ua: raw.country_ua || raw.country_name,
    de: raw.country_de || raw.country_name,
    pl: raw.country_pl || raw.country_name,
    cz: raw.country_cz || raw.country_name,
    ro: raw.country_ro || raw.country_name,
  };
  
  return safeString(nameMap[lang] || raw.country_name);
}

/**
 * Normalize single point/city from API response
 */
export function normalizePointCity(raw: RawPointResponse, lang: LanguageCode = 'en'): PointCity {
  const point_id = safeString(raw.point_id || raw.pointId || raw.id);
  const name = getLocalizedName(raw, lang);
  
  // Normalize stations if present
  const stations: PointStation[] = [];
  if (raw.stations && Array.isArray(raw.stations)) {
    for (const station of raw.stations) {
      stations.push({
        station_id: safeString(station.station_id),
        point_id: point_id,
        station_name: safeString(station.station_name),
        station_address: safeString(station.station_address),
        latitude: safeNumber(station.latitude),
        longitude: safeNumber(station.longitude),
      });
    }
  }
  
  // Normalize airports if present
  const airports: PointAirport[] = [];
  if (raw.airports && Array.isArray(raw.airports)) {
    for (const airport of raw.airports) {
      airports.push({
        iata: safeString(airport.iata),
        icao: safeString(airport.icao),
        airport_name: safeString(airport.airport_name),
        latitude: safeNumber(airport.latitude),
        longitude: safeNumber(airport.longitude),
      });
    }
  }
  
  return {
    point_id,
    name,
    name_localized: name,
    latin_name: safeString(raw.point_latin_name),
    country_id: safeString(raw.country_id),
    country_name: safeString(raw.country_name || raw.country),
    country_iso3: safeString(raw.country_kod),
    country_iso2: safeString(raw.country_kod_two),
    latitude: safeNumber(raw.latitude),
    longitude: safeNumber(raw.longitude),
    population: safeNumber(raw.population),
    currency: safeString(raw.currency),
    time_zone: raw.time_zone,
    stations: stations.length > 0 ? stations : undefined,
    airports: airports.length > 0 ? airports : undefined,
  };
}

/**
 * Normalize array of points from API response
 */
export function normalizeCityList(raw: unknown, lang: LanguageCode = 'en'): PointCity[] {
  let items: RawPointResponse[] = [];
  
  // Handle different response formats
  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === 'object' && raw !== null) {
    // Handle XML structure: { root: { item: [...] } }
    const obj = raw as Record<string, unknown>;
    if (obj.root && typeof obj.root === 'object') {
      const root = obj.root as Record<string, unknown>;
      if (Array.isArray(root.item)) {
        items = root.item;
      } else if (root.item) {
        items = [root.item as RawPointResponse];
      }
    } else if (obj.items && Array.isArray(obj.items)) {
      items = obj.items;
    } else if (obj.item && Array.isArray(obj.item)) {
      items = obj.item;
    }
  }
  
  // Normalize and deduplicate by point_id
  const cityMap = new Map<string, PointCity>();
  
  for (const item of items) {
    try {
      const city = normalizePointCity(item, lang);
      if (city.point_id) {
        cityMap.set(city.point_id, city);
      }
    } catch (error) {
      console.warn('Failed to normalize city:', item, error);
    }
  }
  
  return Array.from(cityMap.values());
}

/**
 * Normalize country from API response
 */
export function normalizeCountry(raw: RawCountryResponse, lang: LanguageCode = 'en'): CountryItem {
  return {
    country_id: safeString(raw.country_id),
    name: getLocalizedCountryName(raw, lang),
    iso3: safeString(raw.country_kod),
    iso2: safeString(raw.country_kod_two),
    names: {
      en: safeString(raw.country_en),
      ru: safeString(raw.country_ru),
      ua: safeString(raw.country_ua),
      de: safeString(raw.country_de),
      pl: safeString(raw.country_pl),
      cz: safeString(raw.country_cz),
      ro: safeString(raw.country_ro),
    },
    currency: safeString(raw.currency),
    time_zone: raw.time_zone,
  };
}

/**
 * Normalize array of countries from API response
 */
export function normalizeCountryList(raw: unknown, lang: LanguageCode = 'en'): CountryItem[] {
  let items: RawCountryResponse[] = [];
  
  // Handle different response formats
  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (obj.root && typeof obj.root === 'object') {
      const root = obj.root as Record<string, unknown>;
      if (Array.isArray(root.item)) {
        items = root.item;
      } else if (root.item) {
        items = [root.item as RawCountryResponse];
      }
    } else if (obj.items && Array.isArray(obj.items)) {
      items = obj.items;
    }
  }
  
  return items
    .map(item => {
      try {
        return normalizeCountry(item, lang);
      } catch (error) {
        console.warn('Failed to normalize country:', item, error);
        return null;
      }
    })
    .filter((country): country is CountryItem => country !== null);
}

/**
 * Normalize country groups from API response
 */
export function normalizeCountryGroups(raw: unknown, lang: LanguageCode = 'en'): CountryGroup[] {
  let items: RawCountryGroupResponse[] = [];
  
  // Handle different response formats
  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (obj.root && typeof obj.root === 'object') {
      const root = obj.root as Record<string, unknown>;
      if (Array.isArray(root.item)) {
        items = root.item;
      } else if (root.item) {
        items = [root.item as RawCountryGroupResponse];
      }
    } else if (obj.items && Array.isArray(obj.items)) {
      items = obj.items;
    }
  }
  
  return items
    .map(item => {
      try {
        let points: Array<{ point_id: string; point_name: string; point_name_detail?: string }> = [];
        
        // Handle different points structures
        if (item.points) {
          if (Array.isArray(item.points)) {
            points = item.points.map(p => ({
              point_id: safeString(p.point_id),
              point_name: safeString(p.point_name),
              point_name_detail: safeString(p.point_name_detail),
            }));
          } else if (typeof item.points === 'object' && item.points.item) {
            const pointItems = Array.isArray(item.points.item) ? item.points.item : [item.points.item];
            points = pointItems.map(p => ({
              point_id: safeString(p.point_id),
              point_name: safeString(p.point_name),
              point_name_detail: safeString(p.point_name_detail),
            }));
          }
        }
        
        return {
          country_name: safeString(item.county_name || item.country_name), // Handle API typo
          country_id: safeString(item.country_id),
          currency: safeString(item.currency),
          time_zone: item.time_zone,
          points,
        };
      } catch (error) {
        console.warn('Failed to normalize country group:', item, error);
        return null;
      }
    })
    .filter((group): group is NonNullable<typeof group> => group !== null);
}

/**
 * Normalize cities with stations (group_by_point=1)
 */
export function normalizeCityWithStations(raw: unknown, lang: LanguageCode = 'en'): PointCity[] {
  // For group_by_point, the response structure may vary
  // This handles the case where stations are included in the city data
  const cities = normalizeCityList(raw, lang);
  
  // If cities don't have stations, try to extract from alternative structures
  return cities.map(city => {
    if (!city.stations || city.stations.length === 0) {
      // Try to find stations in raw data
      // This would need to be adjusted based on actual API response structure
    }
    return city;
  });
}

/**
 * Normalize cities with airports (group_by_iata=1)
 */
export function normalizeCityWithAirports(raw: unknown, lang: LanguageCode = 'en'): PointCity[] {
  // For group_by_iata, airports should be included in the city data
  return normalizeCityList(raw, lang);
}

/**
 * Validate and clean point data
 */
export function validatePointCity(city: PointCity): boolean {
  // Basic validation
  if (!city.point_id || !city.name) {
    return false;
  }
  
  // Validate coordinates if present
  if (city.latitude !== undefined && (city.latitude < -90 || city.latitude > 90)) {
    return false;
  }
  
  if (city.longitude !== undefined && (city.longitude < -180 || city.longitude > 180)) {
    return false;
  }
  
  return true;
}

/**
 * Sort cities by name (locale-aware)
 */
export function sortCitiesByName(cities: PointCity[], lang: LanguageCode = 'en'): PointCity[] {
  const locale = {
    en: 'en-US',
    ru: 'ru-RU',
    ua: 'uk-UA',
    de: 'de-DE',
    pl: 'pl-PL',
    cz: 'cs-CZ',
    ro: 'ro-RO',
  }[lang] || 'en-US';
  
  return [...cities].sort((a, b) => 
    a.name.localeCompare(b.name, locale, { numeric: true, caseFirst: 'lower' })
  );
}

/**
 * Group cities by country
 */
export function groupCitiesByCountry(cities: PointCity[]): Record<string, PointCity[]> {
  const groups: Record<string, PointCity[]> = {};
  
  for (const city of cities) {
    const countryKey = city.country_name || city.country_id || 'Unknown';
    if (!groups[countryKey]) {
      groups[countryKey] = [];
    }
    groups[countryKey].push(city);
  }
  
  // Sort cities within each country
  for (const countryKey in groups) {
    groups[countryKey] = sortCitiesByName(groups[countryKey]);
  }
  
  return groups;
}
