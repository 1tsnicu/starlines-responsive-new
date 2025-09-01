// src/types/seats.ts - Types for seat management and selection

export interface FreeSeatItem {
  seat_number: number | string;
  seat_free: 0 | 1;           // 1 = liber, 0 = ocupat
  seat_price?: number;        // preț specific pentru acest loc
  seat_curency?: string;      // atenție la typo din API: "curency"
  seat_currency?: string;     // poate fi corect în unele cazuri
}

export interface FreeSeatsTrip {
  bustype_id: string;         // tip autobuz pe segment
  has_plan: 0 | 1;           // 1 = există schema grafică de locuri
  free_seat: FreeSeatItem[];  // lista locurilor cu status
  trip_name?: string;         // numele segmentului (ex: "Киев → Львов")
  segment_index?: number;     // index pentru segmente multiple
}

export interface GetFreeSeatsResponse {
  trips: FreeSeatsTrip[];     // array de segmente (poate fi 1 sau mai multe)
  error?: string;             // eroare din API
  free_seats?: number;        // compatibilitate cu Record<string, unknown>
  total_seats?: number;       // compatibilitate cu Record<string, unknown>
  [key: string]: unknown;    // index signature pentru compatibilitate TypeScript
}

// Pentru UI și selecție locuri
export interface SeatSelection {
  seat_number: string;
  segment_index: number;
  bustype_id: string;
  price?: number;
  currency?: string;
}

export interface PassengerSeatAssignment {
  passenger_index: number;
  seats_by_segment: Record<string, string>; // bustype_id -> seat_number
  total_price?: number;
}
