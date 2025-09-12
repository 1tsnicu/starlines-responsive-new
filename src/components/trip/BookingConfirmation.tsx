/**
 * BOOKING CONFIRMATION COMPONENT
 * 
 * Component for displaying booking confirmation and details
 * Shows order information, passenger details, and payment instructions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  User, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Download,
  Copy
} from 'lucide-react';
import { BookingResponse, TripBookingData, PassengerBookingData } from '@/types/tripDetail';
import { 
  formatBookingPrice, 
  formatBookingDate, 
  formatBookingTime 
} from '@/lib/tripDetailApi';

export interface BookingConfirmationProps {
  bookingResponse: BookingResponse;
  onDownloadTicket?: () => void;
  onCopyOrderId?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingResponse,
  onDownloadTicket,
  onCopyOrderId
}) => {
  const trips = Object.keys(bookingResponse)
    .filter(key => !isNaN(Number(key)))
    .map(key => bookingResponse[key] as TripBookingData);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(bookingResponse.order_id.toString());
    onCopyOrderId?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserve_ok':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reserve_pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserve_error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reserve_ok':
        return 'Reservation Confirmed';
      case 'reserve_pending':
        return 'Reservation Pending';
      case 'reserve_error':
        return 'Reservation Error';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Booking Confirmed
            </CardTitle>
            <Badge className={getStatusColor(bookingResponse.status)}>
              {getStatusText(bookingResponse.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Order ID</div>
              <div className="font-mono text-lg flex items-center gap-2">
                #{bookingResponse.order_id}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOrderId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Total Price</div>
              <div className="text-2xl font-bold">
                {formatBookingPrice(bookingResponse.price_total, bookingResponse.currency)}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Reservation Until</div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatBookingDate(bookingResponse.reservation_until)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {bookingResponse.reservation_until_min} minutes
              </div>
            </div>
          </div>

          {bookingResponse.promocode_info && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="font-medium">Promocode Applied</span>
              </div>
              <div className="text-sm text-green-700">
                {bookingResponse.promocode_info.promocode_name} - 
                Save {formatBookingPrice(bookingResponse.promocode_info.price_promocode, bookingResponse.currency)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trip Details */}
      {trips.map((trip, tripIndex) => (
        <Card key={tripIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {trip.route_name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {trip.carrier} • {trip.trans.toUpperCase()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Departure</div>
                  <div className="font-medium">{trip.point_from}</div>
                  <div className="text-sm">{trip.station_from}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatBookingDate(trip.date_from)} at {formatBookingTime(trip.time_from)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Arrival</div>
                  <div className="font-medium">{trip.point_to}</div>
                  <div className="text-sm">{trip.station_to}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatBookingDate(trip.date_to)} at {formatBookingTime(trip.time_to)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Passenger Details */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Passengers
                </h4>
                
                {trip.passengers.map((passenger, passengerIndex) => (
                  <div key={passengerIndex} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {passenger.name} {passenger.surname}
                      </div>
                      <Badge variant="outline">
                        Seat {passenger.seat}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>Birth: {formatBookingDate(passenger.birth_date)}</div>
                      <div>Price: {formatBookingPrice(passenger.price, bookingResponse.currency)}</div>
                      {passenger.discount && (
                        <div className="text-green-600">Discount: {passenger.discount}</div>
                      )}
                    </div>

                    {/* Baggage Information */}
                    {passenger.baggage && passenger.baggage.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-sm font-medium mb-1">Baggage:</div>
                        <div className="flex flex-wrap gap-1">
                          {passenger.baggage.map((baggage, baggageIndex) => (
                            <Badge key={baggageIndex} variant="secondary" className="text-xs">
                              {baggage.baggage_title} - {formatBookingPrice(baggage.price, baggage.currency)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onDownloadTicket} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Tickets
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Print Confirmation
        </Button>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+375 29 123 45 67</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>support@bussystem.eu</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
