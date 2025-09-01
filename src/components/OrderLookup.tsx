// Order Lookup Component for Customer Service
// Quick order search and details display

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { getOrderInfo } from '@/lib/getOrderHttp';
import type { OrderInfo } from '@/types/getOrder';

interface OrderLookupProps {
  defaultOrderId?: string;
  onOrderFound?: (order: OrderInfo) => void;
  className?: string;
  showFullDetails?: boolean;
}

export function OrderLookup({
  defaultOrderId = '',
  onOrderFound,
  className = '',
  showFullDetails = true
}: OrderLookupProps) {
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!orderId || orderId.length < 3) {
      setError('Vă rugăm introduceți un ID de comandă valid');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await getOrderInfo(parseInt(orderId));
      
      if (response.success && response.data) {
        setOrder(response.data);
        onOrderFound?.(response.data);
      } else {
        setError(response.error?.error || 'Comanda nu a fost găsită');
      }
    } catch (err) {
      setError('Eroare de conexiune. Vă rugăm încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmat':
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'anulat':
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'în așteptare':
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={className}>
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Căutare Comandă
          </CardTitle>
          <CardDescription>
            Introduceți ID-ul comenzii pentru a vedea detaliile complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="orderId" className="sr-only">ID Comandă</Label>
              <Input
                id="orderId"
                placeholder="ID Comandă (ex: 1026448)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-base sm:text-sm"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !orderId} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Search className="h-4 w-4 mr-2 sm:mr-0" />
              <span className="sm:hidden">Caută</span>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Order Results */}
      {order && (
        <div className="space-y-4 mt-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Comandă #{order.order_id}</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {order.routes.route[0]?.station_from} → {order.routes.route[0]?.station_to} | {order.routes.route[0]?.time_from}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Data Plecare</div>
                  <div className="font-medium text-sm sm:text-base">{order.routes.route[0]?.date_from}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total</div>
                  <div className="font-medium text-sm sm:text-base">{order.currency} {order.price}</div>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="text-sm font-medium text-muted-foreground">Pasageri</div>
                  <div className="font-medium text-sm sm:text-base">{order.routes.route[0]?.passengers.passenger.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-3 sm:p-4"
              onClick={() => copyToClipboard(order.order_id.toString(), 'order-id')}
            >
              {copiedItem === 'order-id' ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <Copy className="mr-2 h-4 w-4 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm">Copiază ID Comandă</span>
            </Button>
            
            {order.url && (
              <Button
                variant="outline"
                className="justify-start h-auto p-3 sm:p-4"
                onClick={() => window.open(order.url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Link Plată</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              className="justify-start h-auto p-3 sm:p-4 sm:col-span-2 lg:col-span-1"
              onClick={() => copyToClipboard(
                `${order.routes.route[0]?.station_from} → ${order.routes.route[0]?.station_to} | ${order.routes.route[0]?.date_from}`,
                'route-info'
              )}
            >
              {copiedItem === 'route-info' ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <Copy className="mr-2 h-4 w-4 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm">Copiază Ruta</span>
            </Button>
          </div>

          {/* Detailed Information */}
          {showFullDetails && (
            <>
              {/* Passengers */}
              {order.routes.route[0]?.passengers.passenger && order.routes.route[0].passengers.passenger.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pasageri ({order.routes.route[0].passengers.passenger.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.routes.route[0].passengers.passenger.map((passenger, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">
                              {passenger.client_name} {passenger.client_surname}
                            </div>
                            {passenger.seat && (
                              <div className="text-sm text-muted-foreground">
                                Locul: {passenger.seat}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">
                            Pasager
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Baggage */}
              {order.baggage && order.baggage.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bagaje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.baggage.map((bag, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{bag.baggage_name}</span>
                          </div>
                          <div className="font-medium">
                            {bag.currency} {bag.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              {(order.routes.route[0]?.passengers.passenger[0]?.client_email || order.routes.route[0]?.passengers.passenger[0]?.client_phone) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informații Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {order.routes.route[0]?.passengers.passenger[0]?.client_email && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.routes.route[0].passengers.passenger[0].client_email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.routes.route[0]?.passengers.passenger[0]?.client_email || '', 'email')}
                          >
                            {copiedItem === 'email' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {order.routes.route[0]?.passengers.passenger[0]?.client_phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Telefon:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.routes.route[0].passengers.passenger[0].client_phone}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.routes.route[0]?.passengers.passenger[0]?.client_phone || '', 'phone')}
                          >
                            {copiedItem === 'phone' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
