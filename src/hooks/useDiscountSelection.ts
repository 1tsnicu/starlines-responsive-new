/**
 * DISCOUNT SELECTION HOOK
 * 
 * Custom hook for managing discount selection state
 * Handles both outbound and return journey discounts
 */

import { useState, useCallback, useMemo } from 'react';
import { Discount, DiscountSelection } from '@/types/tripDetail';

export interface UseDiscountSelectionProps {
  passengers: number;
  basePrice: number;
  currency: string;
  isReturnTrip?: boolean;
}

export interface UseDiscountSelectionReturn {
  // State
  selectedDiscounts: Record<string, DiscountSelection>;
  
  // Actions
  selectDiscount: (discount: Discount, bustypeId: string) => void;
  deselectDiscount: (bustypeId: string) => void;
  clearAllDiscounts: () => void;
  
  // Computed values
  totalDiscountAmount: number;
  finalPrice: number;
  hasSelectedDiscounts: boolean;
  getDiscountForSegment: (bustypeId: string) => DiscountSelection | null;
}

export function useDiscountSelection({
  passengers,
  basePrice,
  currency,
  isReturnTrip = false
}: UseDiscountSelectionProps): UseDiscountSelectionReturn {
  const [selectedDiscounts, setSelectedDiscounts] = useState<Record<string, DiscountSelection>>({});

  const selectDiscount = useCallback((discount: Discount, bustypeId: string) => {
    const discountSelection: DiscountSelection = {
      discount_id: discount.discount_id,
      discount_name: discount.discount_name,
      discount_price: discount.discount_price,
      discount_currency: discount.discount_currency || currency,
      passengers: passengers
    };

    setSelectedDiscounts(prev => ({
      ...prev,
      [bustypeId]: discountSelection
    }));
  }, [passengers, currency]);

  const deselectDiscount = useCallback((bustypeId: string) => {
    setSelectedDiscounts(prev => {
      const newState = { ...prev };
      delete newState[bustypeId];
      return newState;
    });
  }, []);

  const clearAllDiscounts = useCallback(() => {
    setSelectedDiscounts({});
  }, []);

  const getDiscountForSegment = useCallback((bustypeId: string): DiscountSelection | null => {
    return selectedDiscounts[bustypeId] || null;
  }, [selectedDiscounts]);

  const totalDiscountAmount = useMemo(() => {
    return Object.values(selectedDiscounts).reduce((total, discount) => {
      const discountPerPassenger = discount.discount_price;
      const maxDiscount = discount.discount_price_max || discountPerPassenger;
      const segmentDiscount = Math.min(discountPerPassenger, maxDiscount) * discount.passengers;
      return total + segmentDiscount;
    }, 0);
  }, [selectedDiscounts]);

  const finalPrice = useMemo(() => {
    const totalBasePrice = basePrice * passengers;
    return Math.max(0, totalBasePrice - totalDiscountAmount);
  }, [basePrice, passengers, totalDiscountAmount]);

  const hasSelectedDiscounts = useMemo(() => {
    return Object.keys(selectedDiscounts).length > 0;
  }, [selectedDiscounts]);

  return {
    selectedDiscounts,
    selectDiscount,
    deselectDiscount,
    clearAllDiscounts,
    totalDiscountAmount,
    finalPrice,
    hasSelectedDiscounts,
    getDiscountForSegment
  };
}
