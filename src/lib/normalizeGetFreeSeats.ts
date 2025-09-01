/**
 * GET FREE SEATS NORMALIZATION
 * 
 * Normalizează răspunsurile XML/JSON de la API în structura FreeSeat[]
 * Gestionează autobuze și trenuri cu vagoane
 */

import type {
  FreeSeat,
  VagonInfo,
  TrainInfo,
  BusInfo,
  RawFreeSeatResponse,
  NormalizedSeatsResponse,
  GetFreeSeatsError
} from '@/types/getFreeSeats';

// ===============================
// Helper Functions
// ===============================

function parseNumericValue(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value !== null && value !== undefined) return String(value);
  return '';
}

function parseBooleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'da';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
}

function ensureArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

// ===============================
// Seat Normalization
// ===============================

function normalizeSeat(
  seatData: Record<string, unknown>,
  vagonInfo?: VagonInfo
): FreeSeat {
  const seatNumber = parseStringValue(seatData.number || seatData.seat_number || seatData.nr);
  const isFree = parseBooleanValue(seatData.is_free || seatData.free || seatData.available);
  const price = parseNumericValue(seatData.price || seatData.pret);
  
  const seat: FreeSeat = {
    seat_number: seatNumber,
    is_free: isFree,
    price: price
  };
  
  // Coordinates for visual representation
  if (seatData.x && seatData.y) {
    seat.coordinates = {
      x: parseNumericValue(seatData.x),
      y: parseNumericValue(seatData.y)
    };
  } else if (seatData.position) {
    // Try to parse position string like "1,2" or "row-1-seat-2"
    const position = parseStringValue(seatData.position);
    if (position.includes(',')) {
      const [x, y] = position.split(',').map(p => parseNumericValue(p));
      seat.coordinates = { x, y };
    } else if (position.includes('-')) {
      // Extract numbers from position string
      const numbers = position.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        seat.coordinates = {
          x: parseNumericValue(numbers[0]),
          y: parseNumericValue(numbers[1])
        };
      }
    }
  }
  
  // Add vagon info if available
  if (vagonInfo) {
    seat.vagon_id = vagonInfo.vagon_id;
    seat.vagon_type = vagonInfo.vagon_type;
  }
  
  // Seat type (if specified)
  if (seatData.tip || seatData.type || seatData.category) {
    seat.seat_type = parseStringValue(seatData.tip || seatData.type || seatData.category);
  }
  
  // Class information
  if (seatData.clasa || seatData.class) {
    seat.class = parseStringValue(seatData.clasa || seatData.class);
  }
  
  // Service information
  if (seatData.servicii || seatData.services) {
    const services = seatData.servicii || seatData.services;
    if (typeof services === 'string') {
      seat.services = services.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(services)) {
      seat.services = services.map(s => parseStringValue(s)).filter(Boolean);
    }
  }
  
  return seat;
}

// ===============================
// Vagon Normalization
// ===============================

function normalizeVagon(vagonData: Record<string, unknown>): VagonInfo {
  const vagonId = parseStringValue(vagonData.id || vagonData.vagon_id || vagonData.nummer);
  const vagonType = parseStringValue(vagonData.tip || vagonData.type || vagonData.vagon_type || 'standard');
  
  const vagon: VagonInfo = {
    vagon_id: vagonId,
    vagon_type: vagonType,
    total_seats: 0,
    free_seats: 0,
    seats: []
  };
  
  // Parse seats
  const seatsData = vagonData.locuri || vagonData.seats || vagonData.places;
  if (seatsData) {
    const seatsList = ensureArray(seatsData);
    vagon.seats = seatsList.map(seatData => {
      if (typeof seatData === 'object' && seatData !== null) {
        return normalizeSeat(seatData as Record<string, unknown>, vagon);
      }
      return normalizeSeat({ seat_number: String(seatData), is_free: true, price: 0 }, vagon);
    });
  }
  
  // Calculate totals
  vagon.total_seats = vagon.seats.length;
  vagon.free_seats = vagon.seats.filter(seat => seat.is_free).length;
  
  // Vagon name/description
  if (vagonData.nume || vagonData.name || vagonData.description) {
    vagon.name = parseStringValue(vagonData.nume || vagonData.name || vagonData.description);
  }
  
  // Class information
  if (vagonData.clasa || vagonData.class) {
    vagon.class = parseStringValue(vagonData.clasa || vagonData.class);
  }
  
  // Service information
  if (vagonData.servicii || vagonData.services) {
    const services = vagonData.servicii || vagonData.services;
    if (typeof services === 'string') {
      vagon.services = services.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(services)) {
      vagon.services = services.map(s => parseStringValue(s)).filter(Boolean);
    }
  }
  
  return vagon;
}

// ===============================
// Train Normalization
// ===============================

function normalizeTrain(trainData: Record<string, unknown>): TrainInfo {
  const trainId = parseStringValue(trainData.id || trainData.train_id || trainData.nummer);
  const trainNumber = parseStringValue(trainData.numar || trainData.number || trainData.train_number || trainId);
  
  const train: TrainInfo = {
    train_id: trainId,
    train_name: trainNumber, // folosim train_number ca train_name
    train_number: trainNumber,
    vagons: [],
    total_seats: 0,
    free_seats: 0
  };
  
  // Parse vagons
  const vagonsData = trainData.vagoane || trainData.vagons || trainData.cars;
  if (vagonsData) {
    const vagonsList = ensureArray(vagonsData);
    train.vagons = vagonsList.map(vagonData => {
      if (typeof vagonData === 'object' && vagonData !== null) {
        return normalizeVagon(vagonData as Record<string, unknown>);
      }
      return normalizeVagon({ vagon_id: String(vagonData), seats: [] });
    });
  }
  
  // Calculate totals
  train.total_seats = train.vagons.reduce((sum, vagon) => sum + vagon.total_seats, 0);
  train.free_seats = train.vagons.reduce((sum, vagon) => sum + vagon.free_seats, 0);
  
  // Train name/description
  if (trainData.nume || trainData.name || trainData.description) {
    train.name = parseStringValue(trainData.nume || trainData.name || trainData.description);
  }
  
  // Train type
  if (trainData.tip || trainData.type) {
    train.train_type = parseStringValue(trainData.tip || trainData.type);
  }
  
  return train;
}

// ===============================
// Bus Normalization
// ===============================

function normalizeBus(busData: Record<string, unknown>): BusInfo {
  const busId = parseStringValue(busData.id || busData.bus_id || busData.autobuz_id);
  const busNumber = parseStringValue(busData.numar || busData.number || busData.bus_number || busId);
  
  const bus: BusInfo = {
    bus_id: busId,
    bus_number: busNumber,
    seats: [],
    total_seats: 0,
    free_seats: 0
  };
  
  // Parse seats
  const seatsData = busData.locuri || busData.seats || busData.places;
  if (seatsData) {
    const seatsList = ensureArray(seatsData);
    bus.seats = seatsList.map(seatData => {
      if (typeof seatData === 'object' && seatData !== null) {
        return normalizeSeat(seatData as Record<string, unknown>);
      }
      return normalizeSeat({ seat_number: String(seatData), is_free: true, price: 0 });
    });
  }
  
  // Calculate totals
  bus.total_seats = bus.seats.length;
  bus.free_seats = bus.seats.filter(seat => seat.is_free).length;
  
  // Bus name/description
  if (busData.nume || busData.name || busData.description) {
    bus.name = parseStringValue(busData.nume || busData.name || busData.description);
  }
  
  // Bus type
  if (busData.tip || busData.type) {
    bus.bus_type = parseStringValue(busData.tip || busData.type);
  }
  
  return bus;
}

// ===============================
// Main Normalization Function
// ===============================

export function normalizeGetFreeSeats(response: RawFreeSeatResponse): NormalizedSeatsResponse {
  try {
    // Handle response structure variations
    let data = response;
    
    // If response has a root wrapper
    if (response.root && typeof response.root === 'object') {
      data = response.root as Record<string, unknown>;
    }
    
    // Check for errors
    if (data.error) {
      throw {
        code: 'api_error',
        message: parseStringValue(data.error),
        details: data.detal ? { details: data.detal } : undefined,
        retryable: false
      } as GetFreeSeatsError;
    }
    
    const result: NormalizedSeatsResponse = {
      interval_id: parseStringValue(data.interval_id),
      currency: parseStringValue(data.currency || data.moneda || 'EUR'),
      lang: parseStringValue(data.lang || data.limba || 'en'),
      vehicle_type: 'bus', // Default to bus
      trains: [],
      buses: [],
      all_seats: [],
      total_seats: 0,
      free_seats: 0,
      response_time: new Date().toISOString()
    };
    
    // Determine vehicle type and parse accordingly
    if (data.trenuri || data.trains) {
      result.vehicle_type = 'train';
      const trainsData = data.trenuri || data.trains;
      const trainsList = ensureArray(trainsData);
      
      result.trains = trainsList.map(trainData => {
        if (typeof trainData === 'object' && trainData !== null) {
          return normalizeTrain(trainData as Record<string, unknown>);
        }
        return normalizeTrain({ train_id: String(trainData), vagons: [] });
      });
      
      // Extract all seats from all trains
      result.trains.forEach(train => {
        train.vagons.forEach(vagon => {
          result.all_seats.push(...vagon.seats);
        });
      });
      
    } else if (data.autobuze || data.buses) {
      result.vehicle_type = 'bus';
      const busesData = data.autobuze || data.buses;
      const busesList = ensureArray(busesData);
      
      result.buses = busesList.map(busData => {
        if (typeof busData === 'object' && busData !== null) {
          return normalizeBus(busData as Record<string, unknown>);
        }
        return normalizeBus({ bus_id: String(busData), seats: [] });
      });
      
      // Extract all seats from all buses
      result.buses.forEach(bus => {
        result.all_seats.push(...bus.seats);
      });
      
    } else {
      // Direct seats array (single vehicle)
      const seatsData = data.locuri || data.seats || data.places;
      if (seatsData) {
        const seatsList = ensureArray(seatsData);
        result.all_seats = seatsList.map(seatData => {
          if (typeof seatData === 'object' && seatData !== null) {
            return normalizeSeat(seatData as Record<string, unknown>);
          }
          return normalizeSeat({ seat_number: String(seatData), is_free: true, price: 0 });
        });
        
        // Create a single bus entry
        result.buses = [{
          bus_id: parseStringValue(data.bus_id || data.vehicle_id || 'default'),
          bus_number: parseStringValue(data.bus_number || data.vehicle_number || 'Bus 1'),
          seats: result.all_seats,
          total_seats: result.all_seats.length,
          free_seats: result.all_seats.filter(seat => seat.is_free).length
        }];
      }
    }
    
    // Calculate totals
    result.total_seats = result.all_seats.length;
    result.free_seats = result.all_seats.filter(seat => seat.is_free).length;
    
    // Add metadata
    if (data.request_time || data.timestamp) {
      result.request_time = parseStringValue(data.request_time || data.timestamp);
    }
    
    return result;
    
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error; // Re-throw API errors
    }
    
    throw {
      code: 'parse_error',
      message: error instanceof Error ? error.message : 'Failed to normalize seats response',
      details: { error, response },
      retryable: false
    } as GetFreeSeatsError;
  }
}

// ===============================
// Utility Functions
// ===============================

export function flattenSeats(response: NormalizedSeatsResponse): FreeSeat[] {
  return response.all_seats;
}

export function getFreeSeatsOnly(response: NormalizedSeatsResponse): FreeSeat[] {
  return response.all_seats.filter(seat => seat.is_free);
}

export function groupSeatsByVagon(seats: FreeSeat[]): Map<string, FreeSeat[]> {
  const groups = new Map<string, FreeSeat[]>();
  
  seats.forEach(seat => {
    const vagonId = seat.vagon_id || 'default';
    if (!groups.has(vagonId)) {
      groups.set(vagonId, []);
    }
    groups.get(vagonId)!.push(seat);
  });
  
  return groups;
}

export function calculateSeatStatistics(seats: FreeSeat[]) {
  const total = seats.length;
  const free = seats.filter(seat => seat.is_free).length;
  const occupied = total - free;
  const occupancy_rate = total > 0 ? (occupied / total) * 100 : 0;
  
  const prices = seats.map(seat => seat.price).filter(price => price > 0);
  const min_price = prices.length > 0 ? Math.min(...prices) : 0;
  const max_price = prices.length > 0 ? Math.max(...prices) : 0;
  const avg_price = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
  
  return {
    total_seats: total,
    free_seats: free,
    occupied_seats: occupied,
    occupancy_rate: Math.round(occupancy_rate * 100) / 100,
    pricing: {
      min_price,
      max_price,
      avg_price: Math.round(avg_price * 100) / 100
    }
  };
}
