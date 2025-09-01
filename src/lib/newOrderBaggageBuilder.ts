/**
 * NEW ORDER BAGGAGE PAYLOAD BUILDER
 * 
 * Construiește payload-ul pentru API new_order cu informații bagaje
 * Implementează business rules: exclude bagaje gratuite, validează limite
 */

import type {
  BaggageItem,
  NewOrderBaggagePayload,
  BaggageSelection,
  BaggageValidationRules
} from '@/types/getBaggage';

// ===============================
// Payload Builder Core
// ===============================

interface BuildPayloadOptions {
  exclude_free_baggage?: boolean; // Default: true (exclude bagaje cu price = 0)
  validate_limits?: boolean; // Default: true
  currency?: string; // Default: from first baggage item
  include_metadata?: boolean; // Default: true
}

interface PayloadBuildResult {
  success: boolean;
  payload?: NewOrderBaggagePayload;
  excluded_items?: Array<{
    baggage_id: string;
    reason: string;
    original_quantity: number;
  }>;
  validation_errors?: string[];
  warnings?: string[];
  total_cost: number;
  total_items: number;
}

/**
 * Build new_order payload from baggage selection
 */
export function buildNewOrderBaggagePayload(
  selectedBaggage: BaggageSelection[],
  availableBaggage: BaggageItem[],
  options: BuildPayloadOptions = {}
): PayloadBuildResult {
  const {
    exclude_free_baggage = true,
    validate_limits = true,
    currency,
    include_metadata = true
  } = options;

  const result: PayloadBuildResult = {
    success: false,
    excluded_items: [],
    validation_errors: [],
    warnings: [],
    total_cost: 0,
    total_items: 0
  };

  // Create mapping for quick lookup
  const baggageMap = new Map<string, BaggageItem>();
  availableBaggage.forEach(item => {
    baggageMap.set(item.baggage_id, item);
  });

  // Process each selected item
  const processedItems: Array<{
    baggage_id: string;
    quantity: number;
    price: number;
    currency: string;
    title: string;
  }> = [];

  for (const selection of selectedBaggage) {
    const baggageItem = baggageMap.get(selection.baggage_id);
    
    if (!baggageItem) {
      result.validation_errors!.push(`Bagaj ${selection.baggage_id} nu există în lista disponibilă`);
      continue;
    }

    // Check if should exclude free baggage
    if (exclude_free_baggage && baggageItem.price === 0) {
      result.excluded_items!.push({
        baggage_id: selection.baggage_id,
        reason: 'Bagaj gratuit exclus din comandă',
        original_quantity: selection.quantity
      });
      continue;
    }

    // Validate limits if enabled
    if (validate_limits) {
      const validation = validateBaggageLimits(selection, baggageItem);
      if (!validation.valid) {
        result.validation_errors!.push(...validation.errors);
        continue;
      }
      if (validation.warnings.length > 0) {
        result.warnings!.push(...validation.warnings);
      }
    }

    // Add to processed items
    processedItems.push({
      baggage_id: selection.baggage_id,
      quantity: selection.quantity,
      price: baggageItem.price,
      currency: baggageItem.currency || 'EUR',
      title: baggageItem.baggage_title || `Bagaj ${selection.baggage_id}`
    });

    result.total_cost += baggageItem.price * selection.quantity;
    result.total_items += selection.quantity;
  }

  // Check if we have validation errors
  if (result.validation_errors!.length > 0) {
    return result;
  }

  // Determine currency
  const finalCurrency = currency || 
    processedItems.find(item => item.currency)?.currency || 
    'EUR';

  // Build the payload
  const payload: NewOrderBaggagePayload = {
    baggage: processedItems.map(item => ({
      baggage_id: item.baggage_id,
      quantity: item.quantity.toString() // API expects string
    }))
  };

  // Add metadata if requested
  if (include_metadata) {
    payload.baggage_metadata = {
      total_cost: result.total_cost,
      total_items: result.total_items,
      currency: finalCurrency,
      excluded_free_items: result.excluded_items!.length,
      processed_at: new Date().toISOString(),
      breakdown: processedItems.map(item => ({
        baggage_id: item.baggage_id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        currency: item.currency
      }))
    };
  }

  result.success = true;
  result.payload = payload;

  return result;
}

// ===============================
// Validation Functions
// ===============================

function validateBaggageLimits(
  selection: BaggageSelection,
  baggageItem: BaggageItem
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check max_per_person
  if (baggageItem.max_per_person && selection.quantity > baggageItem.max_per_person) {
    errors.push(
      `${baggageItem.baggage_title}: depășit limita de ${baggageItem.max_per_person} per persoană (selectat: ${selection.quantity})`
    );
  }

  // Check max_in_bus (warning - depends on total in bus)
  if (baggageItem.max_in_bus && selection.quantity > baggageItem.max_in_bus) {
    warnings.push(
      `${baggageItem.baggage_title}: posibil să depășească limita de ${baggageItem.max_in_bus} per autobuz`
    );
  }

  // Check quantity is positive
  if (selection.quantity <= 0) {
    errors.push(`${baggageItem.baggage_title}: cantitatea trebuie să fie pozitivă`);
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

/**
 * Calculate total cost before building payload
 */
export function calculateBaggageSelectionCost(
  selections: BaggageSelection[],
  availableBaggage: BaggageItem[],
  options: { exclude_free?: boolean } = {}
): {
  total_cost: number;
  currency: string;
  paid_items: number;
  free_items: number;
  breakdown: Array<{
    baggage_id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_free: boolean;
  }>;
} {
  const { exclude_free = true } = options;

  const baggageMap = new Map<string, BaggageItem>();
  availableBaggage.forEach(item => {
    baggageMap.set(item.baggage_id, item);
  });

  let totalCost = 0;
  let currency = 'EUR';
  let paidItems = 0;
  let freeItems = 0;
  const breakdown: Array<{
    baggage_id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_free: boolean;
  }> = [];

  selections.forEach(selection => {
    const item = baggageMap.get(selection.baggage_id);
    if (!item) return;

    const isFree = item.price === 0;
    const totalPrice = item.price * selection.quantity;

    if (!exclude_free || !isFree) {
      totalCost += totalPrice;
    }

    if (isFree) {
      freeItems += selection.quantity;
    } else {
      paidItems += selection.quantity;
    }

    currency = item.currency || currency;

    breakdown.push({
      baggage_id: selection.baggage_id,
      title: item.baggage_title || `Bagaj ${selection.baggage_id}`,
      quantity: selection.quantity,
      unit_price: item.price,
      total_price: totalPrice,
      is_free: isFree
    });
  });

  return {
    total_cost: Math.round(totalCost * 100) / 100,
    currency,
    paid_items: paidItems,
    free_items: freeItems,
    breakdown
  };
}

/**
 * Validate entire baggage selection before creating payload
 */
export function validateBaggageSelectionComplete(
  selections: BaggageSelection[],
  availableBaggage: BaggageItem[],
  validationRules?: BaggageValidationRules
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    total_items: number;
    total_paid_items: number;
    total_free_items: number;
    estimated_cost: number;
    currency: string;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const baggageMap = new Map<string, BaggageItem>();
  availableBaggage.forEach(item => {
    baggageMap.set(item.baggage_id, item);
  });

  let totalItems = 0;
  let totalPaidItems = 0;
  let totalFreeItems = 0;
  let estimatedCost = 0;
  let currency = 'EUR';

  // Validate each selection
  selections.forEach(selection => {
    const item = baggageMap.get(selection.baggage_id);
    
    if (!item) {
      errors.push(`Bagaj ${selection.baggage_id} nu există`);
      return;
    }

    // Basic validation
    if (selection.quantity <= 0) {
      errors.push(`${item.baggage_title}: cantitatea trebuie să fie pozitivă`);
      return;
    }

    // Limits validation
    const limitValidation = validateBaggageLimits(selection, item);
    errors.push(...limitValidation.errors);
    warnings.push(...limitValidation.warnings);

    // Count items
    totalItems += selection.quantity;
    if (item.price === 0) {
      totalFreeItems += selection.quantity;
    } else {
      totalPaidItems += selection.quantity;
      estimatedCost += item.price * selection.quantity;
    }

    currency = item.currency || currency;
  });

  // Apply custom validation rules if provided
  if (validationRules) {
    if (validationRules.max_total_items && totalItems > validationRules.max_total_items) {
      errors.push(`Total bagaje depășește limita de ${validationRules.max_total_items}`);
    }

    if (validationRules.max_total_cost && estimatedCost > validationRules.max_total_cost) {
      errors.push(`Costul total bagaje depășește limita de ${validationRules.max_total_cost} ${currency}`);
    }

    if (validationRules.min_total_cost && estimatedCost < validationRules.min_total_cost) {
      warnings.push(`Costul total este sub minimul de ${validationRules.min_total_cost} ${currency}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      total_items: totalItems,
      total_paid_items: totalPaidItems,
      total_free_items: totalFreeItems,
      estimated_cost: Math.round(estimatedCost * 100) / 100,
      currency
    }
  };
}

/**
 * Convert baggage payload back to selections (for editing)
 */
export function convertPayloadToSelections(
  payload: NewOrderBaggagePayload
): BaggageSelection[] {
  return payload.baggage.map(item => ({
    baggage_id: item.baggage_id,
    quantity: parseInt(item.quantity, 10) || 0
  }));
}

/**
 * Merge multiple baggage selections (useful for multiple passengers)
 */
export function mergeBaggageSelections(
  selectionsArray: BaggageSelection[][]
): BaggageSelection[] {
  const mergedMap = new Map<string, number>();

  selectionsArray.forEach(selections => {
    selections.forEach(selection => {
      const currentQuantity = mergedMap.get(selection.baggage_id) || 0;
      mergedMap.set(selection.baggage_id, currentQuantity + selection.quantity);
    });
  });

  return Array.from(mergedMap.entries()).map(([baggage_id, quantity]) => ({
    baggage_id,
    quantity
  }));
}

/**
 * Split baggage selection by passenger (reverse of merge)
 */
export function splitBaggageSelectionByPassenger(
  selections: BaggageSelection[],
  passengerCount: number,
  availableBaggage: BaggageItem[]
): BaggageSelection[][] {
  if (passengerCount <= 1) {
    return [selections];
  }

  const baggageMap = new Map<string, BaggageItem>();
  availableBaggage.forEach(item => {
    baggageMap.set(item.baggage_id, item);
  });

  const result: BaggageSelection[][] = Array.from({ length: passengerCount }, () => []);

  selections.forEach(selection => {
    const item = baggageMap.get(selection.baggage_id);
    if (!item) return;

    const maxPerPerson = item.max_per_person || selection.quantity;
    const quantityPerPassenger = Math.min(maxPerPerson, Math.floor(selection.quantity / passengerCount));
    const remainder = selection.quantity % passengerCount;

    // Distribute equally
    for (let i = 0; i < passengerCount; i++) {
      let quantity = quantityPerPassenger;
      
      // Distribute remainder to first passengers
      if (i < remainder) {
        quantity += 1;
      }

      if (quantity > 0) {
        result[i].push({
          baggage_id: selection.baggage_id,
          quantity
        });
      }
    }
  });

  return result;
}

/**
 * Generate summary text for baggage selection
 */
export function generateBaggageSelectionSummary(
  selections: BaggageSelection[],
  availableBaggage: BaggageItem[],
  language: string = 'ro'
): {
  short_summary: string;
  detailed_summary: string;
  cost_summary: string;
} {
  const baggageMap = new Map<string, BaggageItem>();
  availableBaggage.forEach(item => {
    baggageMap.set(item.baggage_id, item);
  });

  const costCalc = calculateBaggageSelectionCost(selections, availableBaggage);
  
  const itemCount = selections.reduce((sum, s) => sum + s.quantity, 0);
  
  const shortSummary = language === 'ro' 
    ? `${itemCount} bagaje (${costCalc.total_cost} ${costCalc.currency})`
    : `${itemCount} baggage items (${costCalc.total_cost} ${costCalc.currency})`;

  const detailedItems = selections.map(selection => {
    const item = baggageMap.get(selection.baggage_id);
    const title = item?.baggage_title || `Bagaj ${selection.baggage_id}`;
    return `${selection.quantity}× ${title}`;
  }).join(', ');

  const detailedSummary = language === 'ro'
    ? `Bagaje selectate: ${detailedItems}`
    : `Selected baggage: ${detailedItems}`;

  const costSummary = language === 'ro'
    ? `Total: ${costCalc.total_cost} ${costCalc.currency} (${costCalc.paid_items} cu plată, ${costCalc.free_items} gratuite)`
    : `Total: ${costCalc.total_cost} ${costCalc.currency} (${costCalc.paid_items} paid, ${costCalc.free_items} free)`;

  return {
    short_summary: shortSummary,
    detailed_summary: detailedSummary,
    cost_summary: costSummary
  };
}
