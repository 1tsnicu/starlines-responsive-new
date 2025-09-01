import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Download, 
  FileText, 
  Users, 
  ExternalLink, 
  Globe,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  extractPassengerTickets,
  extractOrderPrintLink,
  generateMultiLanguagePrintLinks,
  openPrintLink,
  downloadTicket
} from '../lib/printTicket';

interface TicketPrintManagerProps {
  buyTicketResponse: {
    order_id: number;
    link: string;
    security?: string;
    price_total: number;
    currency: string;
    [key: string]: unknown;
  };
  passengerNames?: Array<{ firstName: string; lastName: string }>;
  className?: string;
}

export function TicketPrintManager({ 
  buyTicketResponse, 
  passengerNames = [],
  className = "" 
}: TicketPrintManagerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ru');
  
  // Extract ticket data from buy_ticket response
  const orderLink = extractOrderPrintLink(buyTicketResponse);
  const passengerTickets = extractPassengerTickets(buyTicketResponse);
  
  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' }
  ];

  const handleDownloadAllTickets = () => {
    if (orderLink) {
      // Generate link with selected language
      const languageLinks = generateMultiLanguagePrintLinks({
        order_id: orderLink.order_id,
        security: orderLink.security || ''
      }, [selectedLanguage]);
      
      const printUrl = languageLinks[selectedLanguage] || orderLink.link;
      openPrintLink(printUrl, `All Tickets - Order ${orderLink.order_id}`);
    }
  };

  const handleDownloadPassengerTicket = (ticket: ReturnType<typeof extractPassengerTickets>[0]) => {
    // Generate link with selected language
    const languageLinks = generateMultiLanguagePrintLinks({
      ticket_id: ticket.ticket_id,
      security: ticket.security
    }, [selectedLanguage]);
    
    const printUrl = languageLinks[selectedLanguage] || ticket.link;
    const passengerName = passengerNames[ticket.passengerIndex] 
      ? `${passengerNames[ticket.passengerIndex].firstName} ${passengerNames[ticket.passengerIndex].lastName}`
      : `Passenger ${ticket.passengerIndex + 1}`;
    
    openPrintLink(printUrl, `Ticket - ${passengerName}`);
  };

  const getTotalBaggageCost = () => {
    return passengerTickets.reduce((total, ticket) => {
      if (ticket.baggage) {
        return total + ticket.baggage.reduce((bagSum, bag) => bagSum + bag.price, 0);
      }
      return total;
    }, 0);
  };

  const getTotalTicketCost = () => {
    return passengerTickets.reduce((total, ticket) => total + ticket.price, 0);
  };

  if (!orderLink && passengerTickets.length === 0) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nu au fost găsite link-uri de printare în răspunsul de la buy_ticket.
          Verificați că plata a fost procesată cu succes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Printare bilete
              </CardTitle>
              <CardDescription>
                Descărcați biletele în format PDF pentru călătorie
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Comandă finalizată cu succes
          </CardTitle>
          <CardDescription>
            Comanda #{orderLink?.order_id} a fost procesată. Biletele sunt gata pentru printare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Număr comandă:</span>
              <div className="font-medium">#{orderLink?.order_id}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Pasageri:</span>
              <div className="font-medium">{passengerTickets.length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Cost total:</span>
              <div className="font-medium">
                {getTotalTicketCost().toFixed(2)} {passengerTickets[0]?.currency || 'EUR'}
              </div>
            </div>
          </div>
          
          {getTotalBaggageCost() > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Bagaje adiționale:
                </span>
                <span className="font-medium">
                  +{getTotalBaggageCost().toFixed(2)} {passengerTickets[0]?.currency || 'EUR'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download All Tickets */}
      {orderLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Toate biletele
            </CardTitle>
            <CardDescription>
              Descărcați toate biletele dintr-un singur fișier PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleDownloadAllTickets}
              className="w-full"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Descarcă toate biletele
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Individual Passenger Tickets */}
      {passengerTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bilete individuale
            </CardTitle>
            <CardDescription>
              Descărcați biletul pentru fiecare pasager separat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passengerTickets.map((ticket, index) => {
              const passengerName = passengerNames[index] 
                ? `${passengerNames[index].firstName} ${passengerNames[index].lastName}`
                : `Pasager ${index + 1}`;
              
              return (
                <div key={ticket.ticket_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{passengerName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Bilet #{ticket.ticket_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {ticket.price.toFixed(2)} {ticket.currency}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ID: {ticket.passenger_id}
                      </Badge>
                    </div>
                  </div>
                  
                  {ticket.baggage && ticket.baggage.length > 0 && (
                    <div className="mb-3 p-2 bg-muted/50 rounded">
                      <div className="text-xs text-muted-foreground mb-1">Bagaje:</div>
                      <div className="space-y-1">
                        {ticket.baggage.map((bag, bagIndex) => (
                          <div key={bagIndex} className="flex justify-between text-xs">
                            <span>{bag.baggage_title}</span>
                            <span>+{bag.price} {bag.currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => handleDownloadPassengerTicket(ticket)}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descarcă biletul pentru {passengerName}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Important Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Pasagerul trebuie să prezinte exact acest bilet la îmbarcare. 
          Asigurați-vă că aveți biletele printate sau salvate în telefon înainte de călătorie.
          Link-urile de printare sunt valabile doar cu tokenul de securitate asociat comenzii.
        </AlertDescription>
      </Alert>
    </div>
  );
}
