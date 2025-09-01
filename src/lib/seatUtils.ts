// src/lib/seatUtils.ts - Utilities for seat management and selection

import type { FreeSeatItem, SeatSelection, PassengerSeatAssignment } from '../types/seats';
import type { RouteSummary } from './bussystem';

/**
 * Extrage locurile libere din lista de locuri
 */
export function getAvailableSeats(seats: FreeSeatItem[]): FreeSeatItem[] {
  return seats.filter(seat => seat.seat_free === 1);
}

/**
 * Selectează N locuri libere din lista disponibilă
 */
export function pickFreeSeats(
  seats: FreeSeatItem[],
  count: number
): (number | string)[] {
  const free = getAvailableSeats(seats);
  return free.slice(0, count).map(s => s.seat_number);
}

/**
 * Verifică dacă sunt disponibile suficiente locuri pentru numărul de pasageri
 */
export function hasEnoughSeats(seats: FreeSeatItem[], passengerCount: number): boolean {
  const availableCount = getAvailableSeats(seats).length;
  return availableCount >= passengerCount;
}

/**
 * Calculează prețul total pentru locurile selectate
 */
export function calculateSeatPrice(seats: FreeSeatItem[], selectedSeatNumbers: (string | number)[]): number {
  let total = 0;
  
  selectedSeatNumbers.forEach(seatNumber => {
    const seat = seats.find(s => s.seat_number.toString() === seatNumber.toString());
    if (seat && seat.seat_price) {
      total += seat.seat_price;
    }
  });
  
  return total;
}

/**
 * Verifică dacă o rută necesită apelul la get_free_seats
 */
export function shouldCallGetFreeSeats(route: RouteSummary): boolean {
  return route.request_get_free_seats === 1;
}

/**
 * Asignează locuri pentru mai mulți pasageri pe mai multe segmente
 * Asigură că fiecare pasager are loc pe fiecare segment
 */
export function assignSeatsToPassengers(
  tripSeats: Array<{ bustype_id: string; seats: FreeSeatItem[] }>,
  passengerCount: number
): PassengerSeatAssignment[] {
  const assignments: PassengerSeatAssignment[] = [];
  
  // Verifică că avem suficiente locuri pe fiecare segment
  for (const trip of tripSeats) {
    if (!hasEnoughSeats(trip.seats, passengerCount)) {
      throw new Error(`Nu sunt suficiente locuri pe segmentul ${trip.bustype_id}`);
    }
  }
  
  // Asignează locuri pentru fiecare pasager
  for (let passengerIndex = 0; passengerIndex < passengerCount; passengerIndex++) {
    const assignment: PassengerSeatAssignment = {
      passenger_index: passengerIndex,
      seats_by_segment: {},
      total_price: 0,
    };
    
    // Pentru fiecare segment, asignează un loc pentru acest pasager
    tripSeats.forEach(trip => {
      const availableSeats = getAvailableSeats(trip.seats);
      const selectedSeat = availableSeats[passengerIndex];
      
      if (selectedSeat) {
        assignment.seats_by_segment[trip.bustype_id] = selectedSeat.seat_number.toString();
        assignment.total_price += selectedSeat.seat_price || 0;
        
        // Marchează locul ca ocupat pentru următorii pasageri
        const seatIndex = trip.seats.findIndex(s => s.seat_number === selectedSeat.seat_number);
        if (seatIndex !== -1) {
          trip.seats[seatIndex].seat_free = 0;
        }
      }
    });
    
    assignments.push(assignment);
  }
  
  return assignments;
}

/**
 * Formatează prețul unui loc
 */
export function formatSeatPrice(price?: number, currency?: string): string {
  if (!price) return 'N/A';
  return `${price} ${currency || 'EUR'}`;
}

/**
 * Validează selecția de locuri pentru o călătorie dus-întors
 */
export function validateRoundTripSeats(
  outboundRoute: RouteSummary,
  returnRoute: RouteSummary,
  passengerCount: number
): {
  outbound: { useDirectSeats: boolean; hasEnoughSeats: boolean };
  return: { needsApiCall: boolean; hasEnoughSeats: boolean };
} {
  const outbound = {
    useDirectSeats: !shouldCallGetFreeSeats(outboundRoute),
    hasEnoughSeats: false,
  };
  
  const returnInfo = {
    needsApiCall: shouldCallGetFreeSeats(returnRoute),
    hasEnoughSeats: false,
  };
  
  // Verifică locurile disponibile pentru dus
  if (outbound.useDirectSeats && outboundRoute.free_seats) {
    outbound.hasEnoughSeats = outboundRoute.free_seats.length >= passengerCount;
  }
  
  // Pentru retur, nu putem verifica fără să facem API call
  // Aceasta va fi verificată după apelul la getFreeSeats
  
  return { outbound, return: returnInfo };
}

/**
 * Creează payload pentru new_order cu locurile selectate
 */
export function createOrderPayload(
  route: RouteSummary,
  passengers: Array<{
    first_name: string;
    last_name: string;
    phone?: string;
    document_type?: string;
    document_number?: string;
    birth_date?: string;
    gender?: string;
  }>,
  seatAssignments: PassengerSeatAssignment[]
) {
  // Pentru ruteri simple (fără segmente multiple)
  if (seatAssignments.length > 0 && Object.keys(seatAssignments[0].seats_by_segment).length === 1) {
    return passengers.map((passenger, index) => {
      const assignment = seatAssignments[index];
      const seatNumber = Object.values(assignment.seats_by_segment)[0];
      
      return {
        ...passenger,
        seat_no: seatNumber,
      };
    });
  }
  
  // Pentru rute cu segmente multiple - payload extins
  return passengers.map((passenger, index) => {
    const assignment = seatAssignments[index];
    
    return {
      ...passenger,
      seats_by_segment: assignment.seats_by_segment,
      total_seat_price: assignment.total_price,
    };
  });
}
