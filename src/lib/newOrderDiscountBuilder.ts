/**
 * NEW ORDER DISCOUNT PAYLOAD BUILDER
 * 
 * Construiește payload-uri pentru new_order cu discounturi aplicabile
 * Respectă business rules și validările necesare
 */

import type {
  DiscountSelection,
  DetailedDiscountSelection,
  NewOrderDiscountPayload,
  DiscountItem,
  DiscountValidationResult,
  PassengerDiscountValidation,
  DiscountBusinessRules
} from '@/types/getDiscount';

// ===============================
// Core Builder Functions
// ===============================

export function buildNewOrderDiscountPayload(params: {
  selections: DiscountSelection[];
  discounts: DiscountItem[];
  passengers: Array<{
    index: number;
    birth_date?: string;
    age?: number;
    has_document?: boolean;
  }>;
  trips: Array<{
    index: number;
    interval_id: string;
  }>;
  currency: string;
  business_rules?: DiscountBusinessRules;
}): NewOrderDiscountPayload {
  const {
    selections,
    discounts,
    passengers,
    trips,
    currency,
    business_rules
  } = params;
  
  // Validate selections first
  const validationResults = validateAllSelections(
    selections,
    discounts,
    passengers,
    business_rules
  );
  
  // Filter valid selections only
  const validSelections = selections.filter((selection, index) => {
    const passengerValidation = validationResults.find(
      v => v.passenger_index === selection.passenger_index
    );
    return passengerValidation?.validation_result.valid;
  });
  
  // Build discount_id array structure
  const discount_id = buildDiscountIdArray(validSelections, trips.length);
  
  // Create detailed selections for metadata
  const detailedSelections: DetailedDiscountSelection[] = validSelections.map(selection => {
    const discount = discounts.find(d => d.discount_id === selection.discount_id);
    if (!discount) {
      throw new Error(`Discount not found: ${selection.discount_id}`);
    }
    
    return {
      ...selection,
      discount,
      estimated_price: discount.price
    };
  });
  
  // Calculate total estimated discount
  const total_estimated_discount = detailedSelections.reduce(
    (sum, selection) => sum + selection.estimated_price,
    0
  );
  
  return {
    discount_id,
    discount_metadata: {
      total_estimated_discount,
      currency,
      selections: detailedSelections,
      validation_results: validationResults
    }
  };
}

// ===============================
// Discount ID Array Builder
// ===============================

function buildDiscountIdArray(
  selections: DiscountSelection[],
  tripCount: number
): Array<Record<string, string>> {
  // Inițializează array cu obiecte goale pentru fiecare trip
  const discountIdArray: Array<Record<string, string>> = [];
  
  for (let tripIndex = 0; tripIndex < tripCount; tripIndex++) {
    discountIdArray.push({});
  }
  
  // Populează cu selecțiile valide
  selections.forEach(selection => {
    const { trip_index, passenger_index, discount_id } = selection;
    
    // Validare index
    if (trip_index < 0 || trip_index >= tripCount) {
      console.warn(`Invalid trip_index: ${trip_index} (max: ${tripCount - 1})`);
      return;
    }
    
    // Adaugă selecția în structura discount_id
    // Folosește string pentru chei conform documentației
    discountIdArray[trip_index][String(passenger_index)] = String(discount_id);
  });
  
  return discountIdArray;
}

// ===============================
// Validation Functions
// ===============================

export function validateAllSelections(
  selections: DiscountSelection[],
  discounts: DiscountItem[],
  passengers: Array<{
    index: number;
    birth_date?: string;
    age?: number;
    has_document?: boolean;
  }>,
  business_rules?: DiscountBusinessRules
): PassengerDiscountValidation[] {
  return passengers.map(passenger => {
    // Găsește selecțiile pentru acest pasager
    const passengerSelections = selections.filter(
      s => s.passenger_index === passenger.index
    );
    
    // Validare pentru fiecare selecție
    const selectionValidations = passengerSelections.map(selection => {
      const discount = discounts.find(d => d.discount_id === selection.discount_id);
      if (!discount) {
        return {
          valid: false,
          errors: [`Discount not found: ${selection.discount_id}`],
          warnings: [],
          age_requirements_met: false,
          document_requirements_met: false,
          group_requirements_met: false,
          requires_birth_date: false,
          requires_document: false
        } as DiscountValidationResult;
      }
      
      return validateSingleSelection(
        discount,
        passenger,
        passengers.length,
        business_rules
      );
    });
    
    // Combină rezultatele validării
    const combinedValidation = combineValidationResults(selectionValidations);
    
    return {
      passenger_index: passenger.index,
      birth_date: passenger.birth_date,
      age: passenger.age,
      has_document: passenger.has_document,
      validation_result: combinedValidation
    };
  });
}

function validateSingleSelection(
  discount: DiscountItem,
  passenger: {
    index: number;
    birth_date?: string;
    age?: number;
    has_document?: boolean;
  },
  totalPassengers: number,
  business_rules?: DiscountBusinessRules
): DiscountValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Age validation
  let age_requirements_met = true;
  if (discount.age_min !== undefined || discount.age_max !== undefined) {
    if (passenger.age === undefined) {
      errors.push('Vârsta pasagerului este necesară pentru acest discount');
      age_requirements_met = false;
    } else {
      if (discount.age_min !== undefined && passenger.age < discount.age_min) {
        errors.push(`Vârsta minimă pentru "${discount.name}" este ${discount.age_min} ani`);
        age_requirements_met = false;
      }
      
      if (discount.age_max !== undefined && passenger.age > discount.age_max) {
        errors.push(`Vârsta maximă pentru "${discount.name}" este ${discount.age_max} ani`);
        age_requirements_met = false;
      }
    }
  }
  
  // Document validation
  let document_requirements_met = true;
  if (discount.requires_document) {
    if (!passenger.has_document) {
      errors.push(`Discountul "${discount.name}" necesită un document valid`);
      document_requirements_met = false;
    }
  }
  
  // Group size validation
  let group_requirements_met = true;
  if (discount.min_passengers !== undefined) {
    if (totalPassengers < discount.min_passengers) {
      errors.push(
        `Discountul "${discount.name}" necesită minim ${discount.min_passengers} pasageri (aveți ${totalPassengers})`
      );
      group_requirements_met = false;
    }
  }
  
  // Business rules validation
  if (business_rules) {
    // Check birth date requirements
    if (business_rules.require_birth_date_for_age_discounts && 
        (discount.age_min !== undefined || discount.age_max !== undefined)) {
      if (!passenger.birth_date) {
        errors.push('Data nașterii este necesară pentru discounturi bazate pe vârstă');
      }
    }
    
    // Check document requirements for students
    if (business_rules.require_documents_for_student_discounts && 
        discount.type === 'student') {
      if (!passenger.has_document) {
        errors.push('Legitimația de student este necesară pentru acest discount');
        document_requirements_met = false;
      }
    }
  }
  
  // Check requirements for new_order
  const requires_birth_date = discount.requires_birth_date || 
    (discount.age_min !== undefined || discount.age_max !== undefined);
  
  const requires_document = discount.requires_document || 
    discount.type === 'student';
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    age_requirements_met,
    document_requirements_met,
    group_requirements_met,
    requires_birth_date,
    requires_document
  };
}

function combineValidationResults(results: DiscountValidationResult[]): DiscountValidationResult {
  if (results.length === 0) {
    return {
      valid: true,
      errors: [],
      warnings: [],
      age_requirements_met: true,
      document_requirements_met: true,
      group_requirements_met: true,
      requires_birth_date: false,
      requires_document: false
    };
  }
  
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);
  
  return {
    valid: results.every(r => r.valid),
    errors: allErrors,
    warnings: allWarnings,
    age_requirements_met: results.every(r => r.age_requirements_met),
    document_requirements_met: results.every(r => r.document_requirements_met),
    group_requirements_met: results.every(r => r.group_requirements_met),
    requires_birth_date: results.some(r => r.requires_birth_date),
    requires_document: results.some(r => r.requires_document)
  };
}

// ===============================
// Selection Management
// ===============================

export function addDiscountSelection(
  currentSelections: DiscountSelection[],
  newSelection: DiscountSelection,
  business_rules?: DiscountBusinessRules
): DiscountSelection[] {
  // Check if multiple discounts per passenger are allowed
  if (business_rules && !business_rules.allow_multiple_discounts_per_passenger) {
    // Remove existing selections for this passenger on this trip
    const filtered = currentSelections.filter(
      s => !(s.passenger_index === newSelection.passenger_index && 
             s.trip_index === newSelection.trip_index)
    );
    
    return [...filtered, newSelection];
  }
  
  // Check for exact duplicates
  const exists = currentSelections.some(
    s => s.passenger_index === newSelection.passenger_index &&
         s.trip_index === newSelection.trip_index &&
         s.discount_id === newSelection.discount_id
  );
  
  if (exists) {
    return currentSelections; // No change
  }
  
  return [...currentSelections, newSelection];
}

export function removeDiscountSelection(
  currentSelections: DiscountSelection[],
  selectionToRemove: DiscountSelection
): DiscountSelection[] {
  return currentSelections.filter(
    s => !(s.passenger_index === selectionToRemove.passenger_index &&
           s.trip_index === selectionToRemove.trip_index &&
           s.discount_id === selectionToRemove.discount_id)
  );
}

export function clearDiscountSelections(
  currentSelections: DiscountSelection[],
  passengerIndex?: number,
  tripIndex?: number
): DiscountSelection[] {
  return currentSelections.filter(s => {
    if (passengerIndex !== undefined && s.passenger_index === passengerIndex) {
      if (tripIndex !== undefined && s.trip_index === tripIndex) {
        return false; // Remove this specific passenger/trip combination
      } else if (tripIndex === undefined) {
        return false; // Remove all for this passenger
      }
    }
    
    if (tripIndex !== undefined && passengerIndex === undefined && s.trip_index === tripIndex) {
      return false; // Remove all for this trip
    }
    
    return true; // Keep this selection
  });
}

// ===============================
// Cost Calculation
// ===============================

export function calculateDiscountSelectionCost(
  selections: DiscountSelection[],
  discounts: DiscountItem[]
): {
  total_discount: number;
  currency: string;
  breakdown: Array<{
    selection: DiscountSelection;
    discount: DiscountItem;
    amount: number;
  }>;
} {
  const breakdown: Array<{
    selection: DiscountSelection;
    discount: DiscountItem;
    amount: number;
  }> = [];
  
  let total_discount = 0;
  let currency = 'EUR';
  
  selections.forEach(selection => {
    const discount = discounts.find(d => d.discount_id === selection.discount_id);
    if (discount) {
      breakdown.push({
        selection,
        discount,
        amount: discount.price
      });
      
      total_discount += discount.price;
      currency = discount.currency || currency;
    }
  });
  
  return {
    total_discount,
    currency,
    breakdown
  };
}

// ===============================
// Utility Functions
// ===============================

export function findBestDiscountForPassenger(
  discounts: DiscountItem[],
  passenger: {
    index: number;
    birth_date?: string;
    age?: number;
    has_document?: boolean;
  },
  totalPassengers: number
): DiscountItem | null {
  // Găsește toate discounturile aplicabile
  const applicableDiscounts = discounts.filter(discount => {
    const validation = validateSingleSelection(
      discount,
      passenger,
      totalPassengers
    );
    return validation.valid;
  });
  
  if (applicableDiscounts.length === 0) {
    return null;
  }
  
  // Returnează discountul cu cea mai mare reducere
  return applicableDiscounts.reduce((best, current) => 
    current.price > best.price ? current : best
  );
}

export function getSelectionSummary(
  selections: DiscountSelection[],
  discounts: DiscountItem[]
): {
  total_selections: number;
  total_passengers_with_discounts: number;
  total_trips_with_discounts: number;
  total_estimated_savings: number;
  currency: string;
} {
  const uniquePassengers = new Set(selections.map(s => s.passenger_index));
  const uniqueTrips = new Set(selections.map(s => s.trip_index));
  
  const cost = calculateDiscountSelectionCost(selections, discounts);
  
  return {
    total_selections: selections.length,
    total_passengers_with_discounts: uniquePassengers.size,
    total_trips_with_discounts: uniqueTrips.size,
    total_estimated_savings: cost.total_discount,
    currency: cost.currency
  };
}
