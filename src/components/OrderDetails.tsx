// Order Details component for displaying complete order information
// Shows order status, passengers, tickets, baggage, and payment details

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Users, 
  MapPin, 
  Clock, 
  Ticket, 
  Luggage, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
  Bus
} from 'lucide-react';

import { 
  getOrderInfo, 
  refreshOrderInfo, 
  getOrderStatusInfo, 
  getOrderSummary,
  getAllTicketsFromOrder,
  getTotalBaggageCost,
  canCancelOrder,
  canModifyOrder,
  getOrderPaymentUrl
} from '@/lib/getOrderHttp';

import type { OrderInfo } from '@/types/getOrder';

interface OrderDetailsProps {
  orderId: number;
  security?: string;
  onStatusChange?: (orderInfo: OrderInfo) => void;
  onPaymentClick?: (paymentUrl: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onModifyOrder?: (orderId: string) => void;
  className?: string;
}

export function OrderDetails({
  orderId,
  security,
  onStatusChange,
  onPaymentClick,
  onCancelOrder,
  onModifyOrder,
  className = ''
}: OrderDetailsProps) {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Load order information
   */
  const loadOrderInfo = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      const response = refresh 
        ? await refreshOrderInfo(orderId, security)
        : await getOrderInfo(orderId, security);

      if (response.success && response.data) {
        setOrderInfo(response.data);
        onStatusChange?.(response.data);
      } else {
        setError(response.error?.error || 'Failed to load order information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId, security, onStatusChange]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    loadOrderInfo(true);
  }, [loadOrderInfo]);

  /**
   * Handle payment
   */
  const handlePayment = useCallback(() => {
    if (orderInfo) {
      const paymentUrl = getOrderPaymentUrl(orderInfo);
      if (paymentUrl) {
        onPaymentClick?.(paymentUrl);
      }
    }
  }, [orderInfo, onPaymentClick]);

  /**
   * Load order on mount
   */
  useEffect(() => {
    loadOrderInfo();
  }, [loadOrderInfo]);

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'buy':
        return 'default';
      case 'reserve_ok':
        return 'secondary';
      case 'confirmation':
        return 'outline';
      case 'cancel':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'buy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reserve_ok':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'confirmation':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancel':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading order information...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => loadOrderInfo()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Order information not available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(orderInfo);
  const summary = getOrderSummary(orderInfo);
  const tickets = getAllTicketsFromOrder(orderInfo);
  const baggageCost = getTotalBaggageCost(orderInfo);
  const paymentUrl = getOrderPaymentUrl(orderInfo);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Order #{orderInfo.order_id}
              </CardTitle>
              <CardDescription>
                Security Code: {orderInfo.security}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(orderInfo.status)}>
                {getStatusIcon(orderInfo.status)}
                <span className="ml-1 capitalize">{orderInfo.status.replace('_', ' ')}</span>
              </Badge>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {orderInfo.price} {orderInfo.currency}
              </div>
              <div className="text-sm text-blue-700">Total Price</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.passengerCount}</div>
              <div className="text-sm text-green-700">Passengers</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.routeCount}</div>
              <div className="text-sm text-purple-700">Routes</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{summary.ticketCount}</div>
              <div className="text-sm text-orange-700">Tickets</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {paymentUrl && (
              <Button onClick={handlePayment} className="flex-1 min-w-fit">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
            {canCancelOrder(orderInfo) && (
              <Button 
                onClick={() => onCancelOrder?.(orderInfo.order_id)} 
                variant="destructive"
                size="sm"
              >
                Cancel Order
              </Button>
            )}
            {canModifyOrder(orderInfo) && (
              <Button 
                onClick={() => onModifyOrder?.(orderInfo.order_id)} 
                variant="outline"
                size="sm"
              >
                Modify Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Routes and Passengers */}
      {orderInfo.routes.route.map((route, routeIndex) => (
        <Card key={route.route_id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              {route.route_name}
            </CardTitle>
            <CardDescription>
              Route ID: {route.route_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">From:</span> {route.station_from}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">To:</span> {route.station_to}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Departure:</span> {route.date_from} {route.time_from}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Arrival:</span> {route.date_to} {route.time_to}
                </div>
              </div>
            </div>

            <Separator />

            {/* Passengers */}
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Passengers ({route.passengers.passenger.length})
              </h5>
              <div className="space-y-3">
                {route.passengers.passenger.map((passenger, passengerIndex) => (
                  <div key={passengerIndex} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {passenger.client_name} {passenger.client_surname}
                          </span>
                        </div>
                        {passenger.client_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{passenger.client_phone}</span>
                          </div>
                        )}
                        {passenger.client_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{passenger.client_email}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Seat:</span> {passenger.seat}
                        </div>
                        {passenger.client_birth_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{passenger.client_birth_date}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tickets for this passenger */}
                    {passenger.ticket.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-2">
                          {passenger.ticket.map((ticket, ticketIndex) => (
                            <Badge key={ticketIndex} variant="outline">
                              Ticket #{ticket.ticket_id} - {ticket.ticket_status}
                              {ticket.price && ` (${ticket.price} ${orderInfo.currency})`}
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

      {/* Baggage Information */}
      {(orderInfo.baggage && orderInfo.baggage.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Luggage className="h-5 w-5" />
              Baggage Information
            </CardTitle>
            <CardDescription>
              Total baggage cost: {baggageCost.total} {baggageCost.currency}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orderInfo.baggage.map((baggage, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{baggage.baggage_name}</div>
                    <div className="text-sm text-muted-foreground">{baggage.baggage_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{baggage.price} {baggage.currency}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      {orderInfo.pay_method && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderInfo.pay_transaction && (
                <div>
                  <span className="font-medium">Transaction ID:</span> {orderInfo.pay_transaction}
                </div>
              )}
              
              {orderInfo.pay_method.system.length > 0 && (
                <div>
                  <h6 className="font-medium mb-2">Available Payment Methods:</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {orderInfo.pay_method.system.map((system, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="font-medium">{system.system_title}</div>
                        <div className="text-sm text-muted-foreground">{system.system_name}</div>
                        {system.fee && (
                          <div className="text-sm">Fee: {system.fee} {system.currency}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bonus and Promocode Information */}
      {(orderInfo.bonus || orderInfo.promocode_info) && (
        <Card>
          <CardHeader>
            <CardTitle>Discounts & Bonuses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderInfo.promocode_info && orderInfo.promocode_info.applied && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-800">Promocode Applied</div>
                <div className="text-sm text-green-700">
                  Code: {orderInfo.promocode_info.promocode}
                </div>
                {orderInfo.promocode_info.discount_amount && (
                  <div className="text-sm text-green-700">
                    Discount: {orderInfo.promocode_info.discount_amount} {orderInfo.currency}
                  </div>
                )}
              </div>
            )}
            
            {orderInfo.bonus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium text-blue-800">Bonus Points</div>
                {orderInfo.bonus.points_earned && (
                  <div className="text-sm text-blue-700">
                    Points Earned: {orderInfo.bonus.points_earned}
                  </div>
                )}
                {orderInfo.bonus.points_used && (
                  <div className="text-sm text-blue-700">
                    Points Used: {orderInfo.bonus.points_used}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
