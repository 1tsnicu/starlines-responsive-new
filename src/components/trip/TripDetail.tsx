/**
 * TRIP DETAIL COMPONENT
 * 
 * Main component for trip detail page with seat selection
 * Supports both simple routes and multi-segment transfers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocalization } from '@/contexts/LocalizationContext';

// Components
import TripSummary from './TripSummary';
import SeatMap from './SeatMap';
import Legend from './Legend';
import TransferSegment from './TransferSegment';
import TripDetailErrorBoundary from './TripDetailErrorBoundary';
import { DiscountSelector } from './DiscountSelector';
import { BaggageSelector } from './BaggageSelector';
import { BookingForm } from './BookingForm';
import { BookingConfirmation } from './BookingConfirmation';

// Types and API
import { 
  TripDetailProps, 
  RouteItem, 
  SeatMapData, 
  TripDetailError,
  RouteSummary,
  ChangeLeg,
  PlanResponse,
  BusPlan,
  Currency,
  Discount,
  DiscountsResponse,
  DiscountSelection,
  BaggageItem,
  BaggageSelection,
  BookingResponse,
  BookingSummary
} from '@/types/tripDetail';
import { getSeatMapData, getMultiSeatMapData, apiGetAllRoutes, apiFreeSeats, apiPlan, apiGetDiscounts, apiGetBaggage } from '@/lib/tripDetailApi';
import { useSeatSelection } from '@/hooks/useSeatSelection';
import { useDiscountSelection } from '@/hooks/useDiscountSelection';
import { useBaggageSelection } from '@/hooks/useBaggageSelection';
import { useBookingData } from '@/hooks/useBookingData';
import { loadRouteFromBussystemAPI, loadTransferRouteFromBussystemAPI } from '@/lib/bussystemApi';
import { GetAllRoutesRequest } from '@/types/getAllRoutes';

// ===============================
// Utility Functions
// ===============================

// Convert PlanResponse to BusPlan format
const convertPlanResponseToBusPlan = (planResponse: PlanResponse, bustypeId: string): BusPlan => {
  return {
    planType: planResponse.plan_type,
    version: 2.0,
    busTypeId: bustypeId,
    orientation: 'h',
    floors: planResponse.floors.map(floor => ({
      number: floor.number,
      rows: floor.rows.row.map((row, rowIndex) => ({
        rowIndex,
        seats: row.seat.map(seatNumber => ({
          number: seatNumber || null,
          isEmpty: !seatNumber || seatNumber === '',
          isSelectable: !!seatNumber && seatNumber !== '',
        })),
      })),
    })),
  };
};

// ===============================
// Main Component
// ===============================

const TripDetailContent: React.FC<TripDetailProps> = (props) => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TripDetailError | null>(null);
  const [route, setRoute] = useState<RouteItem | null>(null);
  const [seatMaps, setSeatMaps] = useState<Record<string, SeatMapData>>({});
  const [passengers, setPassengers] = useState(1);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  
  // Round trip state
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [returnRoute, setReturnRoute] = useState<RouteItem | null>(null);
  const [returnSeatMaps, setReturnSeatMaps] = useState<Record<string, SeatMapData>>({});
  const [activeTrip, setActiveTrip] = useState<'outbound' | 'return'>('outbound');
  
  // Discount state
  const [outboundDiscounts, setOutboundDiscounts] = useState<Record<string, Discount[]>>({});
  const [returnDiscounts, setReturnDiscounts] = useState<Record<string, Discount[]>>({});
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  
  // Baggage state
  const [outboundBaggage, setOutboundBaggage] = useState<Record<string, BaggageItem[]>>({});
  const [returnBaggage, setReturnBaggage] = useState<Record<string, BaggageItem[]>>({});
  const [loadingBaggage, setLoadingBaggage] = useState(false);
  
  // Booking state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Încarcă datele rutei din API (doar dacă nu avem datele din navigation state)
  const loadRouteFromAPI = async (tripData: TripDetailProps): Promise<RouteItem> => {
    try {
      // Dacă routeData este deja furnizat în props, folosește-l direct
      if (props.routeData) {
        return props.routeData;
      }

      // Verifică dacă avem datele din navigation state
      const navigationState = location.state as any;
      if (navigationState?.routeData) {
        return navigationState.routeData;
      }

      // Determină dacă este o rută cu transfer pe baza change_route
      const hasTransfer = tripData.changeRoute && tripData.changeRoute.length > 0;
      
      if (hasTransfer) {
        // Încarcă ruta cu transfer
        return await loadTransferRouteFromBussystemAPI(tripData.intervalIdMain!);
      } else {
        // Încarcă ruta simplă
        return await loadRouteFromBussystemAPI(tripData.intervalIdMain!);
      }
    } catch (error) {
      console.error('Error loading route from API:', error);
      throw new Error('Eroare la încărcarea datelor rutei din API');
    }
  };

  // Încarcă informații detaliate despre rută din get_all_routes
  const loadDetailedRouteInfo = async (tripData: TripDetailProps): Promise<void> => {
    try {
      // Verifică dacă avem timetable_id pentru a obține informații detaliate
      if (!tripData.timetableId) {
        console.log('No timetable_id available for detailed route info');
        return;
      }

      const request: GetAllRoutesRequest = {
        login: 'your_login', // Va fi injectat de server
        password: 'your_password', // Va fi injectat de server
        timetable_id: tripData.timetableId,
        lang: tripData.searchContext?.lang || 'ru',
      };

      const detailedInfo = await apiGetAllRoutes(request);
      
      if (detailedInfo.item && detailedInfo.item.length > 0) {
        const routeDetails = detailedInfo.item[0];
        
        // Actualizează informațiile rutei cu datele detaliate
        setRoute(prevRoute => {
          if (!prevRoute) return prevRoute;
          
          return {
            ...prevRoute,
            // Actualizează cu informațiile detaliate
            route_name: routeDetails.route_name || prevRoute.route_name,
            carrier: routeDetails.carrier || prevRoute.carrier,
            comfort: routeDetails.comfort ? routeDetails.comfort : prevRoute.comfort,
            bustype: routeDetails.bustype || prevRoute.bustype,
            luggage: routeDetails.luggage || prevRoute.luggage,
            route_info: routeDetails.route_info || prevRoute.route_info,
            cancel_hours_info: routeDetails.cancel_hours_info || prevRoute.cancel_hours_info,
            // Adaugă informații noi despre stații
            stations: routeDetails.stations || [],
            discounts: routeDetails.discounts?.map(d => ({
              discount_id: d.discount_id,
              discount_name: d.discount_name,
              discount_price: 0, // Default value since it's not in get_all_routes
            })) || [],
            baggage: routeDetails.baggage || [],
          };
        });
      }
    } catch (error) {
      console.warn('Failed to load detailed route info:', error);
      // Nu aruncăm eroarea, doar logăm - informațiile de bază sunt suficiente
      // Eroarea 403 înseamnă că API-ul get_all_routes nu este disponibil sau nu avem acces
      // Continuăm cu datele de bază din get_routes
    }
  };

  // Încarcă seat maps din API conform documentației
  const loadSeatMaps = async (tripData: TripDetailProps, routeData: RouteItem, isReturnTrip = false) => {
    try {
      const seatMaps: Record<string, SeatMapData> = {};

      // Verifică dacă trebuie să obțină locuri din API
      if (tripData.requestGetFreeSeats === 1) {
        console.log('For return trip, using free_seats from routeData instead of apiFreeSeats');
        console.log('RouteData for return trip:', routeData);
        
        // Pentru întors, folosește free_seats din routeData (conform documentației API-ului)
        if (routeData.change_route && routeData.change_route.length > 0) {
          // Pentru rute cu transfer, folosește change_route
          for (let i = 0; i < routeData.change_route.length; i++) {
            const segment = routeData.change_route[i];
            const bustypeId = segment.bustype_id || `segment_${i}`;
            
            const seatMapData: SeatMapData = {
              bustype_id: bustypeId,
              hasPlan: segment.has_plan || 0,
              freeSeats: segment.free_seats?.map(seatNumber => {
                const price = segment.price_one_way ? parseFloat(segment.price_one_way) : undefined;
                console.log(`Segment ${segment.bustype_id} seat ${seatNumber} price:`, price, 'from price_one_way:', segment.price_one_way);
                return {
                  seat_number: seatNumber,
                  seat_free: 1,
                  seat_price: price,
                  seat_curency: (segment.currency || 'EUR') as Currency,
                };
              }) || [],
            };

            // Dacă has_plan = 1, obține și planul locurilor
            if (segment.has_plan === 1) {
              try {
                const planResponse = await apiPlan({
                  bustype_id: bustypeId,
                  position: 'h',
                  v: '2.0',
                });
                seatMapData.plan = convertPlanResponseToBusPlan(planResponse, bustypeId);
              } catch (planError) {
                console.warn(`Failed to load plan for bustype_id ${bustypeId}:`, planError);
              }
            }

            seatMaps[bustypeId] = seatMapData;
          }
        } else {
          // Pentru rute simple
          const seatMapData: SeatMapData = {
            bustype_id: routeData.bustype_id || 'default',
            hasPlan: routeData.has_plan || 0,
            freeSeats: routeData.free_seats?.map(seatNumber => {
              const price = routeData.price_one_way ? parseFloat(routeData.price_one_way) : undefined;
              console.log(`Route seat ${seatNumber} price:`, price, 'from price_one_way:', routeData.price_one_way);
              return {
                seat_number: seatNumber,
                seat_free: 1,
                seat_price: price,
                seat_curency: routeData.currency || 'EUR',
              };
            }) || [],
          };

          // Dacă has_plan = 1, obține și planul locurilor
          if (routeData.has_plan === 1) {
            try {
              const planResponse = await apiPlan({
                bustype_id: routeData.bustype_id || 'default',
                position: 'h',
                v: '2.0',
              });
              seatMapData.plan = convertPlanResponseToBusPlan(planResponse, routeData.bustype_id || 'default');
            } catch (planError) {
              console.warn('Failed to load plan for default bustype_id:', planError);
            }
          }

          seatMaps['default'] = seatMapData;
        }
      } else {
        // Folosește free_seats din răspunsul get_routes
        if (routeData.change_route && routeData.change_route.length > 0) {
          // Pentru rute cu transfer, folosește change_route
          for (let i = 0; i < routeData.change_route.length; i++) {
            const segment = routeData.change_route[i];
            const bustypeId = segment.bustype_id || `segment_${i}`;
            
            const seatMapData: SeatMapData = {
              bustype_id: bustypeId,
              hasPlan: segment.has_plan || 0,
              freeSeats: segment.free_seats?.map(seatNumber => {
                const price = segment.price_one_way ? parseFloat(segment.price_one_way) : undefined;
                console.log(`Segment ${segment.bustype_id} seat ${seatNumber} price:`, price, 'from price_one_way:', segment.price_one_way);
                return {
                  seat_number: seatNumber,
                  seat_free: 1,
                  seat_price: price,
                  seat_curency: (segment.currency || 'EUR') as Currency,
                };
              }) || [],
            };

            // Dacă has_plan = 1, obține și planul locurilor
            if (segment.has_plan === 1) {
              try {
                const planResponse = await apiPlan({
                  bustype_id: bustypeId,
                  position: 'h',
                  v: '2.0',
                });
                seatMapData.plan = convertPlanResponseToBusPlan(planResponse, bustypeId);
              } catch (planError) {
                console.warn(`Failed to load plan for bustype_id ${bustypeId}:`, planError);
              }
            }

            seatMaps[bustypeId] = seatMapData;
          }
        } else {
          // Pentru rute simple
          const seatMapData: SeatMapData = {
            bustype_id: routeData.bustype_id || 'default',
            hasPlan: routeData.has_plan || 0,
            freeSeats: routeData.free_seats?.map(seatNumber => {
              const price = routeData.price_one_way ? parseFloat(routeData.price_one_way) : undefined;
              console.log(`Route seat ${seatNumber} price:`, price, 'from price_one_way:', routeData.price_one_way);
              return {
                seat_number: seatNumber,
                seat_free: 1,
                seat_price: price,
                seat_curency: routeData.currency || 'EUR',
              };
            }) || [],
          };

          // Dacă has_plan = 1, obține și planul locurilor
          if (routeData.has_plan === 1) {
            try {
              const planResponse = await apiPlan({
                bustype_id: routeData.bustype_id || 'default',
                position: 'h',
                v: '2.0',
              });
              seatMapData.plan = convertPlanResponseToBusPlan(planResponse, routeData.bustype_id || 'default');
            } catch (planError) {
              console.warn('Failed to load plan for default bustype_id:', planError);
            }
          }

          seatMaps['default'] = seatMapData;
        }
      }

      if (isReturnTrip) {
        console.log('Setting return seat maps:', seatMaps);
        setReturnSeatMaps(seatMaps);
      } else {
        console.log('Setting outbound seat maps:', seatMaps);
        setSeatMaps(seatMaps);
        setActiveSegment(Object.keys(seatMaps)[0]);
      }
    } catch (error) {
      console.warn('Failed to load seat maps:', error);
      // Continuă fără seat maps
    }
  };

  // Încarcă călătoria de întors pentru dus-întors
  const loadReturnTrip = async (tripData: TripDetailProps) => {
    console.log('loadReturnTrip called with tripData:', tripData);
    try {
      // Conform documentației API-ului, pentru dus-întors trebuie să facem un apel separat
      // cu id_from și id_to inversate și interval_id din ruta dus
      const searchContext = location.state?.searchContext;
      console.log('Search context for return trip:', searchContext);
      if (!searchContext) {
        console.warn('No search context found for return trip');
        return;
      }

      // Construiește request-ul pentru călătoria de întors conform documentației
      const returnRequest = {
        id_from: searchContext.toPointId, // Inversăm punctele
        id_to: searchContext.fromPointId,
        date: searchContext.returnDate, // Data de întors
        interval_id: [tripData.intervalIdMain], // Interval ID din ruta dus
        trans: "bus",
        change: "auto",
        currency: "EUR",
        lang: "ru",
        v: "1.1"
      };

      console.log('Loading return trip with request:', returnRequest);

      // Apelăm API-ul pentru rutele de întors
      const response = await fetch('/api/backend/curl/get_routes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const returnRoutes = await response.json();
      console.log('Return routes response:', returnRoutes);
      
      if (returnRoutes && returnRoutes.length > 0) {
        const returnRouteData = returnRoutes[0]; // Prima rută de întors
        console.log('Setting return route data:', returnRouteData);
        setReturnRoute(returnRouteData);

        // Încarcă seat maps pentru călătoria de întors
        const returnTripData = {
          ...tripData,
          requestGetFreeSeats: 1 as 0 | 1,
          intervalIdMain: returnRouteData.interval_id,
        };
        
                 console.log('Loading seat maps for return trip with data:', returnTripData);
                 await loadSeatMaps(returnTripData, returnRouteData, true);
                 
                 // Încarcă reducerile pentru călătoria întors
                 await loadReturnDiscounts(tripData, returnRouteData);
                 
                 // Încarcă bagajele pentru călătoria întors
                 await loadReturnBaggage(tripData, returnRouteData);
                 
                 console.log('Return seat maps loaded successfully');
      } else {
        console.warn('No return routes found');
      }
    } catch (error) {
      console.warn('Failed to load return trip:', error);
    }
  };

  // Load discounts for outbound trip
  const loadOutboundDiscounts = async (tripData: TripDetailProps, routeData: RouteItem) => {
    try {
      setLoadingDiscounts(true);
      
      // Check if discounts are available in the route data
      if (routeData.discounts && routeData.discounts.length > 0) {
        console.log('Using discounts from route data:', routeData.discounts);
        setOutboundDiscounts({ 'default': routeData.discounts });
        return;
      }

      // If request_get_discount is true or 1, fetch discounts via API
      if (routeData.request_get_discount === 1 || routeData.request_get_discount === true) {
        console.log('Fetching discounts via API for interval:', tripData.intervalIdMain);
        
        const discountResponse = await apiGetDiscounts({
          interval_id: tripData.intervalIdMain || '',
          currency: routeData.currency || 'EUR',
          lang: 'ru'
        });

        console.log('Discounts response:', discountResponse);
        
        if (discountResponse.discounts && discountResponse.discounts.length > 0) {
          setOutboundDiscounts({ 'default': discountResponse.discounts });
        }
      }
    } catch (error) {
      console.warn('Failed to load outbound discounts:', error);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  // Load discounts for return trip
  const loadReturnDiscounts = async (tripData: TripDetailProps, returnRouteData: RouteItem) => {
    try {
      setLoadingDiscounts(true);
      
      // Check if discounts are available in the return route data
      if (returnRouteData.discounts && returnRouteData.discounts.length > 0) {
        console.log('Using return discounts from route data:', returnRouteData.discounts);
        setReturnDiscounts({ 'default': returnRouteData.discounts });
        return;
      }

      // If request_get_discount is true or 1, fetch discounts via API
      if (returnRouteData.request_get_discount === 1 || returnRouteData.request_get_discount === true) {
        console.log('Fetching return discounts via API for interval:', returnRouteData.interval_id);
        
        const discountResponse = await apiGetDiscounts({
          interval_id: returnRouteData.interval_id,
          currency: returnRouteData.currency || 'EUR',
          lang: 'ru'
        });

        console.log('Return discounts response:', discountResponse);
        
        if (discountResponse.discounts && discountResponse.discounts.length > 0) {
          setReturnDiscounts({ 'default': discountResponse.discounts });
        }
      }
    } catch (error) {
      console.warn('Failed to load return discounts:', error);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  // Load baggage for outbound trip
  const loadOutboundBaggage = async (tripData: TripDetailProps, routeData: RouteItem) => {
    try {
      setLoadingBaggage(true);
      
      // Check if baggage info is available in the route data (luggage field)
      if (routeData.luggage) {
        console.log('Using luggage info from route data:', routeData.luggage);
        // Log the luggage info but continue to check for API baggage if request_get_baggage = 1
      }

      // If request_get_baggage is true or 1, fetch baggage via API
      if (routeData.request_get_baggage === 1 || routeData.request_get_baggage === true) {
        console.log('Fetching baggage via API for interval:', tripData.intervalIdMain);
        
        const baggageResponse = await apiGetBaggage({
          interval_id: tripData.intervalIdMain || '',
          station_from_id: routeData.station_from || '',
          station_to_id: routeData.station_to || '',
          currency: routeData.currency || 'EUR',
          lang: 'ru'
        });

        console.log('Baggage response:', baggageResponse);
        
        if (baggageResponse && baggageResponse.length > 0) {
          setOutboundBaggage({ 'default': baggageResponse });
        }
      }
    } catch (error) {
      console.warn('Failed to load outbound baggage:', error);
    } finally {
      setLoadingBaggage(false);
    }
  };

  // Load baggage for return trip
  const loadReturnBaggage = async (tripData: TripDetailProps, returnRouteData: RouteItem) => {
    try {
      setLoadingBaggage(true);
      
      // Check if baggage info is available in the return route data
      if (returnRouteData.luggage) {
        console.log('Using return luggage info from route data:', returnRouteData.luggage);
        // Log the luggage info but continue to check for API baggage if request_get_baggage = 1
      }

      // If request_get_baggage is true or 1, fetch baggage via API
      if (returnRouteData.request_get_baggage === 1 || returnRouteData.request_get_baggage === true) {
        console.log('Fetching return baggage via API for interval:', returnRouteData.interval_id);
        
        const baggageResponse = await apiGetBaggage({
          interval_id: returnRouteData.interval_id,
          station_from_id: returnRouteData.station_from || '',
          station_to_id: returnRouteData.station_to || '',
          currency: returnRouteData.currency || 'EUR',
          lang: 'ru'
        });

        console.log('Return baggage response:', baggageResponse);
        
        if (baggageResponse && baggageResponse.length > 0) {
          setReturnBaggage({ 'default': baggageResponse });
        }
      }
    } catch (error) {
      console.warn('Failed to load return baggage:', error);
    } finally {
      setLoadingBaggage(false);
    }
  };

  // Get route data from props, navigation state, or URL params
  const getRouteData = useCallback((): TripDetailProps | null => {
    // First, check if routeData is provided directly via props
    if (props.routeData) {
      return {
        intervalIdMain: props.routeData.interval_id,
        intervalIdsAll: props.intervalIdsAll,
        timetableId: props.timetableId,
        hasPlan: props.hasPlan || 0,
        requestGetFreeSeats: props.requestGetFreeSeats || 0,
        changeRoute: props.routeData.change_route,
        routeMeta: {
          route_name: props.routeData.route_name || 'Unknown Route',
          carrier: props.routeData.carrier || 'Unknown Carrier',
          rating: props.routeData.rating,
          reviews: props.routeData.reviews,
          logo: props.routeData.logo,
          comfort: Array.isArray(props.routeData.comfort) ? props.routeData.comfort : (typeof props.routeData.comfort === 'string' && props.routeData.comfort ? props.routeData.comfort.split(',') : []),
          time_in_way: props.routeData.time_in_way,
          price_one_way: typeof props.routeData.price_one_way === 'number' ? props.routeData.price_one_way : parseFloat(props.routeData.price_one_way || '0'),
          price_one_way_max: typeof props.routeData.price_one_way_max === 'number' ? props.routeData.price_one_way_max : parseFloat(props.routeData.price_one_way_max || '0'),
          currency: (props.routeData.currency as 'EUR') || 'EUR',
          date_from: props.routeData.date_from,
          time_from: props.routeData.time_from,
          point_from: props.routeData.point_from,
          station_from: props.routeData.station_from,
          date_to: props.routeData.date_to,
          time_to: props.routeData.time_to,
          point_to: props.routeData.point_to,
          station_to: props.routeData.station_to,
          luggage: props.routeData.luggage,
          route_info: props.routeData.route_info,
          cancel_hours_info: props.routeData.cancel_hours_info || [],
        },
        searchContext: props.searchContext || {
          dateThere: props.routeData.date_from || '2023-11-30',
          dateBack: undefined,
          id_from: '3',
          id_to: '6',
          station_id_from: '123',
          station_id_to: undefined,
          currency: 'EUR',
          lang: 'ru',
        },
      };
    }

    // Second, check if routeData is provided via navigation state (from SearchResults)
    const navigationState = location.state as any;
    if (navigationState?.routeData) {
      const routeData = navigationState.routeData;
      const searchContext = navigationState.searchContext;
      
      return {
        intervalIdMain: routeData.interval_id,
        intervalIdsAll: props.intervalIdsAll,
        timetableId: routeData.timetable_id,
        hasPlan: routeData.has_plan || 0,
        requestGetFreeSeats: routeData.request_get_free_seats || 0,
        changeRoute: routeData.change_route,
        routeMeta: {
          route_name: routeData.route_name || 'Unknown Route',
          carrier: routeData.carrier || 'Unknown Carrier',
          rating: routeData.rating,
          reviews: routeData.reviews,
          logo: routeData.logo,
          comfort: Array.isArray(routeData.comfort) ? routeData.comfort : (typeof routeData.comfort === 'string' && routeData.comfort ? routeData.comfort.split(',') : []),
          time_in_way: routeData.time_in_way,
          price_one_way: typeof routeData.price_one_way === 'number' ? routeData.price_one_way : parseFloat(routeData.price_one_way || '0'),
          price_one_way_max: typeof routeData.price_one_way_max === 'number' ? routeData.price_one_way_max : parseFloat(routeData.price_one_way_max || '0'),
          currency: routeData.currency || 'EUR',
          date_from: routeData.date_from,
          time_from: routeData.time_from,
          point_from: routeData.point_from,
          station_from: routeData.station_from,
          date_to: routeData.date_to,
          time_to: routeData.time_to,
          point_to: routeData.point_to,
          station_to: routeData.station_to,
          luggage: routeData.luggage,
          route_info: routeData.route_info,
          cancel_hours_info: routeData.cancel_hours_info || [],
        },
        searchContext: searchContext ? {
          dateThere: searchContext.date || routeData.date_from || '2023-11-30',
          dateBack: undefined,
          id_from: searchContext.fromPointId || '3',
          id_to: searchContext.toPointId || '6',
          station_id_from: undefined,
          station_id_to: undefined,
          currency: 'EUR',
          lang: searchContext.lang || 'ru',
        } : {
          dateThere: routeData.date_from || '2023-11-30',
          dateBack: undefined,
          id_from: '3',
          id_to: '6',
          station_id_from: undefined,
          station_id_to: undefined,
          currency: 'EUR',
          lang: 'ru',
        },
      };
    }

    // Third, try to get from URL params - check multiple possible parameter names
    const intervalIdMain = searchParams.get('intervalIdMain') || 
                          searchParams.get('intervalId') ||
                          searchParams.get('interval_id') || 
                          searchParams.get('routeId') || 
                          searchParams.get('route_id') ||
                          searchParams.get('id');
    
    const hasPlan = parseInt(searchParams.get('hasPlan') || searchParams.get('has_plan') || '0') as 0 | 1;
    const requestGetFreeSeats = parseInt(searchParams.get('requestGetFreeSeats') || searchParams.get('request_get_free_seats') || '0') as 0 | 1;
    const passengersParam = parseInt(searchParams.get('passengers') || '1');

    // If no interval ID found, return null to trigger error
    if (!intervalIdMain) {
      console.warn('No interval ID found in URL parameters. Available params:', Object.fromEntries(searchParams));
      return null;
    }

    // Build route summary from URL params
    const routeSummary: RouteSummary = {
      route_name: searchParams.get('route_name') || 'Unknown Route',
      carrier: searchParams.get('carrier') || 'Unknown Carrier',
      rating: searchParams.get('rating') || undefined,
      reviews: searchParams.get('reviews') || undefined,
      logo: searchParams.get('logo') || undefined,
      comfort: searchParams.get('comfort')?.split(',') || [],
      time_in_way: searchParams.get('time_in_way') || undefined,
      price_one_way: parseFloat(searchParams.get('price_one_way') || '0'),
      price_one_way_max: parseFloat(searchParams.get('price_one_way_max') || '0'),
      currency: (searchParams.get('currency') as any) || 'EUR',
      date_from: searchParams.get('date_from') || new Date().toISOString().split('T')[0],
      time_from: searchParams.get('time_from') || '00:00',
      point_from: searchParams.get('point_from') || 'Unknown',
      station_from: searchParams.get('station_from') || undefined,
      date_to: searchParams.get('date_to') || new Date().toISOString().split('T')[0],
      time_to: searchParams.get('time_to') || '00:00',
      point_to: searchParams.get('point_to') || 'Unknown',
      station_to: searchParams.get('station_to') || undefined,
      luggage: searchParams.get('luggage') || undefined,
      route_info: searchParams.get('route_info') || undefined,
    };

    return {
      intervalIdMain,
      intervalIdsAll: searchParams.get('intervalIdsAll')?.split(',') || undefined,
      timetableId: searchParams.get('timetableId') || undefined,
      hasPlan,
      requestGetFreeSeats,
      changeRoute: undefined, // Will be loaded from API
      routeMeta: routeSummary,
      searchContext: {
        dateThere: searchParams.get('dateThere') || new Date().toISOString().split('T')[0],
        dateBack: searchParams.get('dateBack') || undefined,
        id_from: searchParams.get('id_from') || '0',
        id_to: searchParams.get('id_to') || '0',
        station_id_from: searchParams.get('station_id_from') || undefined,
        station_id_to: searchParams.get('station_id_to') || undefined,
        currency: 'EUR',
        lang: 'ru',
      },
    };
  }, [searchParams, location.state, props]);

  // Load route and seat data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        setError(null);

        const tripData = getRouteData();
        if (!tripData) {
          console.error('Failed to get trip data. URL params:', Object.fromEntries(searchParams));
          throw new Error('Parametrii rutei lipsesc din URL. Asigură-te că incluzi intervalIdMain sau interval_id în URL.');
        }

        // Set passengers from navigation state or URL
        const navigationState = location.state as any;
        const passengersCount = navigationState?.passengers || parseInt(searchParams.get('passengers') || '1');
        setPassengers(passengersCount);

        // Detectează dacă este o călătorie dus-întors
        const isRoundTripDetected = navigationState?.isRoundTrip || false;
        console.log('Round trip detection:', { 
          isRoundTripDetected, 
          navigationState: navigationState?.isRoundTrip,
          searchContext: navigationState?.searchContext 
        });
        setIsRoundTrip(isRoundTripDetected);

        // Dacă avem datele rutei din navigation state, folosește-le direct
        if (navigationState?.routeData) {
          // Folosește datele reale din SearchResults
          setRoute(navigationState.routeData);
          
          // Încarcă reducerile pentru călătoria dus
          await loadOutboundDiscounts(tripData, navigationState.routeData);
          
          // Încarcă bagajele pentru călătoria dus
          await loadOutboundBaggage(tripData, navigationState.routeData);
          
          // Dacă avem și datele rutei de întors, le setăm direct
          if (navigationState?.returnRouteData) {
            setReturnRoute(navigationState.returnRouteData);
            // Încarcă reducerile pentru călătoria întors
            await loadReturnDiscounts(tripData, navigationState.returnRouteData);
            // Încarcă bagajele pentru călătoria întors
            await loadReturnBaggage(tripData, navigationState.returnRouteData);
          }
          
          // Încarcă seat maps dacă este necesar
          await loadSeatMaps(tripData, navigationState.routeData);
          
          // Dacă este dus-întors, încarcă și călătoria de întors
          if (isRoundTripDetected) {
            if (navigationState?.returnRouteData) {
              // Folosește datele de întors din navigation state
              await loadSeatMaps(tripData, navigationState.returnRouteData, true);
            } else {
              // Încarcă datele de întors din API
              await loadReturnTrip(tripData);
            }
          }
        } else {
          // Fallback: încarcă datele din API (pentru linkuri directe)
          const routeData = await loadRouteFromAPI(tripData);
          setRoute(routeData);

          // Încarcă reducerile pentru călătoria dus
          await loadOutboundDiscounts(tripData, routeData);

          // Încarcă bagajele pentru călătoria dus
          await loadOutboundBaggage(tripData, routeData);

          // Încarcă informații detaliate despre rută (opțional)
          await loadDetailedRouteInfo(tripData);

          // Încarcă seat maps dacă este necesar
          await loadSeatMaps(tripData, routeData);
          
          // Dacă este dus-întors, încarcă și călătoria de întors
          if (isRoundTripDetected) {
            await loadReturnTrip(tripData);
          }
        }

      } catch (err) {
        console.error('Failed to load trip data:', err);
        setError({
          code: 'route_not_found',
          message: err instanceof Error ? err.message : 'Failed to load trip data',
          retryable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadTripData();
  }, [getRouteData, searchParams]);

  // Seat selection hook - pentru călătoria dus
  const outboundSegments = Object.entries(seatMaps).map(([bustype_id, seatMapData]) => ({
    bustype_id,
    segmentName: `Dus - Segment ${bustype_id}`,
    freeSeats: seatMapData.freeSeats,
  }));

  const {
    selectedSeats: outboundSelectedSeats,
    canSelectSeat: canSelectOutboundSeat,
    selectSeat: selectOutboundSeat,
    deselectSeat: deselectOutboundSeat,
    getSelectionSummary: getOutboundSelectionSummary,
    isSelectionValid: isOutboundSelectionValid,
    totalPrice: outboundTotalPrice,
    currency: outboundCurrency,
  } = useSeatSelection({ passengers, segments: outboundSegments, isReturnTrip: false });

  // Seat selection hook - pentru călătoria întors
  const returnSegments = Object.entries(returnSeatMaps).map(([bustype_id, seatMapData]) => ({
    bustype_id,
    segmentName: `Întors - Segment ${bustype_id}`,
    freeSeats: seatMapData.freeSeats,
  }));

  const {
    selectedSeats: returnSelectedSeats,
    canSelectSeat: canSelectReturnSeat,
    selectSeat: selectReturnSeat,
    deselectSeat: deselectReturnSeat,
    getSelectionSummary: getReturnSelectionSummary,
    isSelectionValid: isReturnSelectionValid,
    totalPrice: returnTotalPrice,
    currency: returnCurrency,
  } = useSeatSelection({ passengers, segments: returnSegments, isReturnTrip: true });

  // Discount selection hooks
  const outboundBasePrice = route?.price_one_way ? parseFloat(route.price_one_way) : 0;
  const returnBasePrice = returnRoute?.price_one_way ? parseFloat(returnRoute.price_one_way) : 0;
  const currency = route?.currency || 'EUR';
  
  // Debug logging
  console.log('Route price:', route?.price_one_way);
  console.log('Outbound base price:', outboundBasePrice);
  console.log('Outbound discounts:', outboundDiscounts);
  console.log('Return discounts:', returnDiscounts);
  console.log('Outbound baggage:', outboundBaggage);
  console.log('Return baggage:', returnBaggage);
  console.log('Route request_get_baggage:', route?.request_get_baggage);
  console.log('Route request_get_discount:', route?.request_get_discount);

  const outboundDiscountSelection = useDiscountSelection({
    passengers,
    basePrice: outboundBasePrice,
    currency,
    isReturnTrip: false
  });

  const returnDiscountSelection = useDiscountSelection({
    passengers,
    basePrice: returnBasePrice,
    currency,
    isReturnTrip: true
  });

  // Baggage selection hooks
  const outboundBaggageSelection = useBaggageSelection({
    passengers,
    isReturnTrip: false
  });

  const returnBaggageSelection = useBaggageSelection({
    passengers,
    isReturnTrip: true
  });

  // Booking data hook
  const bookingData = useBookingData({
    passengers,
    isRoundTrip,
    outboundIntervalId: route?.interval_id,
    returnIntervalId: returnRoute?.interval_id,
    outboundDate: route?.date_from,
    returnDate: returnRoute?.date_from,
    outboundSelectedSeats: outboundSelectedSeats(Object.keys(seatMaps)[0] || ''),
    returnSelectedSeats: returnSelectedSeats(Object.keys(returnSeatMaps)[0] || ''),
    outboundDiscounts: outboundDiscountSelection.selectedDiscounts,
    returnDiscounts: returnDiscountSelection.selectedDiscounts,
    outboundBaggage: outboundBaggageSelection.selectedBaggage,
    returnBaggage: returnBaggageSelection.selectedBaggage,
    outboundTotalPrice,
    returnTotalPrice,
    currency,
    route: route // Pass route information for field requirements
  });

  // Handle seat selection - pentru călătoria dus
  const handleOutboundSeatSelect = useCallback((bustype_id: string, seatNumber: string) => {
    if (canSelectOutboundSeat(bustype_id, seatNumber)) {
      selectOutboundSeat(bustype_id, seatNumber);
    }
  }, [canSelectOutboundSeat, selectOutboundSeat]);

  // Handle seat deselection - pentru călătoria dus
  const handleOutboundSeatDeselect = useCallback((bustype_id: string, seatNumber: string) => {
    deselectOutboundSeat(bustype_id, seatNumber);
  }, [deselectOutboundSeat]);

  // Handle seat selection - pentru călătoria întors
  const handleReturnSeatSelect = useCallback((bustype_id: string, seatNumber: string) => {
    if (canSelectReturnSeat(bustype_id, seatNumber)) {
      selectReturnSeat(bustype_id, seatNumber);
    }
  }, [canSelectReturnSeat, selectReturnSeat]);

  // Handle seat deselection - pentru călătoria întors
  const handleReturnSeatDeselect = useCallback((bustype_id: string, seatNumber: string) => {
    deselectReturnSeat(bustype_id, seatNumber);
  }, [deselectReturnSeat]);

  // Handle continue to checkout
  const handleContinue = useCallback(() => {
    if (isRoundTrip) {
      // Pentru călătoriile dus-întors, verifică ambele selecții
      if (!isOutboundSelectionValid || !isReturnSelectionValid) return;
      setShowBookingForm(true);
    } else {
      // Pentru călătoriile simple
      if (!isOutboundSelectionValid) return;
      setShowBookingForm(true);
    }
  }, [isRoundTrip, isOutboundSelectionValid, isReturnSelectionValid]);

  // Handle booking success
  const handleBookingSuccess = useCallback((response: BookingResponse) => {
    setBookingResponse(response);
    setShowBookingForm(false);
    setBookingError(null);
  }, []);

  // Handle booking error
  const handleBookingError = useCallback((error: string) => {
    setBookingError(error);
  }, []);

  // Handle back to seat selection
  const handleBackToSeats = useCallback(() => {
    setShowBookingForm(false);
    setBookingResponse(null);
    setBookingError(null);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading trip details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{error.message}</p>
                {error.retryable && (
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Route Not Found</h2>
          <p className="text-gray-600 mb-4">The requested route could not be found.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const hasMultipleSegments = Object.keys(seatMaps).length > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isRoundTrip ? 'Dus-Întors' : 
             route.point_from && route.point_to ? 
              `${route.point_from} - ${route.point_to}` : 
              route.route_name || 'Route Details'
            }
          </h1>
          <p className="text-gray-600">
            {isRoundTrip ? 
              `${route.point_from} - ${route.point_to} - ${route.point_from}` : 
              route.carrier
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Trip Summary */}
        <div className="xl:col-span-1">
          <TripSummary
            route={{
              route_name: route.route_name,
              carrier: route.carrier,
              rating: route.rating,
              reviews: route.reviews,
              logo: route.logo,
              comfort: Array.isArray(route.comfort) ? route.comfort : (typeof route.comfort === 'string' && route.comfort ? route.comfort.split(',') : []),
              time_in_way: route.time_in_way,
              price_one_way: typeof route.price_one_way === 'number' ? route.price_one_way : parseFloat(route.price_one_way?.toString() || '0'),
              price_one_way_max: typeof route.price_one_way_max === 'number' ? route.price_one_way_max : parseFloat(route.price_one_way_max?.toString() || '0'),
              currency: route.currency,
              date_from: route.date_from,
              time_from: route.time_from,
              point_from: route.point_from,
              station_from: route.station_from,
              date_to: route.date_to,
              time_to: route.time_to,
              point_to: route.point_to,
              station_to: route.station_to,
              luggage: route.luggage,
              route_info: route.route_info,
              cancel_hours_info: route.cancel_hours_info || [],
            }}
            returnRoute={returnRoute ? {
              route_name: returnRoute.route_name,
              carrier: returnRoute.carrier,
              rating: returnRoute.rating,
              reviews: returnRoute.reviews,
              logo: returnRoute.logo,
              comfort: Array.isArray(returnRoute.comfort) ? returnRoute.comfort : (typeof returnRoute.comfort === 'string' && returnRoute.comfort ? returnRoute.comfort.split(',') : []),
              time_in_way: returnRoute.time_in_way,
              price_one_way: typeof returnRoute.price_one_way === 'number' ? returnRoute.price_one_way : parseFloat(returnRoute.price_one_way?.toString() || '0'),
              price_one_way_max: typeof returnRoute.price_one_way_max === 'number' ? returnRoute.price_one_way_max : parseFloat(returnRoute.price_one_way_max?.toString() || '0'),
              currency: returnRoute.currency,
              date_from: returnRoute.date_from,
              time_from: returnRoute.time_from,
              point_from: returnRoute.point_from,
              station_from: returnRoute.station_from,
              date_to: returnRoute.date_to,
              time_to: returnRoute.time_to,
              point_to: returnRoute.point_to,
              station_to: returnRoute.station_to,
              luggage: returnRoute.luggage,
              route_info: returnRoute.route_info,
              cancel_hours_info: returnRoute.cancel_hours_info || [],
            } : undefined}
            passengers={passengers}
            onPassengersChange={setPassengers}
            isRoundTrip={isRoundTrip}
            outboundDiscount={outboundDiscountSelection.getDiscountForSegment('default')}
            returnDiscount={returnDiscountSelection.getDiscountForSegment('default')}
            outboundBaggage={outboundBaggageSelection.selectedBaggage}
            returnBaggage={returnBaggageSelection.selectedBaggage}
            outboundTotalPrice={outboundTotalPrice}
            returnTotalPrice={returnTotalPrice}
            currency={currency}
          />
        </div>

        {/* Seat Selection */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Seats</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Passengers: {passengers}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Select {passengers} seat{passengers > 1 ? 's' : ''} for each journey</span>
              </div>
            </CardHeader>
            <CardContent>
              {isRoundTrip ? (
                // Afișează direct ambele călătorii pentru dus-întors
                <div className="space-y-8">
                  {/* Călătoria Dus */}
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900">Călătorie Dus</h3>
                      <p className="text-sm text-blue-700">
                        Selectați {passengers} loc{passengers > 1 ? 'uri' : ''} pentru călătoria dus
                      </p>
                    </div>
                    {/* Pentru dus, afișează doar o singură secțiune */}
                    {Object.values(seatMaps)[0] ? (
                      <SeatMap
                        seatMapData={Object.values(seatMaps)[0]}
                        selectedSeats={outboundSelectedSeats(Object.keys(seatMaps)[0])}
                        maxSeats={passengers}
                        onSeatSelect={(seatNumber) => handleOutboundSeatSelect(Object.keys(seatMaps)[0], seatNumber)}
                        onSeatDeselect={(seatNumber) => handleOutboundSeatDeselect(Object.keys(seatMaps)[0], seatNumber)}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No seat map data available
                      </div>
                    )}
                    
                    {/* Discount Selector pentru călătoria dus */}
                    {(route?.request_get_discount === 1 || route?.request_get_discount === true) && outboundDiscounts['default'] && outboundDiscounts['default'].length > 0 && (
                      <div className="mt-6">
                        <DiscountSelector
                          discounts={outboundDiscounts['default']}
                          selectedDiscount={outboundDiscountSelection.getDiscountForSegment('default')}
                          basePrice={outboundBasePrice}
                          passengers={passengers}
                          currency={currency}
                          segmentName="Outbound Journey"
                          onSelectDiscount={(discount) => outboundDiscountSelection.selectDiscount(discount, 'default')}
                          onDeselectDiscount={() => outboundDiscountSelection.deselectDiscount('default')}
                          loading={loadingDiscounts}
                        />
                      </div>
                    )}
                    
                    {/* Baggage Selector moved to main content area - after seat selection */}
                    
                  </div>

                  {/* Călătoria Întors */}
                  <div>
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900">Călătorie Întors</h3>
                      <p className="text-sm text-green-700">
                        Selectați {passengers} loc{passengers > 1 ? 'uri' : ''} pentru călătoria întors
                      </p>
                    </div>
                    {/* Pentru întors, afișează segmentele conform documentației API-ului */}
                    {(() => {
                      console.log('Rendering return trip section, returnSeatMaps:', returnSeatMaps);
                      return null;
                    })()}
                    {Object.keys(returnSeatMaps).length > 0 ? (
                      Object.keys(returnSeatMaps).length > 1 ? (
                        <Tabs value={activeSegment || undefined} onValueChange={setActiveSegment}>
                          <TabsList className="grid w-full grid-cols-2">
                              {Object.entries(returnSeatMaps).map(([bustype_id, seatMapData], index) => (
                                <TabsTrigger key={bustype_id} value={bustype_id}>
                                  Întors {index + 1}
                                </TabsTrigger>
                              ))}
                          </TabsList>
                          {Object.entries(returnSeatMaps).map(([bustype_id, seatMapData], index) => (
                            <TabsContent key={bustype_id} value={bustype_id}>
                              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900">Întors {index + 1} - Seat Selection</h4>
                                <p className="text-sm text-green-700">
                                  Select {passengers} seat{passengers > 1 ? 's' : ''} for this part of the return journey
                                </p>
                              </div>
                              <SeatMap
                                seatMapData={seatMapData}
                                selectedSeats={returnSelectedSeats(bustype_id)}
                                maxSeats={passengers}
                                onSeatSelect={(seatNumber) => handleReturnSeatSelect(bustype_id, seatNumber)}
                                onSeatDeselect={(seatNumber) => handleReturnSeatDeselect(bustype_id, seatNumber)}
                              />
                            </TabsContent>
                          ))}
                        </Tabs>
                      ) : (
                        <SeatMap
                          seatMapData={Object.values(returnSeatMaps)[0]}
                          selectedSeats={returnSelectedSeats(Object.keys(returnSeatMaps)[0])}
                          maxSeats={passengers}
                          onSeatSelect={(seatNumber) => handleReturnSeatSelect(Object.keys(returnSeatMaps)[0], seatNumber)}
                          onSeatDeselect={(seatNumber) => handleReturnSeatDeselect(Object.keys(returnSeatMaps)[0], seatNumber)}
                        />
                      )
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No return seat map data available
                      </div>
                    )}
                    
                    {/* Discount Selector pentru călătoria întors */}
                    {returnDiscounts['default'] && (
                      <div className="mt-6">
                        <DiscountSelector
                          discounts={returnDiscounts['default']}
                          selectedDiscount={returnDiscountSelection.getDiscountForSegment('default')}
                          basePrice={returnBasePrice}
                          passengers={passengers}
                          currency={currency}
                          segmentName="Return Journey"
                          onSelectDiscount={(discount) => returnDiscountSelection.selectDiscount(discount, 'default')}
                          onDeselectDiscount={() => returnDiscountSelection.deselectDiscount('default')}
                          loading={loadingDiscounts}
                        />
                      </div>
                    )}
                    
                    {/* Baggage Selector pentru călătoria întors */}
                    {returnBaggage['default'] && (
                      <div className="mt-6">
                        <BaggageSelector
                          baggageItems={returnBaggage['default']}
                          selectedBaggage={returnBaggageSelection.selectedBaggage}
                          passengers={passengers}
                          currency={currency}
                          segmentName="Return Journey"
                          onAddBaggage={returnBaggageSelection.addBaggage}
                          onRemoveBaggage={returnBaggageSelection.removeBaggage}
                          onUpdateQuantity={returnBaggageSelection.updateBaggageQuantity}
                          loading={loadingBaggage}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Călătorie simplă fără transfer
                Object.values(seatMaps)[0] ? (
                  <SeatMap
                    seatMapData={Object.values(seatMaps)[0]}
                    selectedSeats={outboundSelectedSeats(Object.keys(seatMaps)[0])}
                    maxSeats={passengers}
                    onSeatSelect={(seatNumber) => handleOutboundSeatSelect(Object.keys(seatMaps)[0], seatNumber)}
                    onSeatDeselect={(seatNumber) => handleOutboundSeatDeselect(Object.keys(seatMaps)[0], seatNumber)}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No seat map data available
                  </div>
                )
              )}

              {/* Legend */}
              <div className="mt-6">
                <Legend />
              </div>

              {/* Selection Summary */}
              {isRoundTrip ? (
                // Validare pentru călătoriile dus-întors
                <div className="mt-6 space-y-4">
                  {/* Dus Selection */}
                  <div className={`p-4 rounded-lg ${isOutboundSelectionValid ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${isOutboundSelectionValid ? 'text-green-600' : 'text-yellow-600'}`} />
                      <span className={`font-medium ${isOutboundSelectionValid ? 'text-green-800' : 'text-yellow-800'}`}>
                        Dus: {isOutboundSelectionValid ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isOutboundSelectionValid ? 'text-green-700' : 'text-yellow-700'}`}>
                      {Object.keys(seatMaps).reduce((total, bustype_id) => 
                        total + outboundSelectedSeats(bustype_id).length, 0
                      )} of {passengers} seat{passengers > 1 ? 's' : ''} selected
                    </p>
                  </div>

                  {/* Întors Selection */}
                  <div className={`p-4 rounded-lg ${isReturnSelectionValid ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${isReturnSelectionValid ? 'text-green-600' : 'text-yellow-600'}`} />
                      <span className={`font-medium ${isReturnSelectionValid ? 'text-green-800' : 'text-yellow-800'}`}>
                        Întors: {isReturnSelectionValid ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isReturnSelectionValid ? 'text-green-700' : 'text-yellow-700'}`}>
                      {Object.keys(returnSeatMaps).reduce((total, bustype_id) => 
                        total + returnSelectedSeats(bustype_id).length, 0
                      )} of {passengers} seat{passengers > 1 ? 's' : ''} selected
                    </p>
                  </div>

                  {/* Total Price */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">Total Price:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {(outboundTotalPrice + returnTotalPrice).toFixed(2)} {outboundCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Validare pentru călătoriile simple
                isOutboundSelectionValid && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Selection Complete</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {passengers} seat{passengers > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )
              )}

              {/* Baggage Selection - After seat selection, before checkout */}
              {(route?.request_get_baggage === 1 || route?.request_get_baggage === true) && outboundBaggage['default'] && outboundBaggage['default'].length > 0 && (
                <div className="mt-6">
                  <BaggageSelector
                    baggageItems={outboundBaggage['default']}
                    selectedBaggage={outboundBaggageSelection.selectedBaggage}
                    passengers={passengers}
                    currency={currency}
                    segmentName="Outbound Journey"
                    onAddBaggage={outboundBaggageSelection.addBaggage}
                    onRemoveBaggage={outboundBaggageSelection.removeBaggage}
                    onUpdateQuantity={outboundBaggageSelection.updateBaggageQuantity}
                    loading={loadingBaggage}
                  />
                </div>
              )}

              {/* Continue Button */}
              <div className="mt-6">
                <Button
                  onClick={handleContinue}
                  disabled={isRoundTrip ? (!isOutboundSelectionValid || !isReturnSelectionValid) : !isOutboundSelectionValid}
                  className="w-full"
                  size="lg"
                >
                  Continue to Checkout
                  <Badge variant="secondary" className="ml-2">
                    {bookingData.bookingSummary.totalPrice.toFixed(2)} {bookingData.bookingSummary.currency}
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Complete Your Booking</h2>
                <Button variant="ghost" onClick={handleBackToSeats}>
                  ← Back to Seats
                </Button>
              </div>
              
              <BookingForm
                passengers={passengers}
                isRoundTrip={isRoundTrip}
                bookingSummary={bookingData.bookingSummary}
                preparedBookingRequest={bookingData.preparedBookingRequest}
                route={bookingData.route}
                onBookingSuccess={handleBookingSuccess}
                onBookingError={handleBookingError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation */}
      {bookingResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Booking Confirmed</h2>
                <Button variant="ghost" onClick={handleBackToSeats}>
                  Close
                </Button>
              </div>
              
              <BookingConfirmation
                bookingResponse={bookingResponse}
                onDownloadTicket={() => console.log('Download ticket')}
                onCopyOrderId={() => console.log('Copy order ID')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Booking Error */}
      {bookingError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-bold">Booking Error</h2>
              </div>
              
              <p className="text-gray-600 mb-4">{bookingError}</p>
              
              <div className="flex gap-2">
                <Button onClick={handleBackToSeats} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleBackToSeats}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TripDetail: React.FC<TripDetailProps> = (props) => {
  return (
    <TripDetailErrorBoundary>
      <TripDetailContent {...props} />
    </TripDetailErrorBoundary>
  );
};

export default TripDetail;
