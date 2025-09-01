/**
 * ROUTE SCHEDULE PAGE - Afișare orar detaliat
 * 
 * Componentă completă pentru afișarea orarului unei rute cu toate detaliile:
 * - Timeline stații cu transfer info
 * - Bagaje disponibile cu validări
 * - Politici de anulare
 * - Galerie foto și informații suplimentare
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRouteSchedule, validateBaggageSelection, generateStationTimeline, calculateEstimatedRefund, getBookingConstraints } from '@/lib/getAllRoutesApi';
import type { RouteSchedule, BaggageSelection, StationTimelineItem } from '@/types/getAllRoutes';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RouteSchedulePageProps {
  timetable_id: string;
  route_name?: string;
  onBookingSelect?: (data: {
    schedule: RouteSchedule;
    selectedBaggage: BaggageSelection[];
    totalPrice: number;
  }) => void;
  onClose?: () => void;
  lang?: "en" | "ru" | "ua" | "de" | "pl" | "cz";
}

export function RouteSchedulePage({
  timetable_id,
  route_name,
  onBookingSelect,
  onClose,
  lang = 'ru'
}: RouteSchedulePageProps) {
  const { toast } = useToast();
  
  // State management
  const [selectedBaggage, setSelectedBaggage] = useState<BaggageSelection[]>([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [refundHours, setRefundHours] = useState<number>(24);

  // Fetch schedule data
  const {
    data: schedule,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['route-schedule', timetable_id, lang],
    queryFn: () => getRouteSchedule(timetable_id, { lang }),
    enabled: !!timetable_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  });

  // Generate timeline and constraints
  const timeline = useMemo(() => {
    return schedule ? generateStationTimeline(schedule) : [];
  }, [schedule]);

  const bookingConstraints = useMemo(() => {
    return schedule ? getBookingConstraints(schedule) : null;
  }, [schedule]);

  // Baggage validation
  const baggageValidation = useMemo(() => {
    if (!schedule || selectedBaggage.length === 0) {
      return { isValid: true, errors: [], totalPrice: 0 };
    }
    
    return validateBaggageSelection(selectedBaggage, undefined, undefined);
  }, [selectedBaggage, schedule]);

  // Refund calculation
  const refundEstimate = useMemo(() => {
    if (!schedule || !schedule.cancel_policy) {
      return null;
    }
    
    return calculateEstimatedRefund(100, refundHours, schedule.cancel_policy);
  }, [schedule, refundHours]);

  // Handle baggage quantity change
  const handleBaggageChange = (baggage_id: string, quantity: number) => {
    if (!schedule) return;
    
    const baggageItem = schedule.baggage?.find(item => item.baggage_id === baggage_id);
    if (!baggageItem) return;

    setSelectedBaggage(prev => {
      const existing = prev.find(sel => sel.item.baggage_id === baggage_id);
      
      if (quantity === 0) {
        return prev.filter(sel => sel.item.baggage_id !== baggage_id);
      }
      
      const newSelection: BaggageSelection = {
        item: baggageItem,
        quantity,
        total_price: baggageItem.price * quantity,
        is_valid: true
      };
      
      if (existing) {
        return prev.map(sel => 
          sel.item.baggage_id === baggage_id ? newSelection : sel
        );
      }
      
      return [...prev, newSelection];
    });
  };

  // Handle booking selection
  const handleBooking = () => {
    if (!schedule || !onBookingSelect) return;
    
    if (!baggageValidation.isValid) {
      toast({
        title: "Eroare validare bagaj",
        description: baggageValidation.errors.join('. '),
        variant: "destructive"
      });
      return;
    }
    
    onBookingSelect({
      schedule,
      selectedBaggage,
      totalPrice: baggageValidation.totalPrice
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Se încarcă orarul...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorObj = error as { user_message?: string; retry_suggested?: boolean };
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          {errorObj.user_message || 'A apărut o eroare la încărcarea orarului.'}
          {errorObj.retry_suggested && (
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
              Încearcă din nou
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!schedule) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          Nu s-au găsit date pentru acest orar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {schedule.route_name || route_name || 'Orar Rută'}
          </h1>
          {schedule.carrier && (
            <p className="text-muted-foreground">Operator: {schedule.carrier}</p>
          )}
        </div>
        <div className="flex gap-2">
          {schedule.route_foto && schedule.route_foto.length > 0 && (
            <Button variant="outline" onClick={() => setShowPhotos(true)}>
              Vezi Poze ({schedule.route_foto.length})
            </Button>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Închide
            </Button>
          )}
        </div>
      </div>

      {/* Summary Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Informații Generale
            {schedule.logo_url && (
              <img 
                src={schedule.logo_url} 
                alt={schedule.carrier} 
                className="h-6 w-auto"
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {schedule.schledules?.departure && (
              <div>
                <Label className="text-xs text-muted-foreground">Plecare</Label>
                <p className="font-medium">{schedule.schledules.departure}</p>
              </div>
            )}
            {schedule.schledules?.time_in_way && (
              <div>
                <Label className="text-xs text-muted-foreground">Durată</Label>
                <p className="font-medium">{schedule.schledules.time_in_way}</p>
              </div>
            )}
            {schedule.stations && (
              <div>
                <Label className="text-xs text-muted-foreground">Stații</Label>
                <p className="font-medium">{schedule.stations.length} stații</p>
              </div>
            )}
            {schedule.bustype && (
              <div>
                <Label className="text-xs text-muted-foreground">Tip autobuz</Label>
                <p className="font-medium">{schedule.bustype}</p>
              </div>
            )}
          </div>
          
          {/* Comfort features */}
          {schedule.comfort && schedule.comfort.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Facilități</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {schedule.comfort.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Traseu</TabsTrigger>
          <TabsTrigger value="baggage">
            Bagaje {selectedBaggage.length > 0 && `(${selectedBaggage.length})`}
          </TabsTrigger>
          <TabsTrigger value="policy">Politici</TabsTrigger>
          <TabsTrigger value="booking">Rezervare</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traseul Rutei</CardTitle>
              <CardDescription>
                Toate stațiile cu orele de sosire și plecare
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <TimelineItem
                      key={index}
                      item={item}
                      isSelected={selectedStation === index}
                      onClick={() => setSelectedStation(selectedStation === index ? null : index)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nu sunt disponibile detalii despre traseu.</p>
                  {schedule.schledules && (
                    <div className="mt-4 space-y-1">
                      <p>Plecare: {schedule.schledules.departure}</p>
                      <p>Durată: {schedule.schledules.time_in_way}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Baggage Tab */}
        <TabsContent value="baggage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bagaje Disponibile</CardTitle>
              <CardDescription>
                Selectează bagajele necesare pentru călătorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.baggage && schedule.baggage.length > 0 ? (
                <div className="space-y-4">
                  {schedule.baggage.map((baggage) => (
                    <BaggageItem
                      key={baggage.baggage_id}
                      baggage={baggage}
                      quantity={selectedBaggage.find(sel => sel.item.baggage_id === baggage.baggage_id)?.quantity || 0}
                      onQuantityChange={(quantity) => handleBaggageChange(baggage.baggage_id, quantity)}
                    />
                  ))}
                  
                  {/* Validation Errors */}
                  {!baggageValidation.isValid && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {baggageValidation.errors.join('. ')}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Total Price */}
                  {baggageValidation.totalPrice > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        Total bagaje: {baggageValidation.totalPrice.toFixed(2)} EUR
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nu sunt bagaje suplimentare disponibile pentru această rută.
                  </p>
                  {schedule.luggage && (
                    <p className="mt-2 text-sm">{schedule.luggage}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Tab */}
        <TabsContent value="policy" className="space-y-4">
          <div className="grid gap-4">
            {/* Cancel Policy */}
            {schedule.cancel_policy && (
              <Card>
                <CardHeader>
                  <CardTitle>Politica de Anulare</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {schedule.cancel_policy.description && (
                    <p className="text-sm">{schedule.cancel_policy.description}</p>
                  )}
                  
                  {/* Refund Calculator */}
                  <div className="space-y-3">
                    <Label>Calculator de rambursare (estimativ)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={refundHours}
                        onChange={(e) => setRefundHours(Number(e.target.value))}
                        placeholder="Ore înainte de plecare"
                        className="w-40"
                      />
                      <span className="text-sm text-muted-foreground">ore înainte</span>
                    </div>
                    
                    {refundEstimate && (
                      <div className="p-3 bg-muted rounded-lg space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Rambursare estimată:</span> {refundEstimate.refundPercentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Din 100 EUR → {refundEstimate.refundAmount.toFixed(2)} EUR rambursare
                        </p>
                        {refundEstimate.isFreeCancel && (
                          <Badge variant="secondary" className="text-xs">Anulare gratuită</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Constraints */}
            {bookingConstraints && (
              <Card>
                <CardHeader>
                  <CardTitle>Reguli de Rezervare</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge variant={bookingConstraints.canBuy ? "default" : "secondary"}>
                        {bookingConstraints.canBuy ? "Cumpără" : "Nu disponibil"}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={bookingConstraints.canReserve ? "default" : "secondary"}>
                        {bookingConstraints.canReserve ? "Rezervă" : "Nu disponibil"}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={bookingConstraints.canRequest ? "default" : "secondary"}>
                        {bookingConstraints.canRequest ? "Cerere" : "Nu disponibil"}
                      </Badge>
                    </div>
                  </div>
                  
                  {bookingConstraints.restrictions.length > 0 && (
                    <div className="space-y-1">
                      {bookingConstraints.restrictions.map((restriction, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {restriction}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Booking Tab */}
        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finalizare Rezervare</CardTitle>
              <CardDescription>
                Verifică detaliile și continuă cu rezervarea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-medium">Rezumat comandă:</h4>
                <div className="text-sm space-y-1">
                  <p>Ruta: {schedule.route_name}</p>
                  <p>Operator: {schedule.carrier}</p>
                  {selectedBaggage.length > 0 && (
                    <div>
                      <p>Bagaje selectate:</p>
                      <ul className="ml-4 space-y-1">
                        {selectedBaggage.map((sel, index) => (
                          <li key={index}>
                            {sel.quantity}x {sel.item.baggage_title} - {sel.total_price.toFixed(2)} EUR
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Total bagaje:</span>
                <span className="font-bold">{baggageValidation.totalPrice.toFixed(2)} EUR</span>
              </div>
              
              <Alert>
                <AlertDescription>
                  Prețul final al biletelor va fi calculat la următorul pas. Prețurile afișate în listă sunt doar orientative.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleBooking}
                disabled={!baggageValidation.isValid || !onBookingSelect}
                className="w-full"
              >
                Continuă cu Rezervarea
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ 
  item, 
  isSelected, 
  onClick 
}: { 
  item: StationTimelineItem; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            item.is_departure ? 'bg-blue-500' : 
            item.is_arrival ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <div>
            <p className="font-medium">{item.station.point_name}</p>
            {item.station.station_name && (
              <p className="text-sm text-muted-foreground">{item.station.station_name}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-medium">{item.time_display}</p>
          <p className="text-xs text-muted-foreground">{item.day_display}</p>
          {item.duration_at_station && (
            <p className="text-xs text-blue-600">{item.duration_at_station}</p>
          )}
        </div>
      </div>
      
      {item.is_transfer && (
        <div className="mt-2 flex items-center gap-1">
          <Badge variant="outline" className="text-xs">Transfer</Badge>
          {item.station.transfer_time && (
            <span className="text-xs text-muted-foreground">
              {item.station.transfer_time.h}h {item.station.transfer_time.m}min
            </span>
          )}
        </div>
      )}
      
      {isSelected && item.station.station_lat && item.station.station_lon && (
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <p>Coordonate: {item.station.station_lat}, {item.station.station_lon}</p>
          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
            Vezi pe hartă
          </Button>
        </div>
      )}
    </div>
  );
}

// Baggage Item Component
function BaggageItem({
  baggage,
  quantity,
  onQuantityChange
}: {
  baggage: import('@/types/getAllRoutes').BaggageItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  const isFree = baggage.price === 0;
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{baggage.baggage_title}</h4>
            {isFree && <Badge variant="secondary" className="text-xs">Gratuit</Badge>}
          </div>
          
          <div className="mt-1 text-sm text-muted-foreground space-y-1">
            {baggage.kg && <p>Greutate: {baggage.kg} kg</p>}
            {baggage.length && baggage.width && baggage.height && (
              <p>Dimensiuni: {baggage.length}×{baggage.width}×{baggage.height} cm</p>
            )}
            {baggage.description && <p>{baggage.description}</p>}
          </div>
          
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            {baggage.max_per_person && (
              <span>Max/persoană: {baggage.max_per_person}</span>
            )}
            {baggage.max_in_bus && (
              <span>Max/autobuz: {baggage.max_in_bus}</span>
            )}
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <p className="font-bold">
            {isFree ? 'Gratuit' : `${baggage.price.toFixed(2)} EUR`}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity === 0}
            >
              -
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
