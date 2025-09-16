// src/components/BussystemRouteResults.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Wifi, Zap, Snowflake, Music, Tv, Star, MessageCircle } from 'lucide-react';
import { RouteSummary, getFreeSeats, getDiscounts, getPlan } from '@/lib/bussystem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DealerErrorDisplay } from './DealerErrorDisplay';

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
function formatDuration(timeInWay?: string) {
  if (!timeInWay) return '';
  const [hours, minutes] = timeInWay.split(':');
  return `${hours}h ${minutes}m`;
}

// Route card component
function RouteCard({ route, onSelect }: { route: RouteSummary; onSelect: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const [seatInfo, setSeatInfo] = useState<Record<string, unknown> | null>(null);
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
        setSeatInfo(seats);
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
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {route.carrier} - {route.route_name}
            </CardTitle>
            
            {/* Route and timing */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {route.time_from} → {route.time_to}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {route.point_from} → {route.point_to}
                </span>
              </div>
              {route.time_in_way && (
                <Badge variant="secondary">
                  {formatDuration(route.time_in_way)}
                </Badge>
              )}
            </div>

            {/* Amenities */}
            {comfortItems.length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                {comfortItems.map((item, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    {item.icon}
                    <span className="text-xs">{item.name}</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Rating and reviews */}
            {(route.rating || route.reviews) && (
              <div className="flex items-center space-x-2 mt-2">
                {route.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{route.rating}</span>
                  </div>
                )}
                {route.reviews && (
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{route.reviews} отзывов</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price and actions */}
          <div className="text-right">
            <div className="text-2xl font-bold">
              {route.price_one_way} {route.currency}
            </div>
            {route.bonus_eur && (
              <div className="text-sm text-green-600">
                +{route.bonus_eur} EUR бонус
              </div>
            )}
            
            <div className="flex flex-col space-y-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShowSeats}
                disabled={loadingSeats}
              >
                {loadingSeats ? 'Загрузка...' : 'Места'}
              </Button>
              <Button 
                onClick={onSelect}
                size="sm"
              >
                Выбрать
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
                <h4 className="font-medium mb-2">Доступные места:</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Свободно: {seatInfo.free_seats ? String(seatInfo.free_seats) : 'Неизвестно'}
                    </span>
                  </div>
                  {seatInfo.total_seats && (
                    <span className="text-sm text-muted-foreground">
                      из {String(seatInfo.total_seats)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation policy */}
            {route.cancel_hours_info && route.cancel_hours_info.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Политика возврата:</h4>
                <div className="space-y-2">
                  {route.cancel_hours_info.map((policy, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      За {policy.hours_before_depar}ч до отправления: 
                      возврат {policy.money_back}% (комиссия {policy.cancel_rate}%)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {route.cancel_free_min && (
              <Alert>
                <AlertDescription>
                  Бесплатная отмена в течение {route.cancel_free_min} минут после бронирования
                </AlertDescription>
              </Alert>
            )}

            {/* Luggage info */}
            {route.luggage && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Багаж:</h4>
                <p className="text-sm text-muted-foreground">{route.luggage}</p>
              </div>
            )}

            {/* Route info */}
            {route.route_info && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Информация о маршруте:</h4>
                <p className="text-sm text-muted-foreground">{route.route_info}</p>
              </div>
            )}

            {/* Booking constraints */}
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              {route.lock_min && (
                <div>Резервация действует {route.lock_min} минут</div>
              )}
              {route.max_seats && (
                <div>Максимум {route.max_seats} мест за раз</div>
              )}
              {route.stop_sale_hours && (
                <div>Продажа останавливается за {route.stop_sale_hours} часов до отправления</div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function BussystemRouteResults({ routes, loading, error, onRouteSelect }: BussystemRouteResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Поиск маршрутов...</p>
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
              <div><strong>Маршруты не найдены для выбранных параметров.</strong></div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Попробуйте другую дату (часто нет рейсов каждый день)</li>
                <li>Убедитесь что выбраны реальные города через автокомплит (а не пресет ID)</li>
                <li>Попробуйте язык en вместо ru (редко влияет, но можно)</li>
                <li>Удалите параметр change=auto (только прямые рейсы) — нужно обновить код если тестируете</li>
                <li>Если аккаунт ещё не активирован полностью, часть направлений может отсутствовать</li>
              </ul>
              <div className="text-xs text-muted-foreground break-all">Техническая ошибка API: interval_no_found</div>
            </div>
          ) : (
            <>Ошибка при поиске маршрутов: {error}</>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!routes.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Маршруты не найдены</p>
        <p className="text-sm text-muted-foreground mt-1">
          Попробуйте изменить дату или направление
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Найдено маршрутов: {routes.length}
        </h3>
        <Badge variant="outline">
          {routes[0]?.trans === 'bus' ? 'Автобус' : 'Поезд'}
        </Badge>
      </div>

      <div className="space-y-4">
        {routes.map((route, index) => (
          <RouteCard 
            key={`${route.interval_id}-${index}`}
            route={route}
            onSelect={() => onRouteSelect(route)}
          />
        ))}
      </div>
    </div>
  );
}

// Export default for compatibility
export default BussystemRouteResults;
