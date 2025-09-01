// src/types/baggage.ts - Type definitions for baggage management system

export interface BaggageItem {
  baggage_id: string;              // identificatorul pe care îl vei trimite la new_order
  baggage_type_id: string;         // 1=small,2=medium,3=large etc.
  baggage_type: string;            // "small_baggage" | "medium_baggage" | "large_baggage" ...
  baggage_type_abbreviated: string;// ex. "БАГАЖ М/М"
  baggage_title: string;           // ex. "Маломерный багаж"
  length?: string;                 // cm
  width?: string;
  height?: string;
  kg?: string;
  max_in_bus?: string;             // limita totală în autobuz
  max_per_person?: string;         // limita per pasager
  typ?: "route" | string;          // tip de regulă (roută etc.)
  price: number;                   // preț pe unitate (0 = gratuit)
  currency: string;                // "EUR"
}

export type GetBaggageResponse = BaggageItem[];

// For passenger-level baggage selection
export interface PassengerBaggage {
  passengerIndex: number;
  baggage_id: string;
  baggage_title: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
  currency: string;
}

// For new_order payload (structure to be confirmed)
export interface BaggageOrderItem {
  baggage_id: string;
  qty: number;
}
