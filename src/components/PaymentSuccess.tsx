// src/components/PaymentSuccess.tsx - Payment Success with Ticket Display
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Download, 
  Copy, 
  Ticket, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  Package,
  Euro,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentSuccessProps, PassengerTicket } from '@/types/buyTicket';

export function PaymentSuccess({ result, onContinue }: PaymentSuccessProps) {
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const handleDownloadTicket = (ticket: PassengerTicket) => {
    // Open ticket link in new tab
    window.open(ticket.link, '_blank');
  };

  const handleDownloadAllTickets = () => {
    // Open main print URL in new tab
    window.open(result.printUrl, '_blank');
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(result.orderId.toString());
      setCopiedOrderId(true);
      toast.success('ID-ul comenzii a fost copiat!');
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (err) {
      toast.error('Nu s-a putut copia ID-ul comenzii');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const formatBaggageTitle = (baggage: any) => {
    return baggage.baggage_title || baggage.baggage_type_abbreviated || 'Bagaj';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Plată Completată cu Succes!
              </h1>
              <p className="text-green-700 mt-1">
                Biletele tale au fost emise și sunt gata pentru descărcare.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Detalii Comandă
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">ID Comandă</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{result.orderId}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyOrderId}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {copiedOrderId && (
                <div className="text-xs text-green-600">Copiat!</div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Plătit</div>
              <div className="text-xl font-bold text-primary">
                {formatPrice(result.priceTotal, result.currency)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmat
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleDownloadAllTickets} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descarcă Toate Biletele
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(result.printUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Deschide în Tab Nou
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Tickets */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Biletele Tale</h2>
        
        {result.tickets.map((ticket, index) => (
          <Card key={ticket.ticket_id} className="border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Pasager {ticket.passenger_id + 1}
                </CardTitle>
                <Badge variant="outline">
                  Bilet #{ticket.ticket_id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ticket Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Preț Bilet</div>
                  <div className="text-lg font-semibold">
                    {formatPrice(ticket.price, ticket.currency)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">ID Tranzacție</div>
                  <div className="font-mono text-sm">{ticket.transaction_id}</div>
                </div>
              </div>

              {/* Baggage */}
              {ticket.baggage && ticket.baggage.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Bagaje
                  </div>
                  <div className="space-y-1">
                    {ticket.baggage.map((baggage, baggageIndex) => (
                      <div key={baggageIndex} className="flex justify-between items-center text-sm">
                        <span>{formatBaggageTitle(baggage)}</span>
                        <span className="font-medium">
                          {baggage.price > 0 ? formatPrice(baggage.price, baggage.currency) : 'Gratuit'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDownloadTicket(ticket)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descarcă Bilet
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(ticket.link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Important Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Informații Importante
            </h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• Biletele au fost trimise pe adresa de email specificată</li>
              <li>• Păstrează ID-ul comenzii pentru referințe viitoare</li>
              <li>• Biletele pot fi descărcate oricând folosind linkurile de mai sus</li>
              <li>• Pentru întrebări sau suport, contactează serviciul de clienți</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button onClick={onContinue} size="lg" className="px-8">
          Continuă la Căutare
        </Button>
      </div>
    </div>
  );
}
