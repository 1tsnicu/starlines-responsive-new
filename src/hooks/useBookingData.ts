/**
 * BOOKING DATA HOOK
 * 
 * Custom hook for managing booking data and passenger information
 * Handles form validation and data preparation for booking API
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  PassengerData, 
  BookingRequest, 
  BookingSummary,
  DiscountSelection,
  BaggageSelection
} from '@/types/tripDetail';

export interface UseBookingDataProps {
  passengers: number;
  isRoundTrip: boolean;
  outboundIntervalId?: string;
  returnIntervalId?: string;
  outboundDate?: string;
  returnDate?: string;
  outboundSelectedSeats: string[];
  returnSelectedSeats: string[];
  outboundDiscounts: Record<string, DiscountSelection>;
  returnDiscounts: Record<string, DiscountSelection>;
  outboundBaggage: Record<string, BaggageSelection>;
  returnBaggage: Record<string, BaggageSelection>;
  outboundTotalPrice: number;
  returnTotalPrice: number;
  currency: string;
  route?: any; // Route information for field requirements
}

export interface UseBookingDataReturn {
  // State
  passengerData: PassengerData[];
  contactInfo: {
    phone: string;
    email: string;
  };
  promocode: string;
  
  // Actions
  updatePassengerData: (index: number, data: Partial<PassengerData>) => void;
  updateContactInfo: (data: Partial<{ phone: string; email: string }>) => void;
  setPromocode: (code: string) => void;
  resetBookingData: () => void;
  
  // Computed values
  isBookingDataValid: boolean;
  isBookingReady: boolean;
  validationErrors: string[];
  bookingSummary: BookingSummary;
  preparedBookingRequest: BookingRequest | null;
  route?: any; // Route information for field requirements
}

export function useBookingData({
  passengers,
  isRoundTrip,
  outboundIntervalId,
  returnIntervalId,
  outboundDate,
  returnDate,
  outboundSelectedSeats,
  returnSelectedSeats,
  outboundDiscounts,
  returnDiscounts,
  outboundBaggage,
  returnBaggage,
  outboundTotalPrice,
  returnTotalPrice,
  currency,
  route
}: UseBookingDataProps): UseBookingDataReturn {
  const [passengerData, setPassengerData] = useState<PassengerData[]>(() => 
    Array.from({ length: passengers }, () => ({
      name: '',
      surname: '',
      birth_date: '',
      phone: '',
      email: ''
    }))
  );

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: ''
  });

  const [promocode, setPromocode] = useState('');

  const updatePassengerData = useCallback((index: number, data: Partial<PassengerData>) => {
    setPassengerData(prev => prev.map((passenger, i) => 
      i === index ? { ...passenger, ...data } : passenger
    ));
  }, []);

  const updateContactInfo = useCallback((data: Partial<{ phone: string; email: string }>) => {
    setContactInfo(prev => ({ ...prev, ...data }));
  }, []);

  const resetBookingData = useCallback(() => {
    setPassengerData(Array.from({ length: passengers }, () => ({
      name: '',
      surname: '',
      birth_date: '',
      phone: '',
      email: ''
    })));
    setContactInfo({ phone: '', email: '' });
    setPromocode('');
  }, [passengers]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Validate passenger data
    passengerData.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        errors.push(`Passenger ${index + 1}: Name is required`);
      }
      if (!passenger.surname.trim()) {
        errors.push(`Passenger ${index + 1}: Surname is required`);
      }
      if (!passenger.birth_date) {
        errors.push(`Passenger ${index + 1}: Birth date is required`);
      } else {
        const birthDate = new Date(passenger.birth_date);
        const today = new Date();
        if (birthDate >= today) {
          errors.push(`Passenger ${index + 1}: Birth date must be in the past`);
        }
      }
    });

    // Validate contact info
    if (!contactInfo.phone.trim()) {
      errors.push('Phone number is required');
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(contactInfo.phone)) {
      errors.push('Invalid phone format');
    }

    if (!contactInfo.email.trim()) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.push('Invalid email format');
    }

    // Validate seat selection
    if (outboundSelectedSeats.length === 0) {
      errors.push('Outbound seat selection is required');
    }

    if (isRoundTrip && returnSelectedSeats.length === 0) {
      errors.push('Return seat selection is required');
    }

    return errors;
  }, [passengerData, contactInfo, outboundSelectedSeats, returnSelectedSeats, isRoundTrip]);

  const isBookingDataValid = useMemo(() => {
    return validationErrors.length === 0;
  }, [validationErrors]);

  // Separate validation for booking readiness (without passenger data)
  const isBookingReady = useMemo(() => {
    return outboundIntervalId && outboundDate && outboundSelectedSeats.length > 0 && 
           (!isRoundTrip || (returnIntervalId && returnDate && returnSelectedSeats.length > 0));
  }, [outboundIntervalId, outboundDate, outboundSelectedSeats, isRoundTrip, returnIntervalId, returnDate, returnSelectedSeats]);

  const bookingSummary = useMemo((): BookingSummary => {
    const outboundDiscountAmount = Object.values(outboundDiscounts).reduce((total, discount) => {
      return total + (discount.discount_price * discount.passengers);
    }, 0);

    const returnDiscountAmount = Object.values(returnDiscounts).reduce((total, discount) => {
      return total + (discount.discount_price * discount.passengers);
    }, 0);

    const outboundBaggageAmount = Object.values(outboundBaggage).reduce((total, baggage) => {
      return total + (baggage.price * baggage.quantity);
    }, 0);

    const returnBaggageAmount = Object.values(returnBaggage).reduce((total, baggage) => {
      return total + (baggage.price * baggage.quantity);
    }, 0);

    const totalDiscountAmount = outboundDiscountAmount + returnDiscountAmount;
    const totalBaggageAmount = outboundBaggageAmount + returnBaggageAmount;
    
    // Calculate total price including base prices, discounts, and baggage
    const baseTotalPrice = outboundTotalPrice + returnTotalPrice;
    const finalTotalPrice = baseTotalPrice - totalDiscountAmount + totalBaggageAmount;
    
    console.log('Booking price calculation:', {
      outboundTotalPrice,
      returnTotalPrice,
      baseTotalPrice,
      totalDiscountAmount,
      totalBaggageAmount,
      finalTotalPrice
    });

    return {
      totalPrice: Math.max(0, finalTotalPrice), // Ensure non-negative price
      currency,
      passengers,
      trips: isRoundTrip ? 2 : 1,
      selectedSeats: [outboundSelectedSeats, returnSelectedSeats],
      selectedDiscounts: [
        Object.fromEntries(Object.entries(outboundDiscounts).map(([key, discount]) => [key, discount.discount_id])),
        Object.fromEntries(Object.entries(returnDiscounts).map(([key, discount]) => [key, discount.discount_id]))
      ],
      selectedBaggage: {
        '0': Object.values(outboundBaggage).flatMap(baggage => 
          Array(baggage.quantity).fill(baggage.baggage_id)
        ),
        '1': Object.values(returnBaggage).flatMap(baggage => 
          Array(baggage.quantity).fill(baggage.baggage_id)
        )
      },
      promocode: promocode ? { name: promocode, discount: 0 } : undefined
    };
  }, [
    isBookingReady,
    passengers,
    isRoundTrip,
    currency,
    outboundSelectedSeats,
    returnSelectedSeats,
    outboundDiscounts,
    returnDiscounts,
    outboundBaggage,
    returnBaggage,
    outboundTotalPrice,
    returnTotalPrice,
    promocode
  ]);

  const preparedBookingRequest = useMemo((): BookingRequest | null => {
    console.log('Booking data validation:', {
      isBookingReady,
      isBookingDataValid,
      outboundIntervalId,
      outboundDate,
      returnIntervalId,
      returnDate,
      isRoundTrip
    });
    
    if (!isBookingReady) {
      console.log('Booking request not ready:', {
        isBookingReady,
        outboundIntervalId,
        outboundDate,
        outboundSelectedSeats: outboundSelectedSeats.length,
        returnSelectedSeats: returnSelectedSeats.length
      });
      return null;
    }

    const request: BookingRequest = {
      // login and password will be handled by server
      v: '1.1', // API version
      date: [outboundDate],
      interval_id: [outboundIntervalId],
      seat: [outboundSelectedSeats],
      name: [], // Will be filled in BookingForm
      surname: [], // Will be filled in BookingForm
      birth_date: [], // Will be filled in BookingForm
      phone: '', // Will be filled in BookingForm
      email: '', // Will be filled in BookingForm
      currency,
      lang: 'ru'
    };

    console.log('Prepared booking request structure:', {
      outboundSelectedSeats,
      returnSelectedSeats,
      seat: request.seat,
      date: request.date,
      interval_id: request.interval_id
    });

    // Add return trip data if applicable
    if (isRoundTrip && returnIntervalId && returnDate) {
      request.date.push(returnDate);
      request.interval_id.push(returnIntervalId);
      request.seat.push(returnSelectedSeats);
    }

    // Add discount data if available (conform API documentation)
    const outboundDiscountIds = Object.values(outboundDiscounts).map(discount => parseInt(discount.discount_id));
    const returnDiscountIds = Object.values(returnDiscounts).map(discount => parseInt(discount.discount_id));
    
    if (outboundDiscountIds.length > 0 || returnDiscountIds.length > 0) {
      request.discount_id = [outboundDiscountIds, returnDiscountIds];
    }

    // Add baggage data if available (conform API documentation)
    const outboundBaggageIds = Object.values(outboundBaggage).flatMap(baggage => 
      Array(baggage.quantity).fill(baggage.baggage_id)
    );
    const returnBaggageIds = Object.values(returnBaggage).flatMap(baggage => 
      Array(baggage.quantity).fill(baggage.baggage_id)
    );

    if (outboundBaggageIds.length > 0 || returnBaggageIds.length > 0) {
      request.baggage = [outboundBaggageIds, returnBaggageIds];
    }

    // Note: Promocode handling would need to be implemented separately
    // as it's not in the standard new_order API documentation

    return request;
  }, [
    isBookingDataValid,
    outboundIntervalId,
    returnIntervalId,
    outboundDate,
    returnDate,
    outboundSelectedSeats,
    returnSelectedSeats,
    passengerData,
    contactInfo,
    currency,
    isRoundTrip,
    outboundDiscounts,
    returnDiscounts,
    outboundBaggage,
    returnBaggage,
    promocode
  ]);

  return {
    passengerData,
    contactInfo,
    promocode,
    updatePassengerData,
    updateContactInfo,
    setPromocode,
    resetBookingData,
    isBookingDataValid,
    isBookingReady,
    validationErrors,
    bookingSummary,
    preparedBookingRequest,
    route
  };
}
