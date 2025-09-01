// Normalization functions for get_plan API responses
// Converts XML responses to standardized TypeScript objects

import type {
  BusPlan,
  FloorInfo,
  PlanRow,
  SeatInfo,
  NormalizedPlanResponse,
  GetPlanError
} from '@/types/getPlan';

/**
 * Parse string value safely
 */
function parseStringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Parse number value safely
 */
function parseNumberValue(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse seat information from XML element
 */
function parseSeatInfo(seatElement: unknown, rowIndex: number, seatIndex: number): SeatInfo {
  if (typeof seatElement === 'string') {
    const seatNumber = seatElement.trim();
    return {
      number: seatNumber || null,
      isEmpty: !seatNumber,
      isSelectable: !!seatNumber
    };
  }
  
  if (typeof seatElement === 'object' && seatElement !== null) {
    const seatObj = seatElement as Record<string, unknown>;
    const seatNumber = parseStringValue(seatObj['#text'] || seatObj.content || '');
    const icon = parseStringValue(seatObj['@icon'] || seatObj.icon || '');
    
    return {
      number: seatNumber || null,
      icon: icon || null,
      isEmpty: !seatNumber,
      isSelectable: !!seatNumber
    };
  }
  
  return {
    number: null,
    isEmpty: true,
    isSelectable: false
  };
}

/**
 * Parse row information from XML
 */
function parseRowInfo(rowElement: unknown, rowIndex: number): PlanRow {
  const seats: SeatInfo[] = [];
  
  if (typeof rowElement === 'object' && rowElement !== null) {
    const rowObj = rowElement as Record<string, unknown>;
    const seatElements = rowObj.seat || rowObj.seats || [];
    
    if (Array.isArray(seatElements)) {
      seatElements.forEach((seatElement, seatIndex) => {
        seats.push(parseSeatInfo(seatElement, rowIndex, seatIndex));
      });
    } else if (seatElements) {
      seats.push(parseSeatInfo(seatElements, rowIndex, 0));
    }
  }
  
  return {
    seats,
    rowIndex
  };
}

/**
 * Parse floor information from XML (v2.0)
 */
function parseFloorInfo(floorElement: unknown): FloorInfo {
  const rows: PlanRow[] = [];
  let floorNumber = 1;
  
  if (typeof floorElement === 'object' && floorElement !== null) {
    const floorObj = floorElement as Record<string, unknown>;
    
    // Get floor number
    floorNumber = parseNumberValue(floorObj.number || floorObj.floor || 1);
    
    // Get rows
    const rowElements = floorObj.row || floorObj.rows || [];
    
    if (Array.isArray(rowElements)) {
      rowElements.forEach((rowElement, rowIndex) => {
        rows.push(parseRowInfo(rowElement, rowIndex));
      });
    } else if (rowElements) {
      rows.push(parseRowInfo(rowElements, 0));
    }
  }
  
  return {
    number: floorNumber,
    rows
  };
}

/**
 * Normalize plan response from API v1.1
 */
function normalizePlanV1(xmlData: Record<string, unknown>, busTypeId: string): BusPlan {
  const planType = parseStringValue(xmlData.plan_type || 'standard');
  const rows: PlanRow[] = [];
  
  // Get rows directly from root
  const rowElements = xmlData.row || xmlData.rows || [];
  
  if (Array.isArray(rowElements)) {
    rowElements.forEach((rowElement, rowIndex) => {
      rows.push(parseRowInfo(rowElement, rowIndex));
    });
  } else if (rowElements) {
    rows.push(parseRowInfo(rowElements, 0));
  }
  
  // Create single floor for v1.1
  const floor: FloorInfo = {
    number: 1,
    rows
  };
  
  return {
    planType,
    version: 1.1,
    floors: [floor],
    orientation: 'h', // default
    busTypeId
  };
}

/**
 * Normalize plan response from API v2.0
 */
function normalizePlanV2(xmlData: Record<string, unknown>, busTypeId: string): BusPlan {
  const planType = parseStringValue(xmlData.plan_type || 'standard');
  const floors: FloorInfo[] = [];
  
  // Get floors from XML
  const floorsData = xmlData.floors || xmlData.floor || [];
  
  if (Array.isArray(floorsData)) {
    floorsData.forEach(floorElement => {
      floors.push(parseFloorInfo(floorElement));
    });
  } else if (floorsData) {
    floors.push(parseFloorInfo(floorsData));
  }
  
  // If no floors found, try to parse as v1.1 format
  if (floors.length === 0) {
    const rows: PlanRow[] = [];
    const rowElements = xmlData.row || xmlData.rows || [];
    
    if (Array.isArray(rowElements)) {
      rowElements.forEach((rowElement, rowIndex) => {
        rows.push(parseRowInfo(rowElement, rowIndex));
      });
    } else if (rowElements) {
      rows.push(parseRowInfo(rowElements, 0));
    }
    
    if (rows.length > 0) {
      floors.push({
        number: 1,
        rows
      });
    }
  }
  
  return {
    planType,
    version: 2.0,
    floors,
    orientation: 'h', // default
    busTypeId
  };
}

/**
 * Main normalization function
 */
export function normalizePlanResponse(
  rawResponse: unknown,
  busTypeId: string,
  requestedVersion: 1.1 | 2.0 = 2.0,
  requestedOrientation: 'h' | 'v' = 'h'
): NormalizedPlanResponse {
  const requestTime = new Date().toISOString();
  const responseTime = new Date().toISOString();
  
  try {
    let xmlData: Record<string, unknown> = {};
    
    // Handle different response formats
    if (typeof rawResponse === 'object' && rawResponse !== null) {
      const responseObj = rawResponse as Record<string, unknown>;
      
      // Check for root element
      if (responseObj.root) {
        xmlData = responseObj.root as Record<string, unknown>;
      } else if (responseObj['#document']) {
        xmlData = responseObj['#document'] as Record<string, unknown>;
      } else {
        xmlData = responseObj;
      }
    }
    
    // Determine version based on response structure
    const hasFloors = xmlData.floors || xmlData.floor;
    const actualVersion = hasFloors ? 2.0 : 1.1;
    
    // Normalize based on detected version
    let plan: BusPlan;
    if (actualVersion === 2.0) {
      plan = normalizePlanV2(xmlData, busTypeId);
    } else {
      plan = normalizePlanV1(xmlData, busTypeId);
    }
    
    // Set requested orientation
    plan.orientation = requestedOrientation;
    
    return {
      busTypeId,
      plan,
      requestTime,
      responseTime
    };
    
  } catch (error) {
    console.error('Error normalizing plan response:', error);
    
    // Return empty plan on error
    const emptyPlan: BusPlan = {
      planType: 'unknown',
      version: requestedVersion,
      floors: [],
      orientation: requestedOrientation,
      busTypeId
    };
    
    return {
      busTypeId,
      plan: emptyPlan,
      requestTime,
      responseTime
    };
  }
}

/**
 * Validate plan structure
 */
export function validatePlan(plan: BusPlan): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!plan.busTypeId) {
    errors.push('Bus type ID is required');
  }
  
  if (!plan.planType) {
    errors.push('Plan type is required');
  }
  
  if (![1.1, 2.0].includes(plan.version)) {
    errors.push('Invalid version: must be 1.1 or 2.0');
  }
  
  if (!['h', 'v'].includes(plan.orientation)) {
    errors.push('Invalid orientation: must be h or v');
  }
  
  if (!Array.isArray(plan.floors) || plan.floors.length === 0) {
    errors.push('At least one floor is required');
  }
  
  plan.floors.forEach((floor, floorIndex) => {
    if (typeof floor.number !== 'number') {
      errors.push(`Floor ${floorIndex}: number must be a number`);
    }
    
    if (!Array.isArray(floor.rows)) {
      errors.push(`Floor ${floorIndex}: rows must be an array`);
    }
    
    floor.rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row.seats)) {
        errors.push(`Floor ${floorIndex}, Row ${rowIndex}: seats must be an array`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get plan statistics
 */
export function getPlanStatistics(plan: BusPlan): {
  totalFloors: number;
  totalRows: number;
  totalSeats: number;
  availableSeats: number;
  occupancyRate: number;
} {
  let totalRows = 0;
  let totalSeats = 0;
  let availableSeats = 0;
  
  plan.floors.forEach(floor => {
    totalRows += floor.rows.length;
    
    floor.rows.forEach(row => {
      row.seats.forEach(seat => {
        if (!seat.isEmpty) {
          totalSeats++;
          if (seat.isSelectable) {
            availableSeats++;
          }
        }
      });
    });
  });
  
  const occupancyRate = totalSeats > 0 ? ((totalSeats - availableSeats) / totalSeats) * 100 : 0;
  
  return {
    totalFloors: plan.floors.length,
    totalRows,
    totalSeats,
    availableSeats,
    occupancyRate
  };
}

/**
 * Find seat by number
 */
export function findSeatByNumber(plan: BusPlan, seatNumber: string): {
  seat: SeatInfo | null;
  position: { floorIndex: number; rowIndex: number; seatIndex: number } | null;
} {
  for (let floorIndex = 0; floorIndex < plan.floors.length; floorIndex++) {
    const floor = plan.floors[floorIndex];
    
    for (let rowIndex = 0; rowIndex < floor.rows.length; rowIndex++) {
      const row = floor.rows[rowIndex];
      
      for (let seatIndex = 0; seatIndex < row.seats.length; seatIndex++) {
        const seat = row.seats[seatIndex];
        
        if (seat.number === seatNumber) {
          return {
            seat,
            position: { floorIndex, rowIndex, seatIndex }
          };
        }
      }
    }
  }
  
  return { seat: null, position: null };
}

/**
 * Get all seat numbers from plan
 */
export function getAllSeatNumbers(plan: BusPlan): string[] {
  const seatNumbers: string[] = [];
  
  plan.floors.forEach(floor => {
    floor.rows.forEach(row => {
      row.seats.forEach(seat => {
        if (seat.number && !seat.isEmpty) {
          seatNumbers.push(seat.number);
        }
      });
    });
  });
  
  return seatNumbers.sort((a, b) => {
    // Try to sort numerically if possible
    const numA = parseInt(a);
    const numB = parseInt(b);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Fallback to string sort
    return a.localeCompare(b);
  });
}
