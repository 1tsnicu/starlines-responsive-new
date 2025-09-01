/**
 * GET DISCOUNT NORMALIZATION
 * 
 * Normalizează răspunsurile XML/JSON de la get_discount într-un format consistent
 * Gestionează categorii, validări și business rules
 */

import type {
  RawGetDiscountResponse,
  RawDiscountItem,
  DiscountItem,
  NormalizedDiscountResponse,
  DiscountQuickStats,
  DiscountBusinessRules,
  DiscountValidationRules
} from '@/types/getDiscount';

// ===============================
// Core Normalization Functions
// ===============================

export function normalizeGetDiscountResponse(
  rawResponse: RawGetDiscountResponse,
  cacheKey: string = ''
): NormalizedDiscountResponse {
  try {
    // Extract discounts from various possible structures
    const rawDiscounts = extractDiscountsFromResponse(rawResponse);
    
    // Normalize individual discount items
    const discounts = rawDiscounts
      .map(raw => normalizeDiscountItem(raw))
      .filter(discount => discount.discount_id && discount.name);
    
    // Categorize discounts
    const categorized = categorizeDiscounts(discounts);
    
    // Generate statistics
    const stats = generateDiscountStats(discounts);
    
    // Generate business rules
    const businessRules = generateBusinessRules(discounts);
    
    return {
      route_id: rawResponse.route_id || undefined,
      discounts,
      by_category: categorized.by_category,
      by_type: categorized.by_type,
      age_based_discounts: categorized.age_based,
      group_discounts: categorized.group,
      general_discounts: categorized.general,
      stats,
      business_rules: businessRules,
      cached_at: Date.now(),
      cache_key: cacheKey
    };
  } catch (error) {
    console.error('Error normalizing discount response:', error);
    
    // Return empty response on error
    return createEmptyDiscountResponse(cacheKey);
  }
}

function extractDiscountsFromResponse(response: RawGetDiscountResponse): RawDiscountItem[] {
  // Helper function to safely access nested properties
  const safeGet = (obj: unknown, ...keys: string[]): unknown => {
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return current;
  };

  // Try multiple possible structures
  const possiblePaths = [
    safeGet(response, 'discounts', 'item'),
    safeGet(response, 'item', 'discounts', 'item'),
    safeGet(response, 'root', 'item', 'discounts', 'item'),
    safeGet(response, 'data', 'discounts', 'item'),
    safeGet(response, 'discounts'),
    safeGet(response, 'items')
  ];
  
  for (const path of possiblePaths) {
    if (path) {
      // Normalize to array
      const items = Array.isArray(path) ? path : [path];
      return items.filter(Boolean);
    }
  }
  
  return [];
}

function normalizeDiscountItem(raw: RawDiscountItem): DiscountItem {
  // Extract and normalize basic fields
  const discount_id = String(raw.discount_id || raw.id || '').trim();
  const name = String(raw.discount_name || raw.name || '').trim();
  const price = parseFloat(String(raw.discount_price || raw.price || '0'));
  
  // Extract optional fields
  const currency = raw.currency ? String(raw.currency).trim() : undefined;
  const price_max = raw.price_max ? parseFloat(String(raw.price_max)) : undefined;
  
  // Parse age constraints
  const age_min = raw.age_min ? parseInt(String(raw.age_min)) : undefined;
  const age_max = raw.age_max ? parseInt(String(raw.age_max)) : undefined;
  
  // Parse group constraints
  const min_passengers = raw.min_passengers ? parseInt(String(raw.min_passengers)) : undefined;
  
  // Determine type and category
  const type = determineDiscountType(raw, name);
  const category = determineDiscountCategory(raw, name, age_min, age_max);
  
  // Determine requirements
  const requires_birth_date = needsBirthDate(type, age_min, age_max);
  const requires_document = needsDocument(type, raw);
  
  // Extract description and rules
  const description = raw.description ? String(raw.description).trim() : undefined;
  const rules = raw.rules ? String(raw.rules).trim() : generateRules(type, age_min, age_max, min_passengers);
  
  return {
    discount_id,
    name,
    price,
    currency,
    price_max,
    age_min,
    age_max,
    min_passengers,
    requires_birth_date,
    requires_document,
    type,
    category,
    description,
    rules,
    raw
  };
}

// ===============================
// Classification Functions
// ===============================

function determineDiscountType(raw: RawDiscountItem, name: string): DiscountItem['type'] {
  // Check explicit type field
  if (raw.type) {
    const type = String(raw.type).toLowerCase();
    if (['age_based', 'group', 'student', 'senior', 'general'].includes(type)) {
      return type as DiscountItem['type'];
    }
  }
  
  // Infer from name patterns
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('child') || lowerName.includes('copil') || lowerName.includes('kid')) {
    return 'age_based';
  }
  
  if (lowerName.includes('senior') || lowerName.includes('pension') || lowerName.includes('elderly')) {
    return 'age_based';
  }
  
  if (lowerName.includes('student') || lowerName.includes('school') || lowerName.includes('university')) {
    return 'student';
  }
  
  if (lowerName.includes('group') || lowerName.includes('grup') || lowerName.includes('family')) {
    return 'group';
  }
  
  // Check if has age constraints
  if (raw.age_min !== undefined || raw.age_max !== undefined) {
    return 'age_based';
  }
  
  // Check if has group constraints
  if (raw.min_passengers !== undefined) {
    return 'group';
  }
  
  return 'general';
}

function determineDiscountCategory(
  raw: RawDiscountItem, 
  name: string, 
  age_min?: number, 
  age_max?: number
): DiscountItem['category'] {
  // Check explicit category field
  if (raw.category) {
    const category = String(raw.category).toLowerCase();
    if (['child', 'adult', 'senior', 'student', 'group', 'special'].includes(category)) {
      return category as DiscountItem['category'];
    }
  }
  
  // Infer from age constraints
  if (age_max !== undefined && age_max <= 18) {
    return 'child';
  }
  
  if (age_min !== undefined && age_min >= 65) {
    return 'senior';
  }
  
  // Infer from name patterns
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('child') || lowerName.includes('copil')) {
    return 'child';
  }
  
  if (lowerName.includes('student') || lowerName.includes('school')) {
    return 'student';
  }
  
  if (lowerName.includes('senior') || lowerName.includes('pension')) {
    return 'senior';
  }
  
  if (lowerName.includes('group') || lowerName.includes('family')) {
    return 'group';
  }
  
  if (lowerName.includes('special') || lowerName.includes('disabled')) {
    return 'special';
  }
  
  return 'adult';
}

function needsBirthDate(type?: string, age_min?: number, age_max?: number): boolean {
  return type === 'age_based' || age_min !== undefined || age_max !== undefined;
}

function needsDocument(type?: string, raw?: RawDiscountItem): boolean {
  return type === 'student' || 
         Boolean(raw?.requires_document) || 
         Boolean(raw?.need_doc);
}

function generateRules(
  type?: string, 
  age_min?: number, 
  age_max?: number, 
  min_passengers?: number
): string {
  const rules: string[] = [];
  
  if (age_min !== undefined && age_max !== undefined) {
    rules.push(`Vârsta: ${age_min}-${age_max} ani`);
  } else if (age_min !== undefined) {
    rules.push(`Vârsta: minim ${age_min} ani`);
  } else if (age_max !== undefined) {
    rules.push(`Vârsta: maxim ${age_max} ani`);
  }
  
  if (min_passengers !== undefined) {
    rules.push(`Grup minim: ${min_passengers} persoane`);
  }
  
  if (type === 'student') {
    rules.push('Necesită legitimație de student');
  }
  
  return rules.join('; ');
}

// ===============================
// Categorization Functions
// ===============================

interface CategorizedDiscounts {
  by_category: Record<string, DiscountItem[]>;
  by_type: Record<string, DiscountItem[]>;
  age_based: DiscountItem[];
  group: DiscountItem[];
  general: DiscountItem[];
}

function categorizeDiscounts(discounts: DiscountItem[]): CategorizedDiscounts {
  const by_category: Record<string, DiscountItem[]> = {};
  const by_type: Record<string, DiscountItem[]> = {};
  const age_based: DiscountItem[] = [];
  const group: DiscountItem[] = [];
  const general: DiscountItem[] = [];
  
  discounts.forEach(discount => {
    // Group by category
    const category = discount.category || 'other';
    if (!by_category[category]) {
      by_category[category] = [];
    }
    by_category[category].push(discount);
    
    // Group by type
    const type = discount.type || 'other';
    if (!by_type[type]) {
      by_type[type] = [];
    }
    by_type[type].push(discount);
    
    // Special groupings
    if (discount.type === 'age_based' || discount.age_min !== undefined || discount.age_max !== undefined) {
      age_based.push(discount);
    } else if (discount.type === 'group' || discount.min_passengers !== undefined) {
      group.push(discount);
    } else {
      general.push(discount);
    }
  });
  
  return {
    by_category,
    by_type,
    age_based,
    group,
    general
  };
}

// ===============================
// Statistics Functions
// ===============================

function generateDiscountStats(discounts: DiscountItem[]): DiscountQuickStats {
  const total_available = discounts.length;
  const total_selected = 0; // Will be updated by selection component
  
  // Calculate potential savings (sum of all discount prices)
  const total_savings = discounts.reduce((sum, discount) => sum + discount.price, 0);
  const currency = discounts.length > 0 ? (discounts[0].currency || 'EUR') : 'EUR';
  
  // Breakdown by category
  const by_category: Record<string, { count: number; savings: number }> = {};
  
  discounts.forEach(discount => {
    const category = discount.category || 'other';
    if (!by_category[category]) {
      by_category[category] = { count: 0, savings: 0 };
    }
    by_category[category].count++;
    by_category[category].savings += discount.price;
  });
  
  return {
    total_available,
    total_selected,
    total_savings,
    currency,
    by_category
  };
}

// ===============================
// Business Rules Functions
// ===============================

function generateBusinessRules(discounts: DiscountItem[]): DiscountBusinessRules {
  const hasAgeBasedDiscounts = discounts.some(d => d.type === 'age_based' || d.age_min !== undefined || d.age_max !== undefined);
  const hasGroupDiscounts = discounts.some(d => d.type === 'group' || d.min_passengers !== undefined);
  const hasStudentDiscounts = discounts.some(d => d.type === 'student');
  
  const minGroupSize = Math.min(
    ...discounts
      .filter(d => d.min_passengers !== undefined)
      .map(d => d.min_passengers!)
  );
  
  return {
    validate_age_requirements: hasAgeBasedDiscounts,
    require_birth_date_for_age_discounts: hasAgeBasedDiscounts,
    validate_group_size: hasGroupDiscounts,
    min_group_size_global: isFinite(minGroupSize) ? minGroupSize : 1,
    require_documents_for_student_discounts: hasStudentDiscounts,
    allow_multiple_discounts_per_passenger: false, // Conservative default
    prioritize_best_discount: true,
    max_discount_percentage: 100,
    max_discount_absolute: 1000
  };
}

// ===============================
// Validation Functions
// ===============================

export function validateNormalizedDiscounts(response: NormalizedDiscountResponse): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check basic structure
  if (!Array.isArray(response.discounts)) {
    errors.push('Discounts must be an array');
  }
  
  // Validate individual discounts
  response.discounts.forEach((discount, index) => {
    if (!discount.discount_id) {
      errors.push(`Discount ${index}: missing discount_id`);
    }
    
    if (!discount.name) {
      errors.push(`Discount ${index}: missing name`);
    }
    
    if (typeof discount.price !== 'number' || isNaN(discount.price)) {
      errors.push(`Discount ${index}: invalid price`);
    }
    
    if (discount.age_min !== undefined && discount.age_max !== undefined) {
      if (discount.age_min > discount.age_max) {
        warnings.push(`Discount ${index}: age_min (${discount.age_min}) > age_max (${discount.age_max})`);
      }
    }
    
    if (discount.min_passengers !== undefined && discount.min_passengers < 1) {
      warnings.push(`Discount ${index}: min_passengers should be >= 1`);
    }
  });
  
  // Check for duplicate IDs
  const ids = response.discounts.map(d => d.discount_id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    warnings.push('Duplicate discount IDs found');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ===============================
// Utility Functions
// ===============================

function createEmptyDiscountResponse(cacheKey: string): NormalizedDiscountResponse {
  return {
    discounts: [],
    by_category: {},
    by_type: {},
    age_based_discounts: [],
    group_discounts: [],
    general_discounts: [],
    stats: {
      total_available: 0,
      total_selected: 0,
      total_savings: 0,
      currency: 'EUR',
      by_category: {}
    },
    business_rules: {
      validate_age_requirements: false,
      require_birth_date_for_age_discounts: false,
      validate_group_size: false,
      min_group_size_global: 1,
      require_documents_for_student_discounts: false,
      allow_multiple_discounts_per_passenger: false,
      prioritize_best_discount: true,
      max_discount_percentage: 100,
      max_discount_absolute: 1000
    },
    cached_at: Date.now(),
    cache_key: cacheKey
  };
}

export function groupDiscountsByCategory(discounts: DiscountItem[]): Array<{
  category: string;
  name: string;
  discounts: DiscountItem[];
  count: number;
}> {
  const groups = categorizeDiscounts(discounts);
  
  return Object.entries(groups.by_category).map(([category, items]) => ({
    category,
    name: getCategoryDisplayName(category),
    discounts: items,
    count: items.length
  })).sort((a, b) => getCategorySortOrder(a.category) - getCategorySortOrder(b.category));
}

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    child: 'Copii',
    adult: 'Adulți',
    senior: 'Seniori',
    student: 'Studenți',
    group: 'Grup',
    special: 'Special',
    other: 'Altele'
  };
  
  return names[category] || category;
}

function getCategorySortOrder(category: string): number {
  const order: Record<string, number> = {
    child: 1,
    student: 2,
    adult: 3,
    senior: 4,
    group: 5,
    special: 6,
    other: 7
  };
  
  return order[category] || 999;
}
