// src/components/BussystemRouteResults.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Wifi, Zap, Snowflake, Music, Tv, Star, MessageCircle } from 'lucide-react';
import { RouteSummary, getFreeSeats } from '@/lib/bussystem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DealerErrorDisplay } from './DealerErrorDisplay';
import { useLocalization } from '@/contexts/LocalizationContext';

interface BussystemRouteResultsProps {
  routes: RouteSummary[];
  loading: boolean;
  error: string | null;
  onRouteSelect: (route: RouteSummary) => void;
}

// Helper to parse comfort amenities
function parseComfort(comfort?: string) {
  if (!comfort) return [];
  
  const amenities = comfort.split(',');
  const icons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="h-4 w-4" />,
    '220v': <Zap className="h-4 w-4" />,
    conditioner: <Snowflake className="h-4 w-4" />,
    music: <Music className="h-4 w-4" />,
    tv: <Tv className="h-4 w-4" />,
  };
  
  return amenities.map(amenity => ({
    name: amenity.trim(),
    icon: icons[amenity.trim()] || null
  }));
}

// Helper to format duration
function formatDuration(timeInWay?: string, t?: (k: string) => string) {
  if (!timeInWay) return '';
  const [hours, minutes] = timeInWay.split(':');
  const h = t ? t('duration.h') : 'h';
  const m = t ? t('duration.m') : 'm';
  return `${hours}${h} ${minutes}${m}`;
}

// Route card component
function RouteCard({ route, onSelect, t }: { route: RouteSummary; onSelect: () => void; t: (k: string) => string }) {
  const [showDetails, setShowDetails] = useState(false);
  const [seatInfo, setSeatInfo] = useState<Record<string, any> | null>(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  
  const comfortItems = parseComfort(route.comfort);
  
  const handleShowSeats = async () => {
    if (route.request_get_free_seats === 1) {
      setLoadingSeats(true);
      try {
        const seats = await getFreeSeats({
          interval_id: route.interval_id,
          date: route.date_from,
        });
        setSeatInfo(seats as any);
        setShowDetails(true);
      } catch (error) {
        console.error('Error fetching seats:', error);
      } finally {
        setLoadingSeats(false);
      }
    } else {
      setShowDetails(true);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base md:text-lg font-semibold break-words">
              {route.carrier} - {route.route_name}
            </CardTitle>
            {/* Route and timing */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{route.time_from} → {route.time_to}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[200px] sm:max-w-none">{route.point_from} → {route.point_to}</span>
              </div>
              {route.time_in_way && (
                <Badge variant="secondary" className="whitespace-nowrap">{formatDuration(route.time_in_way, t)}</Badge>
              )}
            </div>
            {/* Amenities */}
            {comfortItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {comfortItems.map((item, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {item.icon}
                    <span className="text-xs">{item.name}</span>
                  </Badge>
                ))}
              </div>
            )}
            {/* Rating and reviews */}
            {(route.rating || route.reviews) && (
              <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                {route.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{route.rating}</span>
                  </div>
                )}
                {route.reviews && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{route.reviews} {t('transport.reviews')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Price and actions */}
          <div className="text-left md:text-right md:w-48 flex md:block items-center justify-between gap-4">
            <div>
              <div className="text-xl md:text-2xl font-bold leading-tight">
                {route.price_one_way} {route.currency}
              </div>
              {route.bonus_eur && (
                <div className="text-xs md:text-sm text-green-600">
                  +{route.bonus_eur} EUR {t('bussystem.bonus')}
                </div>
              )}
            </div>
            <div className="flex md:flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShowSeats}
                disabled={loadingSeats}
                className="whitespace-nowrap"
              >
                {loadingSeats ? t('common.loading') : t('bussystem.seats')}
              </Button>
              <Button onClick={onSelect} size="sm" className="whitespace-nowrap">
                {t('common.select')}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent>
          <div className="border-t pt-4">
            {/* Seat information */}
            {seatInfo && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">{t('bussystem.availableSeatsTitle')}</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {t('bussystem.free')} {seatInfo.free_seats ? String(seatInfo.free_seats) : t('bussystem.unknown')}
                    </span>
                  </div>
                  {seatInfo.total_seats && (
                    <span className="text-sm text-muted-foreground">
                      {t('bussystem.of')} {String(seatInfo.total_seats)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation policy */}
            {route.cancel_hours_info && route.cancel_hours_info.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">{t('bussystem.refundPolicy')}</h4>
                <div className="space-y-2">
                  {route.cancel_hours_info.map((policy, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {t('bussystem.before')} {policy.hours_before_depar}{t('bussystem.hours')} {t('bussystem.beforeDeparture')}: {t('bussystem.refund')} {policy.money_back}% ({t('bussystem.fee')} {policy.cancel_rate}%)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {route.cancel_free_min && (
              <Alert>
                <AlertDescription>
                  {t('bussystem.freeCancelWithinPrefix')} {route.cancel_free_min} {t('bussystem.minutes')} {t('bussystem.freeCancelWithinSuffix')}
                </AlertDescription>
              </Alert>
            )}

            {/* Luggage info */}
            {route.luggage && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">{t('bussystem.luggage')}</h4>
                <p className="text-sm text-muted-foreground">{route.luggage}</p>
              </div>
            )}

            {/* Route info */}
            {route.route_info && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">{t('bussystem.routeInfo')}</h4>
                <p className="text-sm text-muted-foreground">{route.route_info}</p>
              </div>
            )}

            {/* Booking constraints */}
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              {route.lock_min && (
                <div>{t('bussystem.bookingActive')} {route.lock_min} {t('bussystem.minutes')}</div>
              )}
              {route.max_seats && (
                <div>{t('bussystem.max')} {route.max_seats} {t('bussystem.seatsLower')} {t('bussystem.atOnce')}</div>
              )}
              {route.stop_sale_hours && (
                <div>{t('bussystem.stopSale')} {route.stop_sale_hours} {t('bussystem.hoursBeforeDeparture')}</div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function BussystemRouteResults({ routes, loading, error, onRouteSelect }: BussystemRouteResultsProps) {
  const { t } = useLocalization();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t('bussystem.search.searching')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isNoInterval = /interval_no_found/i.test(error);
    const isDealerError = /dealer/i.test(error) || /inactive/i.test(error);
    
    // Show special dealer error display
    if (isDealerError) {
      return <DealerErrorDisplay error={error} onRetry={() => window.location.reload()} />;
    }
    
    return (
      <Alert>
        <AlertDescription>
          {isNoInterval ? (
            <div className="space-y-2">
              <div><strong>{t('bussystem.search.noRoutesTitle')}</strong></div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{t('bussystem.search.tip1')}</li>
                <li>{t('bussystem.search.tip2')}</li>
                <li>{t('bussystem.search.tip3')}</li>
                <li>{t('bussystem.search.tip4')}</li>
                <li>{t('bussystem.search.tip5')}</li>
              </ul>
              <div className="text-xs text-muted-foreground break-all">{t('bussystem.search.apiError')} interval_no_found</div>
            </div>
          ) : (
            <>{t('bussystem.search.searchError')} {error}</>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!routes.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('bussystem.search.noneTitle')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('bussystem.search.noneSuggestion')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-lg font-semibold">
          {t('search.routesFound')}: {routes.length}
        </h3>
        <Badge variant="outline" className="w-fit">
          {routes[0]?.trans === 'bus' ? t('transport.bus') : t('transport.train')}
        </Badge>
      </div>
      <div className="space-y-4">
        {routes.map((route, index) => (
          <RouteCard 
            key={`${route.interval_id}-${index}`}
            route={route}
            onSelect={() => onRouteSelect(route)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

// Export default for compatibility
export default BussystemRouteResults;
