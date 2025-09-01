/**
 * GET BAGGAGE NORMALIZER
 * 
 * Normalizare răspunsuri XML/JSON în modele TypeScript structurate
 * Gestionează arrays vs objects și conversii string→number pentru bagaje
 */

import type {
  RawGetBaggageResponse,
  BaggageItem,
  BaggageGroup,
  RawBaggageItem,
  BaggageQuickStats
} from '@/types/getBaggage';

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

function safeCurrency(value: unknown): number {
  const num = safeNumber(value);
  return Math.round(num * 100) / 100; // Round to 2 decimal places
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
// Baggage Item Normalization
// ===============================

function normalizeBaggageItem(raw: RawBaggageItem): BaggageItem {
  const price = safeCurrency(raw.price);
  const isIncluded = price === 0;
  
  return {
    // Identification
    baggage_id: safeString(raw.baggage_id),
    baggage_type_id: raw.baggage_type_id ? safeString(raw.baggage_type_id) : undefined,
    baggage_type: raw.baggage_type ? safeString(raw.baggage_type) : undefined,
    baggage_title: raw.baggage_title ? safeString(raw.baggage_title) : undefined,
    
    // Physical specifications
    length: raw.length ? safeNumber(raw.length) : undefined,
    width: raw.width ? safeNumber(raw.width) : undefined,
    height: raw.height ? safeNumber(raw.height) : undefined,
    kg: raw.kg ? safeNumber(raw.kg) : undefined,
    
    // Quantity limits
    max_in_bus: raw.max_in_bus ? safeNumber(raw.max_in_bus) : undefined,
    max_per_person: raw.max_per_person ? safeNumber(raw.max_per_person) : undefined,
    
    // Type and category
    typ: raw.typ ? safeString(raw.typ) : undefined,
    category: categorizeBaggage(raw),
    
    // Pricing
    price,
    currency: raw.currency ? safeString(raw.currency) : undefined,
    
    // Additional info
    description: raw.description ? safeString(raw.description) : undefined,
    icon: raw.icon ? safeString(raw.icon) : undefined,
    is_included: isIncluded
  };
}

function categorizeBaggage(raw: RawBaggageItem): "carry_on" | "checked" | "special" | "oversized" {
  const title = safeString(raw.baggage_title).toLowerCase();
  const type = safeString(raw.baggage_type).toLowerCase();
  
  // Carry-on indicators
  if (title.includes('cabină') || title.includes('carry') || title.includes('hand')) {
    return 'carry_on';
  }
  
  // Special items
  if (title.includes('ski') || title.includes('bicicletă') || title.includes('instrument') || 
      title.includes('surfboard') || title.includes('special')) {
    return 'special';
  }
  
  // Oversized based on dimensions
  const length = safeNumber(raw.length);
  const width = safeNumber(raw.width);
  const height = safeNumber(raw.height);
  
  if (length > 100 || width > 80 || height > 80) {
    return 'oversized';
  }
  
  // Default to checked baggage
  return 'checked';
}

// ===============================
// Baggage Grouping
// ===============================

function groupBaggageItems(items: BaggageItem[]): BaggageGroup[] {
  const groups = new Map<string, BaggageItem[]>();
  
  // Group by category
  items.forEach(item => {
    const category = item.category || 'checked';
    const groupKey = `${category}_${item.is_included ? 'free' : 'paid'}`;
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });
  
  // Convert to BaggageGroup objects
  const result: BaggageGroup[] = [];
  
  groups.forEach((groupItems, groupKey) => {
    const [category, priceType] = groupKey.split('_');
    const isFree = priceType === 'free';
    
    const group: BaggageGroup = {
      group_id: groupKey,
      group_name: generateGroupName(category as "carry_on" | "checked" | "special" | "oversized", isFree),
      group_type: isFree ? 'free' : 'paid',
      items: groupItems.sort((a, b) => a.price - b.price), // Sort by price within group
      total_included: isFree ? groupItems.length : 0
    };
    
    result.push(group);
  });
  
  // Sort groups: free first, then by category
  return result.sort((a, b) => {
    if (a.group_type !== b.group_type) {
      return a.group_type === 'free' ? -1 : 1;
    }
    return a.group_name.localeCompare(b.group_name);
  });
}

function generateGroupName(category: string, isFree: boolean): string {
  const categoryNames: Record<string, string> = {
    'carry_on': 'Bagaj de cabină',
    'checked': 'Bagaj de cală',
    'special': 'Obiecte speciale',
    'oversized': 'Bagaj supradimensionat'
  };
  
  const baseName = categoryNames[category] || 'Bagaj';
  return isFree ? `${baseName} (Inclus)` : `${baseName} (Cu plată)`;
}

// ===============================
// Statistics Generation
// ===============================

function generateBaggageStats(items: BaggageItem[]): BaggageQuickStats {
  const freeItems = items.filter(item => item.is_included);
  const paidItems = items.filter(item => !item.is_included);
  
  const prices = paidItems.map(item => item.price).filter(price => price > 0);
  const weights = items.map(item => item.kg).filter(kg => kg && kg > 0);
  
  // Find most popular type
  const typeCount = new Map<string, number>();
  items.forEach(item => {
    const type = item.baggage_type || 'unknown';
    typeCount.set(type, (typeCount.get(type) || 0) + 1);
  });
  
  const mostPopularType = Array.from(typeCount.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  
  return {
    total_free_items: freeItems.length,
    total_paid_items: paidItems.length,
    price_range: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      currency: items.find(item => item.currency)?.currency || 'EUR'
    },
    most_popular_type: mostPopularType,
    weight_limits: {
      min: weights.length > 0 ? Math.min(...weights) : 0,
      max: weights.length > 0 ? Math.max(...weights) : 0
    }
  };
}

// ===============================
// Main Normalization Function
// ===============================

/**
 * Normalize raw get_baggage response to structured TypeScript models
 * 
 * @param rawResponse - Raw API response (JSON or parsed XML)
 * @returns Object with normalized baggage items, groups, and stats
 */
export function normalizeGetBaggageResponse(rawResponse: RawGetBaggageResponse): {
  baggage_items: BaggageItem[];
  baggage_groups: BaggageGroup[];
  stats: BaggageQuickStats;
  has_free_baggage: boolean;
  has_paid_baggage: boolean;
} {
  // Handle API errors
  if (rawResponse.result === 0 && rawResponse.error) {
    throw new Error(`API Error: ${rawResponse.error}`);
  }
  
  // Extract baggage items from response
  let rawItems: RawBaggageItem[] = [];
  
  // Try multiple possible locations for baggage data
  if (rawResponse.item) {
    if (Array.isArray(rawResponse.item)) {
      rawItems = rawResponse.item;
    } else {
      rawItems = [rawResponse.item];
    }
  } else if (rawResponse.baggage) {
    rawItems = normalizeItemArray(rawResponse.baggage);
  }
  
  // Normalize each item
  const baggageItems = rawItems
    .map(normalizeBaggageItem)
    .filter(item => item.baggage_id) // Remove items without valid ID
    .sort((a, b) => {
      // Sort: free first, then by price
      if (a.is_included !== b.is_included) {
        return a.is_included ? -1 : 1;
      }
      return a.price - b.price;
    });
  
  // Group items by category and type
  const baggageGroups = groupBaggageItems(baggageItems);
  
  // Generate statistics
  const stats = generateBaggageStats(baggageItems);
  
  // Determine availability
  const hasFree = baggageItems.some(item => item.is_included);
  const hasPaid = baggageItems.some(item => !item.is_included);
  
  return {
    baggage_items: baggageItems,
    baggage_groups: baggageGroups,
    stats,
    has_free_baggage: hasFree,
    has_paid_baggage: hasPaid
  };
}

/**
 * Validate that normalized baggage data has minimum required information
 */
export function validateNormalizedBaggage(items: BaggageItem[]): boolean {
  if (items.length === 0) {
    return true; // Empty is valid (no baggage available)
  }
  
  return items.every(item => {
    return !!(
      item.baggage_id &&
      typeof item.price === 'number' &&
      item.price >= 0
    );
  });
}

/**
 * Generate display information for a baggage item
 */
export function generateBaggageDisplayInfo(item: BaggageItem): {
  title: string;
  dimensions: string;
  weight: string;
  price_display: string;
  restrictions: string;
  availability: string;
  category_icon: string;
} {
  const title = item.baggage_title || `Bagaj ${item.baggage_id}`;
  
  // Dimensions
  let dimensions = '';
  if (item.length && item.width && item.height) {
    dimensions = `${item.length}×${item.width}×${item.height} cm`;
  } else if (item.length || item.width || item.height) {
    dimensions = [item.length, item.width, item.height]
      .filter(Boolean)
      .join('×') + ' cm';
  }
  
  // Weight
  const weight = item.kg ? `${item.kg} kg` : '';
  
  // Price display
  const priceDisplay = item.is_included 
    ? 'Gratuit' 
    : `${item.price.toFixed(2)} ${item.currency || 'EUR'}`;
  
  // Restrictions
  const restrictions = [
    item.max_per_person ? `max ${item.max_per_person} per persoană` : '',
    item.max_in_bus ? `max ${item.max_in_bus} per autobuz` : ''
  ].filter(Boolean).join(', ');
  
  // Availability (placeholder - would need real-time data)
  const availability = item.max_in_bus ? `${item.max_in_bus} disponibile` : '';
  
  // Category icon
  const categoryIcons: Record<string, string> = {
    'carry_on': '🎒',
    'checked': '🧳', 
    'special': '🎿',
    'oversized': '📦'
  };
  const categoryIcon = categoryIcons[item.category || 'checked'] || '🧳';
  
  return {
    title,
    dimensions,
    weight,
    price_display: priceDisplay,
    restrictions,
    availability,
    category_icon: categoryIcon
  };
}

/**
 * Filter baggage items by various criteria
 */
export function filterBaggageItems(
  items: BaggageItem[],
  filters: {
    category?: string;
    price_range?: { min: number; max: number };
    max_weight?: number;
    only_included?: boolean;
    only_paid?: boolean;
  }
): BaggageItem[] {
  return items.filter(item => {
    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    
    // Price range filter
    if (filters.price_range) {
      if (item.price < filters.price_range.min || item.price > filters.price_range.max) {
        return false;
      }
    }
    
    // Weight filter
    if (filters.max_weight && item.kg && item.kg > filters.max_weight) {
      return false;
    }
    
    // Inclusion filters
    if (filters.only_included && !item.is_included) {
      return false;
    }
    
    if (filters.only_paid && item.is_included) {
      return false;
    }
    
    return true;
  });
}
