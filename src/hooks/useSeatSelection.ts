/**
 * SEAT SELECTION HOOK
 * 
 * Custom hook for managing seat selection state across multiple segments
 * Handles validation, pricing, and selection limits
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  TripSeatSelection, 
  SeatSelection, 
  SeatSelectionSummary,
  FreeSeatItem 
} from '@/types/tripDetail';
import { normalizeSeatNumber, getSeatPrice } from '@/lib/tripDetailApi';

interface UseSeatSelectionProps {
  passengers: number;
  segments: Array<{
    bustype_id: string;
    segmentName: string;
    freeSeats: FreeSeatItem[];
  }>;
  isReturnTrip?: boolean; // Pentru a distinge între dus și întors
}

interface UseSeatSelectionReturn {
  seatSelection: TripSeatSelection;
  selectedSeats: (bustype_id: string) => string[];
  canSelectSeat: (bustype_id: string, seatNumber: string) => boolean;
  selectSeat: (bustype_id: string, seatNumber: string) => void;
  deselectSeat: (bustype_id: string, seatNumber: string) => void;
  clearSelection: (bustype_id?: string) => void;
  getSelectionSummary: () => SeatSelectionSummary;
  isSelectionValid: boolean;
  totalPrice: number;
  currency: string;
}

export const useSeatSelection = ({
  passengers,
  segments,
  isReturnTrip = false,
}: UseSeatSelectionProps): UseSeatSelectionReturn => {
  const [seatSelection, setSeatSelection] = useState<TripSeatSelection>({});

  // Get selected seats for a specific segment
  const selectedSeats = useCallback((bustype_id: string): string[] => {
    return seatSelection[bustype_id]?.selectedSeats || [];
  }, [seatSelection]);

  // Check if a seat can be selected
  const canSelectSeat = useCallback((bustype_id: string, seatNumber: string): boolean => {
    const currentSelection = seatSelection[bustype_id];
    const currentSelected = currentSelection?.selectedSeats || [];
    
    // Check if already selected - can always deselect
    if (currentSelected.includes(seatNumber)) {
      return true; // Can deselect
    }
    
    // Check if seat is available
    const segment = segments.find(s => s.bustype_id === bustype_id);
    if (!segment) {
      return false;
    }
    
    const normalizedSeat = normalizeSeatNumber(seatNumber);
    const isAvailable = segment.freeSeats.some(
      seat => normalizeSeatNumber(seat.seat_number) === normalizedSeat && seat.seat_free === 1
    );
    
    if (!isAvailable) {
      return false;
    }
    
    // For round trips, each trip (outbound/return) needs exactly 'passengers' seats
    // So we can always select if we haven't reached the limit for this specific trip
    return currentSelected.length < passengers;
  }, [seatSelection, passengers, segments]);

  // Select a seat
  const selectSeat = useCallback((bustype_id: string, seatNumber: string) => {
    if (!canSelectSeat(bustype_id, seatNumber)) return;
    
    setSeatSelection(prev => {
      const currentSelection = prev[bustype_id] || {
        bustype_id,
        selectedSeats: [],
        maxSeats: passengers,
        totalPrice: 0,
        currency: 'EUR',
      };
      
      const currentSelected = currentSelection.selectedSeats;
      
      // If already selected, deselect it
      if (currentSelected.includes(seatNumber)) {
        return prev; // Will be handled by deselectSeat
      }
      
      // If we've reached the limit, replace the first selected seat
      let newSelectedSeats: string[];
      if (currentSelected.length >= passengers) {
        // Remove the first selected seat and add the new one
        newSelectedSeats = [seatNumber, ...currentSelected.slice(1)];
      } else {
        // Add to selection normally
        newSelectedSeats = [...currentSelected, seatNumber];
      }
      
      // Calculate price for this segment
      const segment = segments.find(s => s.bustype_id === bustype_id);
      const totalPrice = newSelectedSeats.reduce((total, seat) => {
        const price = segment ? getSeatPrice(seat, segment.freeSeats) : 0;
        console.log(`Seat ${seat} price:`, price, 'from segment:', segment?.bustype_id);
        return total + (price || 0);
      }, 0);
      
      console.log(`Total price for segment ${bustype_id}:`, totalPrice);
      
      return {
        ...prev,
        [bustype_id]: {
          ...currentSelection,
          selectedSeats: newSelectedSeats,
          totalPrice,
        },
      };
    });
  }, [canSelectSeat, passengers, segments]);

  // Deselect a seat
  const deselectSeat = useCallback((bustype_id: string, seatNumber: string) => {
    setSeatSelection(prev => {
      const currentSelection = prev[bustype_id];
      if (!currentSelection) return prev;
      
      const newSelectedSeats = currentSelection.selectedSeats.filter(
        seat => seat !== seatNumber
      );
      
      // Calculate new price
      const segment = segments.find(s => s.bustype_id === bustype_id);
      const totalPrice = newSelectedSeats.reduce((total, seat) => {
        const price = segment ? getSeatPrice(seat, segment.freeSeats) : 0;
        return total + (price || 0);
      }, 0);
      
      return {
        ...prev,
        [bustype_id]: {
          ...currentSelection,
          selectedSeats: newSelectedSeats,
          totalPrice,
        },
      };
    });
  }, [segments]);

  // Clear selection for a segment or all segments
  const clearSelection = useCallback((bustype_id?: string) => {
    if (bustype_id) {
      setSeatSelection(prev => {
        const newSelection = { ...prev };
        delete newSelection[bustype_id];
        return newSelection;
      });
    } else {
      setSeatSelection({});
    }
  }, []);

  // Get selection summary
  const getSelectionSummary = useCallback((): SeatSelectionSummary => {
    const segmentSummaries = Object.entries(seatSelection).map(([bustype_id, selection]) => {
      const segment = segments.find(s => s.bustype_id === bustype_id);
      return {
        bustype_id,
        segmentName: segment?.segmentName || `Segment ${bustype_id}`,
        selectedSeats: selection.selectedSeats,
        price: selection.totalPrice,
      };
    });
    
    const totalSeats = segmentSummaries.reduce((total, seg) => total + seg.selectedSeats.length, 0);
    const totalPrice = segmentSummaries.reduce((total, seg) => total + seg.price, 0);
    
    return {
      totalSeats,
      totalPrice,
      currency: 'EUR', // Default currency
      segments: segmentSummaries,
    };
  }, [seatSelection, segments]);

  // Check if selection is valid
  const isSelectionValid = useMemo(() => {
    const summary = getSelectionSummary();
    return summary.totalSeats === passengers;
  }, [getSelectionSummary, passengers]);

  // Calculate total price
  const { totalPrice, currency } = useMemo(() => {
    const summary = getSelectionSummary();
    return {
      totalPrice: summary.totalPrice,
      currency: summary.currency,
    };
  }, [getSelectionSummary]);

  return {
    seatSelection,
    selectedSeats,
    canSelectSeat,
    selectSeat,
    deselectSeat,
    clearSelection,
    getSelectionSummary,
    isSelectionValid,
    totalPrice,
    currency,
  };
};
