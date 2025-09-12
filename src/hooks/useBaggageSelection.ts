/**
 * BAGGAGE SELECTION HOOK
 * 
 * Custom hook for managing baggage selection state
 * Handles both outbound and return journey baggage
 */

import { useState, useCallback, useMemo } from 'react';
import { BaggageItem, BaggageSelection } from '@/types/tripDetail';

export interface UseBaggageSelectionProps {
  passengers: number;
  isReturnTrip?: boolean;
}

export interface UseBaggageSelectionReturn {
  // State
  selectedBaggage: Record<string, BaggageSelection>;
  
  // Actions
  addBaggage: (baggage: BaggageItem, quantity: number) => void;
  removeBaggage: (baggageId: string) => void;
  updateBaggageQuantity: (baggageId: string, quantity: number) => void;
  clearAllBaggage: () => void;
  
  // Computed values
  totalBaggagePrice: number;
  totalBaggageItems: number;
  hasSelectedBaggage: boolean;
  getBaggageForPassenger: (passengerIndex: number) => BaggageSelection[];
  getTotalBaggageForType: (baggageType: string) => number;
}

export function useBaggageSelection({
  passengers,
  isReturnTrip = false
}: UseBaggageSelectionProps): UseBaggageSelectionReturn {
  const [selectedBaggage, setSelectedBaggage] = useState<Record<string, BaggageSelection>>({});

  const addBaggage = useCallback((baggage: BaggageItem, quantity: number) => {
    if (quantity <= 0) return;

    setSelectedBaggage(prev => {
      const existing = prev[baggage.baggage_id];
      const newQuantity = existing ? existing.quantity + quantity : quantity;
      
      return {
        ...prev,
        [baggage.baggage_id]: {
          baggage_id: baggage.baggage_id,
          baggage_title: baggage.baggage_title,
          baggage_type: baggage.baggage_type,
          price: baggage.price,
          currency: baggage.currency,
          quantity: newQuantity,
          passengers: passengers
        }
      };
    });
  }, [passengers]);

  const removeBaggage = useCallback((baggageId: string) => {
    setSelectedBaggage(prev => {
      const newState = { ...prev };
      delete newState[baggageId];
      return newState;
    });
  }, []);

  const updateBaggageQuantity = useCallback((baggageId: string, quantity: number) => {
    if (quantity <= 0) {
      removeBaggage(baggageId);
      return;
    }

    setSelectedBaggage(prev => {
      const existing = prev[baggageId];
      if (!existing) return prev;

      return {
        ...prev,
        [baggageId]: {
          ...existing,
          quantity: quantity
        }
      };
    });
  }, [removeBaggage]);

  const clearAllBaggage = useCallback(() => {
    setSelectedBaggage({});
  }, []);

  const getBaggageForPassenger = useCallback((passengerIndex: number): BaggageSelection[] => {
    // For now, all passengers share the same baggage selections
    // In the future, this could be extended to track baggage per passenger
    return Object.values(selectedBaggage);
  }, [selectedBaggage]);

  const getTotalBaggageForType = useCallback((baggageType: string): number => {
    return Object.values(selectedBaggage)
      .filter(baggage => baggage.baggage_type === baggageType)
      .reduce((total, baggage) => total + baggage.quantity, 0);
  }, [selectedBaggage]);

  const totalBaggagePrice = useMemo(() => {
    return Object.values(selectedBaggage).reduce((total, baggage) => {
      return total + (baggage.price * baggage.quantity);
    }, 0);
  }, [selectedBaggage]);

  const totalBaggageItems = useMemo(() => {
    return Object.values(selectedBaggage).reduce((total, baggage) => {
      return total + baggage.quantity;
    }, 0);
  }, [selectedBaggage]);

  const hasSelectedBaggage = useMemo(() => {
    return Object.keys(selectedBaggage).length > 0;
  }, [selectedBaggage]);

  return {
    selectedBaggage,
    addBaggage,
    removeBaggage,
    updateBaggageQuantity,
    clearAllBaggage,
    totalBaggagePrice,
    totalBaggageItems,
    hasSelectedBaggage,
    getBaggageForPassenger,
    getTotalBaggageForType
  };
}
