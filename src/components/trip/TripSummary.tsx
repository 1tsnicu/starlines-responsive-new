/**
 * TRIP SUMMARY COMPONENT
 * 
 * Displays comprehensive trip information including route details,
 * amenities, pricing, and cancellation policies
 * Supports both one-way and round-trip journeys
 */

import React from 'react';
import { 
  Clock, 
  MapPin, 
  Star, 
  Wifi, 
  Zap, 
  Bath, 
  Snowflake, 
  Users, 
  Bus, 
  Shield, 
  CreditCard, 
  Luggage,
  Calendar,
  Timer,
  Euro,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TripSummaryProps } from '@/types/tripDetail';
import { cn } from '@/lib/utils';

// ===============================
// Amenity Icons
// ===============================

const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-4 h-4" />,
    '220v': <Zap className="w-4 h-4" />,
    conditioner: <Snowflake className="w-4 h-4" />,
    wc: <Bath className="w-4 h-4" />,
    music: <div className="w-4 h-4 text-center">🎵</div>,
    tv: <div className="w-4 h-4 text-center">📺</div>,
    luggage: <Luggage className="w-4 h-4" />,
  };
  
  return iconMap[amenity.toLowerCase()] || <div className="w-4 h-4 text-center">✨</div>;
};

const getAmenityLabel = (amenity: string) => {
  const labelMap: Record<string, string> = {
    wifi: 'WiFi',
    '220v': 'Power Outlets',
    conditioner: 'Air Conditioning',
    wc: 'Toilet',
    music: 'Music',
    tv: 'TV',
    luggage: 'Luggage Storage',
  };
  
  return labelMap[amenity.toLowerCase()] || amenity;
};

// ===============================
// Trip Card Component
// ===============================

const TripCard: React.FC<{
  trip: any;
  title: string;
  isReturn?: boolean;
  passengers: number;
  onPassengersChange: (count: number) => void;
}> = ({ trip, title, isReturn = false, passengers, onPassengersChange }) => {
  const {
    route_name,
    carrier,
    rating,
    reviews,
    logo,
    comfort = [],
    time_in_way,
    price_one_way,
    price_one_way_max,
    currency,
    date_from,
    time_from,
    point_from,
    station_from,
    date_to,
    time_to,
    point_to,
    station_to,
    luggage,
    route_info,
    cancel_hours_info = [],
  } = trip;

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `${price.toFixed(2)} ${currency}`;
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds if present
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const comfortAmenities: string[] = Array.isArray(comfort)
    ? (comfort as string[])
    : (typeof comfort === 'string' && comfort.length > 0)
      ? (comfort as string).split(',').map(a => a.trim())
      : [];

  return (
    <Card className={cn("w-full", isReturn ? "border-blue-200 bg-blue-50/30" : "border-gray-200")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{carrier}</span>
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{rating}</span>
                  {reviews && (
                    <span className="text-xs text-gray-500">({reviews})</span>
                  )}
                </div>
              )}
            </div>
          </div>
          {logo && (
            <img 
              src={logo} 
              alt={carrier}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Departure</span>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(date_from)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{formatTime(time_from)}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>{point_from}</div>
                {station_from && (
                  <div className="text-xs text-gray-500">{station_from}</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="font-medium">Arrival</span>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(date_to)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{formatTime(time_to)}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>{point_to}</div>
                {station_to && (
                  <div className="text-xs text-gray-500">{station_to}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        {time_in_way && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Timer className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Duration: {time_in_way}</span>
          </div>
        )}

        {/* Pricing */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-green-800">Price</span>
            <div className="text-right">
              <div className="text-lg font-bold text-green-900">
                {formatPrice(price_one_way)}
              </div>
              {price_one_way_max && price_one_way_max !== price_one_way && (
                <div className="text-xs text-green-700">
                  Up to {formatPrice(price_one_way_max)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Passengers - only show for outbound trip */}
        {!isReturn && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Passengers</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPassengersChange(Math.max(1, passengers - 1))}
                disabled={passengers <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center font-medium">{passengers}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPassengersChange(passengers + 1)}
                disabled={passengers >= 9}
              >
                +
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===============================
// Main Component
// ===============================

const TripSummary: React.FC<TripSummaryProps> = ({
  route,
  returnRoute,
  passengers,
  onPassengersChange,
  isRoundTrip = false,
}) => {
  const {
    comfort: comfortRaw = [],
    luggage,
    route_info,
    cancel_hours_info = [],
  } = route;

  // Normalize comfort to string[] regardless of original form
  const comfortAmenities: string[] = (() => {
    const c: any = comfortRaw;
    if (!c) return [];
    if (Array.isArray(c)) return c as string[];
    if (typeof c === 'string') return c.split(',').map((a: string) => a.trim()).filter(Boolean);
    return [];
  })();

  return (
    <div className="space-y-6">
      {/* Outbound Trip */}
      <TripCard
        trip={route}
        title="Outbound Journey"
        passengers={passengers}
        onPassengersChange={onPassengersChange}
      />

      {/* Return Trip */}
      {isRoundTrip && returnRoute && (
        <>
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-blue-600">
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">Return Journey</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>
          <TripCard
            trip={returnRoute}
            title="Return Journey"
            isReturn={true}
            passengers={passengers}
            onPassengersChange={onPassengersChange}
          />
        </>
      )}

      {/* Total Price for Round Trip */}
      {isRoundTrip && returnRoute && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-green-600" />
                <span className="text-lg font-semibold text-green-800">Base Price</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">
                  {((route.price_one_way || 0) + (returnRoute.price_one_way || 0)).toFixed(2)} {route.currency}
                </div>
                <div className="text-sm text-green-700">
                  Outbound: {route.price_one_way?.toFixed(2)} {route.currency} + 
                  Return: {returnRoute.price_one_way?.toFixed(2)} {route.currency}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  * Final price includes baggage and discounts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amenities */}
      {comfortAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {comfortAmenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {getAmenityIcon(amenity)}
                  {getAmenityLabel(amenity)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Luggage Info */}
      {luggage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Luggage className="w-5 h-5" />
              Luggage Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{luggage}</p>
          </CardContent>
        </Card>
      )}

      {/* Route Info */}
      {route_info && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{route_info}</p>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Policy */}
      {cancel_hours_info.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cancellation Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cancel_hours_info.map((policy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">
                      {policy.hours_before_depar === "0" 
                        ? "Less than 24 hours" 
                        : `${policy.hours_before_depar} hours before departure`
                      }
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      {policy.cancel_rate}% cancellation fee
                    </div>
                    <div className="text-xs text-gray-500">
                      {policy.money_back}% refund
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripSummary;