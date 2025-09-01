// components/ReturnJourneySelector.tsx - Selector pentru călătorii dus-întors

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Calendar, ArrowRightLeft, MapPin, Clock, Euro, Users } from 'lucide-react';
import { useReturnJourney } from '../hooks/use-return-journey';
import type { RouteSummary } from '../lib/bussystem';

interface ReturnJourneySelectorProps {
  className?: string;
  onRouteSelect?: (outbound: RouteSummary, returnRoute?: RouteSummary) => void;
}

export function ReturnJourneySelector({ 
  className = '', 
  onRouteSelect 
}: ReturnJourneySelectorProps) {
  const {
    tripBooking,
    outboundRoutes,
    returnRoutes,
    isSearchingOutbound,
    isSearchingReturn,
    error,
    searchOutbound,
    selectOutbound,
    searchReturn,
    selectReturn,
    clearSelection,
    toggleRoundTrip,
    getMinReturnDate,
    isReturnDateValid,
  } = useReturnJourney();

  const [searchForm, setSearchForm] = useState({
    id_from: '',
    id_to: '',
    date_outbound: '',
    date_return: '',
    station_id_from: '',
    station_id_to: '',
  });

  const handleSearch = async () => {
    if (!searchForm.id_from || !searchForm.id_to || !searchForm.date_outbound) {
      return;
    }

    await searchOutbound({
      id_from: searchForm.id_from,
      id_to: searchForm.id_to,
      date: searchForm.date_outbound,
      station_id_from: searchForm.station_id_from || undefined,
      station_id_to: searchForm.station_id_to || undefined,
    });
  };

  const handleOutboundSelect = (route: RouteSummary) => {
    selectOutbound(route, {
      id_from: searchForm.id_from,
      id_to: searchForm.id_to,
      date: searchForm.date_outbound,
      station_id_from: searchForm.station_id_from || undefined,
      station_id_to: searchForm.station_id_to || undefined,
    });
    
    if (!tripBooking.isRoundTrip) {
      onRouteSelect?.(route);
    }
  };

  const handleReturnSearch = async () => {
    if (!searchForm.date_return || !isReturnDateValid(searchForm.date_return)) {
      return;
    }
    
    await searchReturn(searchForm.date_return);
  };

  const handleReturnSelect = (route: RouteSummary) => {
    selectReturn(route);
    
    if (tripBooking.outbound?.selected_route) {
      onRouteSelect?.(tripBooking.outbound.selected_route, route);
    }
  };

  const formatPrice = (price?: string, currency?: string) => {
    if (!price) return 'N/A';
    return `${price} ${currency || 'EUR'}`;
  };

  const formatTime = (time?: string) => {
    if (!time) return 'N/A';
    return time.substring(0, 5); // HH:MM
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Round Trip Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tip călătorie</CardTitle>
              <CardDescription>
                Selectați dacă doriți bilet dus-întors
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="round-trip">Dus-întors</Label>
              <Switch
                id="round-trip"
                checked={tripBooking.isRoundTrip}
                onCheckedChange={toggleRoundTrip}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Căutare rute</CardTitle>
          <CardDescription>
            Introduceți detaliile călătoriei
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search inputs would go here - simplified for demo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>De la (ID punct)</Label>
              <input
                type="text"
                value={searchForm.id_from}
                onChange={(e) => setSearchForm(prev => ({ ...prev, id_from: e.target.value }))}
                placeholder="ex: 3"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <Label>Către (ID punct)</Label>
              <input
                type="text"
                value={searchForm.id_to}
                onChange={(e) => setSearchForm(prev => ({ ...prev, id_to: e.target.value }))}
                placeholder="ex: 6"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data dus</Label>
              <input
                type="date"
                value={searchForm.date_outbound}
                onChange={(e) => setSearchForm(prev => ({ ...prev, date_outbound: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>
            {tripBooking.isRoundTrip && (
              <div>
                <Label>Data retur</Label>
                <input
                  type="date"
                  value={searchForm.date_return}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, date_return: e.target.value }))}
                  min={getMinReturnDate() || undefined}
                  className="w-full p-2 border rounded"
                />
                {getMinReturnDate() && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum: {getMinReturnDate()}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isSearchingOutbound}
            className="w-full"
          >
            {isSearchingOutbound ? 'Căutare...' : 'Căutați rute dus'}
          </Button>
        </CardContent>
      </Card>

      {/* Outbound Routes */}
      {outboundRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rute dus</CardTitle>
            <CardDescription>
              Selectați ruta pentru călătoria dus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outboundRoutes.map((route, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    tripBooking.outbound?.selected_route?.interval_id === route.interval_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleOutboundSelect(route)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{route.trans}</Badge>
                        {route.carrier && (
                          <span className="text-sm text-muted-foreground">{route.carrier}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{route.point_from} → {route.point_to}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(route.time_from)} - {formatTime(route.time_to)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{route.date_from}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(route.price_one_way, route.currency)}
                      </div>
                      {route.free_seats && (
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(route.free_seats) ? route.free_seats.length : route.free_seats} locuri libere
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Return Search Button */}
      {tripBooking.isRoundTrip && tripBooking.outbound && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleReturnSearch}
              disabled={isSearchingReturn || !searchForm.date_return || !isReturnDateValid(searchForm.date_return)}
              className="w-full"
              variant="outline"
            >
              {isSearchingReturn ? 'Căutare retur...' : 'Căutați rute retur'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Return Routes */}
      {returnRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rute retur</CardTitle>
            <CardDescription>
              Selectați ruta pentru călătoria de retur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {returnRoutes.map((route, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    tripBooking.return?.interval_id === route.interval_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleReturnSelect(route)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{route.trans}</Badge>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        {route.carrier && (
                          <span className="text-sm text-muted-foreground">{route.carrier}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{route.point_from} → {route.point_to}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(route.time_from)} - {formatTime(route.time_to)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{route.date_from}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(route.price_one_way, route.currency)}
                      </div>
                      {route.free_seats && (
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(route.free_seats) ? route.free_seats.length : route.free_seats} locuri libere
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {(tripBooking.outbound || tripBooking.return) && (
        <Card>
          <CardHeader>
            <CardTitle>Rezumat selecție</CardTitle>
          </CardHeader>
          <CardContent>
            {tripBooking.outbound?.selected_route && (
              <div className="space-y-2">
                <div className="font-medium">Dus:</div>
                <div className="text-sm text-muted-foreground pl-4">
                  {tripBooking.outbound.selected_route.point_from} → {tripBooking.outbound.selected_route.point_to}
                  <br />
                  {tripBooking.outbound.date_go} | {formatTime(tripBooking.outbound.selected_route.time_from)}
                  <br />
                  {formatPrice(tripBooking.outbound.selected_route.price_one_way, tripBooking.outbound.selected_route.currency)}
                </div>
              </div>
            )}
            
            {tripBooking.return && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="font-medium">Retur:</div>
                  <div className="text-sm text-muted-foreground pl-4">
                    {tripBooking.return.point_from} → {tripBooking.return.point_to}
                    <br />
                    {tripBooking.return.date_from} | {formatTime(tripBooking.return.time_from)}
                    <br />
                    {formatPrice(tripBooking.return.price_one_way, tripBooking.return.currency)}
                  </div>
                </div>
              </>
            )}
            
            <Separator className="my-4" />
            <Button 
              onClick={clearSelection} 
              variant="outline" 
              className="w-full"
            >
              Resetează selecția
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
