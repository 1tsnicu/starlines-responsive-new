import React, { useState, useEffect } from 'react';
import { useRouteSearch, RouteSummary } from '@/lib/bussystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MapPin, 
  Users, 
  Banknote, 
  Bus,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { format } from 'date-fns';

interface RouteSearchResultsProps {
  fromPointId?: string;
  toPointId?: string;
  date?: string;
  onRouteSelect?: (route: RouteSummary) => void;
  className?: string;
}

export function RouteSearchResults({
  fromPointId,
  toPointId,
  date,
  onRouteSelect,
  className = ""
}: RouteSearchResultsProps) {
  const [session] = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const { data: routes, loading, error } = useRouteSearch({
    from_point_id: fromPointId,
    to_point_id: toPointId,
    date,
    session,
  });

  if (!fromPointId || !toPointId || !date) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Selectați orașul de plecare, destinația și data pentru a căuta rute disponibile.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Se caută rute disponibile...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Eroare la căutarea rutelor:</strong> {error}
          {error.includes('dealer_no_activ') && (
            <div className="mt-2 text-sm">
              <p>Contul dealer necesită activare de către Bussystem.</p>
              <p>Integrarea este completă și va funcționa imediat după activare.</p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Nu au fost găsite rute disponibile pentru această căutare.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Încercați să schimbați data sau destinația.
        </p>
      </div>
    );
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return timeString.length === 5 ? timeString : timeString.substring(0, 5);
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return '';
    // Assuming duration comes in format like "5h 30m" or "5:30"
    return duration;
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (price === undefined || price === null) return 'Preț la cerere';
    return `${price} ${currency || 'MDL'}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rute disponibile</h3>
          <p className="text-sm text-muted-foreground">
            {routes.length} {routes.length === 1 ? 'rută găsită' : 'rute găsite'} 
            {date && ` pentru ${format(new Date(date), 'dd.MM.yyyy')}`}
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Live data
        </Badge>
      </div>

      {routes.map((route, index) => (
        <Card key={route.route_id || index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {formatTime(route.departure_time)}
                    </div>
                    <div className="text-xs text-muted-foreground">plecare</div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute inset-x-0 -top-2 flex justify-center">
                      <div className="bg-background px-2 text-xs text-muted-foreground">
                        {formatDuration(route.duration)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {formatTime(route.arrival_time)}
                    </div>
                    <div className="text-xs text-muted-foreground">sosire</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {route.operator_name && (
                    <div className="flex items-center space-x-1">
                      <Bus className="h-4 w-4" />
                      <span>{route.operator_name}</span>
                    </div>
                  )}
                  
                  {route.bus_type && (
                    <Badge variant="secondary" className="text-xs">
                      {route.bus_type}
                    </Badge>
                  )}
                  
                  {route.free_seats !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {route.free_seats} {route.free_seats === 1 ? 'loc' : 'locuri'} libere
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right space-y-2 ml-6">
                <div className="text-xl font-bold text-primary">
                  {formatPrice(route.price, route.currency)}
                </div>
                
                <Button 
                  onClick={() => onRouteSelect?.(route)}
                  className="w-full"
                  disabled={route.free_seats === 0}
                >
                  {route.free_seats === 0 ? 'Complet ocupat' : 'Selectează'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          Prețurile și disponibilitatea sunt actualizate în timp real
        </p>
      </div>
    </div>
  );
}
