// src/pages/PaymentDemo.tsx - Demo page for payment system
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Play,
  RefreshCw
} from 'lucide-react';
import { BookingForm } from '@/components/BookingForm';
import type { TripMeta, Passenger, ReservationInfo } from '@/types/newOrder';
import type { TicketPurchaseResult } from '@/types/buyTicket';

export default function PaymentDemo() {
  const [currentStep, setCurrentStep] = useState<'demo' | 'booking' | 'payment' | 'success'>('demo');
  const [reservation, setReservation] = useState<ReservationInfo | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<TicketPurchaseResult | null>(null);

  // Mock data for demo - using real interval_id from API with available seats
  const mockTrips: TripMeta[] = [
    {
      date: '2025-09-16',
      interval_id: 'local|100184|MjI4MXwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8OTc=|--|YWxsfDIwMjUtMDktMTZ8M3w2fHx8MA==|25|1758103200||2025-09-15T09:11:45||a1eadce4',
      seatsPerPassenger: ['2', '3'], // Using available seats from API
      segments: 1,
      needOrderData: false, // This route has need_orderdata: false
      needBirth: false, // This route has need_birth: false
      discounts: { '1': '34835' }, // Discount for second passenger
      baggagePaidIdsPerPassenger: ['82,86', '84'] // Baggage for each passenger
    }
  ];

  const mockPassengers: Passenger[] = [
    {
      name: 'Anna',
      surname: 'Ivanova',
      birth_date: '1992-01-01'
    },
    {
      name: 'Masha',
      surname: 'Ivanova',
      birth_date: '2020-02-02'
    }
  ];

  const handleReservationComplete = (reservationInfo: ReservationInfo) => {
    setReservation(reservationInfo);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (result: TicketPurchaseResult) => {
    setPurchaseResult(result);
    setCurrentStep('success');
  };

  const resetDemo = () => {
    setCurrentStep('demo');
    setReservation(null);
    setPurchaseResult(null);
  };

  const startBooking = () => {
    setCurrentStep('booking');
  };

  if (currentStep === 'demo') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Demo Sistem de Plată - Bussystem API
          </CardTitle>
        </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Această pagină demonstrează sistemul complet de plată integrat cu API-ul Bussystem.
              Fluxul include rezervarea, timer de 30 minute, și finalizarea plății cu emiterea biletelor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">1</span>
                    </div>
                    <h3 className="font-semibold">Rezervare</h3>
                    <p className="text-sm text-muted-foreground">
                      Completează datele pasagerilor și confirmă rezervarea
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="h-6 w-6 text-orange-600" />
              </div>
                    <h3 className="font-semibold">Timer de Plată</h3>
                    <p className="text-sm text-muted-foreground">
                      30 minute pentru a finaliza plata, cu avertismente
                    </p>
              </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
                    <h3 className="font-semibold">Bilete Emise</h3>
                    <p className="text-sm text-muted-foreground">
                      Biletele sunt generate și pot fi descărcate
                    </p>
              </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Caracteristici Implementate:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Integrare completă cu new_order API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Timer de rezervare cu avertismente</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Integrare cu buy_ticket API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Gestionare erori și timeout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Afișare bilete cu bagaje</span>
              </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Linkuri pentru descărcare PDF</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={startBooking} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Începe Demo-ul
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi la Căutare
              </Button>
          </div>
        </CardContent>
      </Card>

        {/* Mock Data Preview */}
      <Card>
        <CardHeader>
            <CardTitle>Date Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Rute:</h4>
                <div className="space-y-1 text-sm">
                  <div>Praga → Kiev (2024-01-15)</div>
                  <div>2 pasageri, locuri 3,4</div>
                  <div>Reduceri și bagaje incluse</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pasageri:</h4>
                <div className="space-y-1 text-sm">
                  <div>Anna Ivanova (1992-01-01)</div>
                  <div>Masha Ivanova (2020-02-02)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'booking') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={resetDemo}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
          <h1 className="text-2xl font-bold">Rezervare Bilet</h1>
          </div>

        <BookingForm
          trips={mockTrips}
          passengers={mockPassengers}
          onPassengersChange={() => {}} // Mock - not used in demo
          onReservationComplete={handleReservationComplete}
        />
      </div>
    );
  }

  if (currentStep === 'payment' && reservation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={resetDemo}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
          <h1 className="text-2xl font-bold">Plată</h1>
        </div>

        <div className="text-center mb-6">
          <Badge className="mb-2">Rezervare Confirmată</Badge>
          <p className="text-muted-foreground">
            ID Comandă: {reservation.order_id} | 
            Total: {reservation.price_total} {reservation.currency}
          </p>
          </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            În demo-ul real, aici ar apărea PaymentFlow component cu timer.
          </p>
          <Button onClick={() => handlePaymentComplete({
            success: true,
            orderId: reservation.order_id,
            priceTotal: reservation.price_total,
            currency: reservation.currency,
            tickets: [
              {
                passenger_id: 0,
                transaction_id: 'demo_txn_1',
                ticket_id: 'demo_ticket_1',
                security: 'demo_sec_1',
                price: 90,
                currency: 'EUR',
                link: 'https://demo.com/ticket/1',
                baggage: []
              },
              {
                passenger_id: 1,
                transaction_id: 'demo_txn_2', 
                ticket_id: 'demo_ticket_2',
                security: 'demo_sec_2',
                price: 45,
                currency: 'EUR',
                link: 'https://demo.com/ticket/2',
                baggage: []
              }
            ],
            printUrl: 'https://demo.com/print/all'
          })}>
            Simulează Plata (Demo)
          </Button>
              </div>
            </div>
    );
  }

  if (currentStep === 'success' && purchaseResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={resetDemo}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Demo Nou
          </Button>
          <h1 className="text-2xl font-bold">Plată Completată</h1>
              </div>

        <div className="text-center mb-6">
          <Badge className="mb-2 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Succes
          </Badge>
          <p className="text-muted-foreground">
            Biletele au fost emise cu succes!
          </p>
            </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            În demo-ul real, aici ar apărea PaymentSuccess component cu biletele.
          </p>
          <div className="space-y-2">
            <p>Order ID: {purchaseResult.orderId}</p>
            <p>Total: {purchaseResult.priceTotal} {purchaseResult.currency}</p>
            <p>Bilete: {purchaseResult.tickets.length}</p>
          </div>
        </div>
    </div>
  );
}

  return null;
}