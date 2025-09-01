// src/lib/planUtils.ts - Utilities for combining seat plans with availability data

import type { SeatPlan } from "@/types/plan";
import type { FreeSeatItem } from "@/types/seats";

export type AnnotatedSeat = {
  value: string;         // "" or seat number as string
  isAisle: boolean;      // true if ""
  free?: boolean;        // true/false if it's a seat
  price?: number;        // if in free_seat
  currency?: string;     // "EUR"
};

export type AnnotatedFloor = {
  number: number;
  rows: AnnotatedSeat[][];
};

/**
 * Combines seat plan structure with availability data
 * @param plan - Seat plan from get_plan API
 * @param freeSeatList - Free seat list for specific bustype_id
 * @returns Annotated floors with availability and pricing info
 */
export function buildAnnotatedPlan(
  plan: SeatPlan,
  freeSeatList: FreeSeatItem[] // list for that bustype_id
): AnnotatedFloor[] {
  const map = new Map<string, FreeSeatItem>();
  for (const s of freeSeatList) {
    const key = String(s.seat_number);
    map.set(key, s);
  }

  return plan.floors.map((floor) => {
    const rows: AnnotatedSeat[][] = floor.rows.row.map((r) =>
      r.seat.map((val) => {
        if (!val) return { value: "", isAisle: true } as AnnotatedSeat;
        const key = String(val);
        const fs = map.get(key);
        return {
          value: key,
          isAisle: false,
          free: fs ? fs.seat_free === 1 : undefined, // if API doesn't give entry, leave undefined
          price: fs?.seat_price,
          currency: fs?.seat_curency, // Note: API has typo "curency"
        };
      })
    );
    return { number: floor.number, rows };
  });
}

/**
 * Extract selected seat numbers from UI selection format
 * @param selected - Set of "floor-seatNumber" strings
 * @returns Array of seat numbers only
 */
export function extractSeatNumbers(selected: Set<string>): string[] {
  return Array.from(selected).map((s) => s.split("-")[1]);
}

/**
 * Validate that all passengers have seats selected for all segments
 * @param segmentSelections - Array of selections per segment
 * @param passengerCount - Number of passengers
 * @returns true if valid, false otherwise
 */
export function validateMultiSegmentSelection(
  segmentSelections: Set<string>[],
  passengerCount: number
): boolean {
  return segmentSelections.every(selection => selection.size === passengerCount);
}
