/**
 * MY TICKETS PAGE
 * 
 * Displays user's paid tickets with download and cancellation options
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { formatBookingPrice } from '@/lib/tripDetailApi';
import { downloadTicketPDF } from '@/lib/ticketDownload';
import { cancelOrder, cancelTicket } from '@/lib/cancelTicketApi';
import { useLocalization } from '@/contexts/LocalizationContext';

interface SavedTicket {
  id: string;
  order_id: number;
  security: string;
  status: 'paid' | 'buy_ok' | 'buy' | 'reserve_ok';
  price_total: number;
    currency: string;
  reservation_until: string;
  created_at: string;
  trips: Array<{
    trip_id: number;
    route_name: string;
    date_from: string;
    time_from: string;
    point_from: string;
    station_from: string;
    point_to: string;
    station_to: string;
    passengers: Array<{
      transaction_id: string;
      name: string;
      surname: string;
      seat: string;
      price: number;
    }>;
  }>;
}

export const MyTickets: React.FC = () => {
  const { t, currentLanguage } = useLocalization();
  const [tickets, setTickets] = useState<SavedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingTickets, setDownloadingTickets] = useState<Set<string>>(new Set());
  const [cancellingTickets, setCancellingTickets] = useState<Set<string>>(new Set());

  // Map app language to locale for date formatting
  const getLocale = (lang: string) => {
    switch (lang) {
      case 'ro':
        return 'ro-RO';
      case 'ru':
        return 'ru-RU';
      case 'uk':
        return 'uk-UA';
      case 'en':
      default:
        return 'en-GB';
    }
  };

  // Load tickets from localStorage on component mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    try {
      const savedTickets = localStorage.getItem('paid_tickets');
      if (savedTickets) {
        const parsedTickets = JSON.parse(savedTickets);
        
        // Remove duplicates based on order_id, keeping the first occurrence
        const uniqueTickets = parsedTickets.filter((ticket: SavedTicket, index: number, self: SavedTicket[]) => 
          index === self.findIndex((t: SavedTicket) => t.order_id === ticket.order_id)
        );
        
        if (uniqueTickets.length !== parsedTickets.length) {
          console.log(`Removed ${parsedTickets.length - uniqueTickets.length} duplicate tickets`);
          localStorage.setItem('paid_tickets', JSON.stringify(uniqueTickets));
        }
        
        setTickets(uniqueTickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError(t('myTickets.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticket: SavedTicket, ticketId?: string) => {
    const downloadKey = ticketId || ticket.order_id.toString();
    setDownloadingTickets(prev => new Set(prev).add(downloadKey));

    try {
      if (ticketId) {
        // Download specific ticket
        await downloadTicketPDF({
          orderId: ticket.order_id,
          security: ticket.security,
          ticketId: parseInt(ticketId)
        });
      } else {
        // Download all tickets for the order
        await downloadTicketPDF({
          orderId: ticket.order_id,
          security: ticket.security
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setError(`${t('myTickets.downloadError')}: ${msg}`);
    } finally {
      setDownloadingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  const handleCancelTicket = async (ticket: SavedTicket, ticketId?: string) => {
    const cancelKey = ticketId || ticket.order_id.toString();
    setCancellingTickets(prev => new Set(prev).add(cancelKey));

    try {
      let result;
      if (ticketId) {
        // Cancel specific ticket
        result = await cancelTicket(parseInt(ticketId), currentLanguage);
      } else {
        // Cancel entire order
        result = await cancelOrder(ticket.order_id, currentLanguage);
      }

      // Check if cancellation was successful OR if order was already canceled
      const isAlreadyCanceled = result.error && 
        (result.error.detal === 'Order already canceled' || 
         result.error.error === 'cancel_order');
      
      if (result.success || isAlreadyCanceled) {
        // Remove ticket from local storage
        const updatedTickets = tickets.filter(tk => tk.id !== ticket.id);
        setTickets(updatedTickets);
        localStorage.setItem('paid_tickets', JSON.stringify(updatedTickets));
        
        // Clear error
        setError(null);
        } else {
        // Handle error object properly
        let errorMessage = t('myTickets.cancelError');
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = `${t('myTickets.cancelError')}: ${result.error}`;
          } else if (result.error.detal) {
            errorMessage = `${t('myTickets.cancelError')}: ${result.error.detal}`;
          } else if (result.error.error) {
            errorMessage = `${t('myTickets.cancelError')}: ${result.error.error}`;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setError(`${t('myTickets.cancelError')}: ${msg}`);
    } finally {
      setCancellingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(cancelKey);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'buy_ok':
      case 'buy':
        return <Badge className="bg-green-100 text-green-800">{t('myTickets.status.paid')}</Badge>;
      case 'reserve_ok':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('myTickets.status.reserved')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(getLocale(currentLanguage), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>{t('myTickets.loadingTickets')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myTickets.title')}</h1>
        <p className="text-gray-600">{t('myTickets.subtitle')}</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {tickets.length === 0 ? (
              <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('myTickets.noTicketsTitle')}</h3>
            <p className="text-gray-600 mb-4">
              {t('myTickets.noTicketsDescription')}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              {t('myTickets.bookNewTrip')}
                  </Button>
                </CardContent>
              </Card>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
              <div>
                    <CardTitle className="text-lg">
                      {t('myTickets.order')} #{ticket.order_id}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(ticket.status)}
                      <span className="text-sm text-gray-500">
                        {t('myTickets.purchasedOn')} {formatDate(ticket.created_at)}
                          </span>
                        </div>
                      </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatBookingPrice(ticket.price_total, ticket.currency)}
                                </div>
                    <div className="text-sm text-gray-500">
                      {ticket.trips.length} {ticket.trips.length > 1 ? t('myTickets.trips') : t('myTickets.trip')}
                        </div>
              </div>
            </div>
                </CardHeader>

              <CardContent className="space-y-4">
                {/* Trip Details */}
                {ticket.trips.map((trip, tripIndex) => (
                  <div key={tripIndex} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{trip.route_name}</h4>
                      <div className="text-sm text-gray-500">
                        {trip.date_from} {t('common.at')} {trip.time_from}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">{trip.point_from}</div>
                          <div className="text-xs text-gray-500">{trip.station_from}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">{trip.point_to}</div>
                          <div className="text-xs text-gray-500">{trip.station_to}</div>
                        </div>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">{t('myTickets.passengers')}</h5>
                      {trip.passengers.map((passenger, passengerIndex) => (
                        <div key={passengerIndex} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {passenger.name} {passenger.surname}
                              </span>
                            <Badge variant="outline" className="text-xs">
                              {t('myTickets.seat')} {passenger.seat}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatBookingPrice(passenger.price, ticket.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleDownloadTicket(ticket)}
                    disabled={downloadingTickets.has(ticket.order_id.toString())}
                    variant="outline"
                    size="sm"
                  >
                    {downloadingTickets.has(ticket.order_id.toString()) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('myTickets.downloading')}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {t('myTickets.downloadAllTickets')}
              </>
            )}
                  </Button>

                  <Button
                    onClick={() => handleCancelTicket(ticket)}
                    disabled={cancellingTickets.has(ticket.order_id.toString())}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {cancellingTickets.has(ticket.order_id.toString()) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('myTickets.cancelling')}
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        {t('myTickets.cancelOrder')}
                      </>
                    )}
                  </Button>

                  {/* Individual ticket actions */}
                  {ticket.trips.map((trip, tripIndex) => 
                    trip.passengers.map((passenger, passengerIndex) => (
                      <div key={`${tripIndex}-${passengerIndex}`} className="flex gap-1">
              <Button 
                          onClick={() => handleDownloadTicket(ticket, passenger.transaction_id)}
                          disabled={downloadingTickets.has(passenger.transaction_id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          {downloadingTickets.has(passenger.transaction_id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                )}
              </Button>
              <Button 
                          onClick={() => handleCancelTicket(ticket, passenger.transaction_id)}
                          disabled={cancellingTickets.has(passenger.transaction_id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          {cancellingTickets.has(passenger.transaction_id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
              </Button>
            </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;