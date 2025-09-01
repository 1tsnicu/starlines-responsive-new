// src/lib/newOrderBuilder.ts - Helper for building new_order payload

import type { NewOrderPayload, Passenger, TripMeta } from "@/types/newOrder";

export interface BuildNewOrderArgs {
  login: string;
  password: string;
  passengers: Passenger[];
  trips: TripMeta[]; // [dus, retur]
  phone?: string;
  email?: string;
  promocode?: string;
  currency?: string;
  lang?: string;
}

export function buildNewOrderPayload(args: BuildNewOrderArgs): NewOrderPayload {
  const { 
    login, 
    password, 
    passengers, 
    trips, 
    phone, 
    email, 
    promocode, 
    currency = "EUR", 
    lang = "ru" 
  } = args;

  // Validări de bază
  if (!trips.length) {
    throw new Error("Lipsesc trips din rezervare.");
  }
  
  if (!passengers.length) {
    throw new Error("Lipsesc pasagerii din rezervare.");
  }

  const pcount = passengers.length;

  // Construire arrays paralele pentru trips
  const date = trips.map(t => t.date);
  const interval_id = trips.map(t => t.interval_id);
  
  // Validare și construire seat array
  const seat = trips.map((t, tripIndex) => {
    if (t.seatsPerPassenger.length !== pcount) {
      throw new Error(
        `Trip ${tripIndex}: Numărul de locuri selectate (${t.seatsPerPassenger.length}) ` +
        `nu corespunde numărului de pasageri (${pcount}).`
      );
    }
    
    // Validare segmente pentru trip-uri cu multiple segmente
    if (t.segments && t.segments > 1) {
      t.seatsPerPassenger.forEach((seatStr, passengerIndex) => {
        const segments = seatStr.split(',');
        if (segments.length !== t.segments) {
          throw new Error(
            `Trip ${tripIndex}, Pasager ${passengerIndex + 1}: ` +
            `Numărul de segmente în seat string (${segments.length}) ` +
            `nu corespunde cu numărul de segmente așteptat (${t.segments}).`
          );
        }
      });
    }
    
    return t.seatsPerPassenger;
  });

  // Construire discount_id (array pe trips)
  const discount_id = trips.map((t) => {
    if (!t.discounts) return {};
    
    const discountMap: Record<string, string> = {};
    for (const [passengerIdx, discountId] of Object.entries(t.discounts)) {
      // Convertește index-ul pasagerului în string (zero-based)
      discountMap[String(passengerIdx)] = String(discountId);
    }
    return discountMap;
  });

  // Construire baggage (dicționar pe trip index -> array per pasager)
  const baggage: Record<string, string[]> = {};
  trips.forEach((t, tripIdx) => {
    if (t.baggagePaidIdsPerPassenger?.length) {
      if (t.baggagePaidIdsPerPassenger.length !== pcount) {
        throw new Error(
          `Trip ${tripIdx}: Baggage per pasager (${t.baggagePaidIdsPerPassenger.length}) ` +
          `nu are aceeași dimensiune cu numărul de pasageri (${pcount}).`
        );
      }
      
      // Înlocuiește undefined cu "" pentru a păstra alinierea la index pasager
      const baggageForTrip = t.baggagePaidIdsPerPassenger.map(
        baggageIds => baggageIds ?? ""
      );
      
      // Adaugă doar dacă există bagaje plătite pentru acest trip
      if (baggageForTrip.some(ids => ids.length > 0)) {
        baggage[String(tripIdx)] = baggageForTrip;
      }
    }
  });

  // Verificare dacă sunt necesare date pasageri
  const needOrderData = trips.some(t => t.needOrderData);
  const needBirth = trips.some(t => t.needBirth);

  // Validare date obligatorii
  if (needOrderData) {
    if (passengers.some(p => !p.name || !p.surname)) {
      throw new Error("Name și surname sunt obligatorii pentru toți pasagerii.");
    }
    if (!phone) {
      throw new Error("Telefon este obligatoriu pentru această rezervare.");
    }
  }

  if (needBirth) {
    if (passengers.some(p => !p.birth_date)) {
      throw new Error("Data nașterii este obligatorie pentru toți pasagerii.");
    }
  }

  // Construire payload final
  const payload: NewOrderPayload = {
    login,
    password,
    ...(promocode ? { promocode_name: promocode } : {}),
    date,
    interval_id,
    seat,
    currency,
    lang,
  };

  // Adaugă date pasageri doar dacă sunt necesare
  if (needOrderData) {
    payload.name = passengers.map(p => p.name);
    payload.surname = passengers.map(p => p.surname);
    payload.phone = phone;
    
    if (email) {
      payload.email = email;
    }
  }

  if (needBirth) {
    payload.birth_date = passengers.map(p => p.birth_date || "");
  }

  // Adaugă discounts doar dacă există
  if (discount_id.some(m => Object.keys(m).length > 0)) {
    payload.discount_id = discount_id;
  }

  // Adaugă baggage doar dacă există
  if (Object.keys(baggage).length > 0) {
    payload.baggage = baggage;
  }

  return payload;
}

// Helper pentru validarea finală înainte de trimitere
export function validateNewOrderPayload(payload: NewOrderPayload): void {
  const { date, interval_id, seat } = payload;
  
  // Verificare lungimi egale
  if (date.length !== interval_id.length || date.length !== seat.length) {
    throw new Error(
      `Lungimile nu corespund: date(${date.length}), ` +
      `interval_id(${interval_id.length}), seat(${seat.length})`
    );
  }

  // Verificare că fiecare trip are același numărul de pasageri
  const passengerCount = seat[0]?.length || 0;
  seat.forEach((tripSeats, tripIndex) => {
    if (tripSeats.length !== passengerCount) {
      throw new Error(
        `Trip ${tripIndex}: Numărul de locuri (${tripSeats.length}) ` +
        `nu corespunde cu primul trip (${passengerCount}).`
      );
    }
  });

  // Verificare date
  if (payload.name && payload.name.length !== passengerCount) {
    throw new Error("Numărul de nume nu corespunde cu numărul de pasageri.");
  }
  
  if (payload.surname && payload.surname.length !== passengerCount) {
    throw new Error("Numărul de prenume nu corespunde cu numărul de pasageri.");
  }
  
  if (payload.birth_date && payload.birth_date.length !== passengerCount) {
    throw new Error("Numărul de date de naștere nu corespunde cu numărul de pasageri.");
  }

  // Verificare discount_id structure
  if (payload.discount_id) {
    if (payload.discount_id.length !== date.length) {
      throw new Error("Numărul de trip-uri pentru discounts nu corespunde.");
    }
  }

  // Verificare baggage structure
  if (payload.baggage) {
    for (const [tripIndex, baggageArray] of Object.entries(payload.baggage)) {
      const tripIdx = parseInt(tripIndex, 10);
      if (tripIdx >= date.length) {
        throw new Error(`Baggage trip index ${tripIdx} depășește numărul de trip-uri.`);
      }
      
      if (baggageArray.length !== passengerCount) {
        throw new Error(
          `Trip ${tripIdx}: Baggage array (${baggageArray.length}) ` +
          `nu corespunde cu numărul de pasageri (${passengerCount}).`
        );
      }
    }
  }
}

// Helper pentru formatarea locurilor în funcție de segmente
export function formatSeatForSegments(
  seatSelections: Array<{ segmentIndex: number; seatNumber: string }>,
  totalSegments: number
): string {
  // Creează array cu toate segmentele
  const seats = new Array(totalSegments).fill("");
  
  // Populează cu selecțiile
  seatSelections.forEach(({ segmentIndex, seatNumber }) => {
    if (segmentIndex >= 0 && segmentIndex < totalSegments) {
      seats[segmentIndex] = seatNumber;
    }
  });
  
  return seats.join(",");
}

// Helper pentru validarea și formatarea bagajelor plătite
export function formatBaggageIds(baggageSelections: Array<{ baggage_id: string; quantity: number }>): string {
  const baggageIds: string[] = [];
  
  baggageSelections.forEach(({ baggage_id, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      baggageIds.push(baggage_id);
    }
  });
  
  return baggageIds.join(",");
}
