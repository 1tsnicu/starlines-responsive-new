// src/types/plan.ts - Types for seat plan visualization

export interface SeatRow {
  seat: Array<string>; // "" or seat number as string
}

export interface Floor {
  number: number; // 1, 2 (if multiple floors exist)
  rows: { row: SeatRow[] };
}

export interface SeatPlan {
  plan_type: string; // "105" | "217" etc.
  floors: Floor[];
  error?: string; // API error if any
}

export interface GetPlanResponse extends SeatPlan {
  [key: string]: unknown; // Index signature for compatibility
}
