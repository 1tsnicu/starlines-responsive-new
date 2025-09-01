// hooks/use-return-journey.ts - Hook pentru gestionarea călătoriilor dus-întors

import { useState, useCallback } from 'react';
import { 
  getRoutes, 
  getRoutesReturn, 
  createOutboundSelection, 
  validateReturnDate,
  getMinReturnDate,
  type RouteSummary 
} from '../lib/bussystem';
import type { OutboundSelection, ReturnSearchParams, TripBooking } from '../types/return';

interface UseReturnJourneyReturn {
  // State
  tripBooking: TripBooking;
  outboundRoutes: RouteSummary[];
  returnRoutes: RouteSummary[];
  isSearchingOutbound: boolean;
  isSearchingReturn: boolean;
  error: string | null;
  
  // Actions
  searchOutbound: (params: {
    id_from: string;
    id_to: string;
    date: string;
    station_id_from?: string;
    station_id_to?: string;
    trans?: "bus" | "train";
    currency?: string;
    lang?: string;
  }) => Promise<void>;
  
  selectOutbound: (route: RouteSummary, searchParams: {
    id_from: string;
    id_to: string;
    station_id_from?: string;
    station_id_to?: string;
    date: string;
  }) => void;
  
  searchReturn: (returnDate: string) => Promise<void>;
  selectReturn: (route: RouteSummary) => void;
  
  clearSelection: () => void;
  toggleRoundTrip: () => void;
  
  // Helpers
  getMinReturnDate: () => string | null;
  isReturnDateValid: (date: string) => boolean;
}

export function useReturnJourney(): UseReturnJourneyReturn {
  const [tripBooking, setTripBooking] = useState<TripBooking>({
    outbound: undefined,
    return: undefined,
    isRoundTrip: false,
  });
  
  const [outboundRoutes, setOutboundRoutes] = useState<RouteSummary[]>([]);
  const [returnRoutes, setReturnRoutes] = useState<RouteSummary[]>([]);
  const [isSearchingOutbound, setIsSearchingOutbound] = useState(false);
  const [isSearchingReturn, setIsSearchingReturn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOutbound = useCallback(async (params: {
    id_from: string;
    id_to: string;
    date: string;
    station_id_from?: string;
    station_id_to?: string;
    trans?: "bus" | "train";
    currency?: string;
    lang?: string;
  }) => {
    setIsSearchingOutbound(true);
    setError(null);
    
    try {
      const routes = await getRoutes({
        ...params,
        trans: params.trans || "bus",
        change: "auto",
        currency: params.currency || "EUR",
        lang: params.lang || "ru",
        v: "1.1",
      });
      
      setOutboundRoutes(routes);
      
      // Resetează ruta de retur dacă există
      if (tripBooking.return) {
        setTripBooking(prev => ({ ...prev, return: undefined }));
        setReturnRoutes([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la căutarea rutelor dus');
      setOutboundRoutes([]);
    } finally {
      setIsSearchingOutbound(false);
    }
  }, [tripBooking.return]);

  const selectOutbound = useCallback((route: RouteSummary, searchParams: {
    id_from: string;
    id_to: string;
    station_id_from?: string;
    station_id_to?: string;
    date: string;
  }) => {
    const outboundSelection = createOutboundSelection(route, searchParams);
    
    setTripBooking(prev => ({
      ...prev,
      outbound: outboundSelection,
      return: undefined, // resetează selecția de retur
    }));
    
    // Resetează rutele de retur
    setReturnRoutes([]);
    setError(null);
  }, []);

  const searchReturn = useCallback(async (returnDate: string) => {
    if (!tripBooking.outbound) {
      setError('Selectați mai întâi ruta dus');
      return;
    }

    // Validează data de retur
    if (!validateReturnDate(tripBooking.outbound.date_arrival_go, returnDate)) {
      setError(`Data retur nu poate fi mai devreme decât ${tripBooking.outbound.date_arrival_go}`);
      return;
    }

    setIsSearchingReturn(true);
    setError(null);
    
    try {
      const returnParams: ReturnSearchParams = {
        outbound: tripBooking.outbound,
        date_return: returnDate,
        trans: "bus",
        currency: "EUR",
        lang: "ru",
        v: "1.1",
      };
      
      const routes = await getRoutesReturn(returnParams);
      setReturnRoutes(routes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la căutarea rutelor retur');
      setReturnRoutes([]);
    } finally {
      setIsSearchingReturn(false);
    }
  }, [tripBooking.outbound]);

  const selectReturn = useCallback((route: RouteSummary) => {
    setTripBooking(prev => ({
      ...prev,
      return: route,
    }));
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setTripBooking({
      outbound: undefined,
      return: undefined,
      isRoundTrip: false,
    });
    setOutboundRoutes([]);
    setReturnRoutes([]);
    setError(null);
  }, []);

  const toggleRoundTrip = useCallback(() => {
    setTripBooking(prev => {
      const newIsRoundTrip = !prev.isRoundTrip;
      
      // Dacă se dezactivează dus-întors, șterge selecția de retur
      if (!newIsRoundTrip) {
        setReturnRoutes([]);
        return {
          ...prev,
          isRoundTrip: newIsRoundTrip,
          return: undefined,
        };
      }
      
      return {
        ...prev,
        isRoundTrip: newIsRoundTrip,
      };
    });
  }, []);

  const getMinReturnDateHelper = useCallback((): string | null => {
    if (!tripBooking.outbound) return null;
    return getMinReturnDate(tripBooking.outbound.date_arrival_go);
  }, [tripBooking.outbound]);

  const isReturnDateValid = useCallback((date: string): boolean => {
    if (!tripBooking.outbound) return false;
    return validateReturnDate(tripBooking.outbound.date_arrival_go, date);
  }, [tripBooking.outbound]);

  return {
    // State
    tripBooking,
    outboundRoutes,
    returnRoutes,
    isSearchingOutbound,
    isSearchingReturn,
    error,
    
    // Actions
    searchOutbound,
    selectOutbound,
    searchReturn,
    selectReturn,
    clearSelection,
    toggleRoundTrip,
    
    // Helpers
    getMinReturnDate: getMinReturnDateHelper,
    isReturnDateValid,
  };
}
