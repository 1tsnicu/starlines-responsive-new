// src/pages/PaymentDemo.tsx - Demo complete payment flow with buy_ticket

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Clock, CheckCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PaymentFlow, PaymentSuccess } from "@/components/PaymentFlow";
import type { NewOrderResponse } from "@/types/newOrder";
import type { TicketPurchaseResult } from "@/types/buy";

export default function PaymentDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'demo' | 'payment' | 'success'>('demo');
  const [purchaseResult, setPurchaseResult] = useState<TicketPurchaseResult | null>(null);

  // Mock reservation data (what you'd get from new_order)
  const mockReservation: NewOrderResponse = {
    order_id: 123456,
    reservation_until: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19), // 30 min from now
    reservation_until_min: "30",
    security: "sec_abc123xyz",
    status: "reserve_ok",
    price_total: 202.50,
    currency: "EUR",
    promocode_info: {
      promocode_valid: 1,
      promocode_name: "PROMO77ENDLESS",
      price_promocode: 37.50
    },
    // Mock trip objects
    "0": {
      passenger_id: 1,
      name: "Ion",
      surname: "Popescu",
      seat: "3",
      price: 67.50,
      baggage: []
    },
    "1": {
      passenger_id: 2,
      name: "Maria", 
      surname: "Ionescu",
      seat: "4",
      price: 62.25,
      baggage: [{ baggage_title: "Bagaj mic", price: 15 }]
    },
    "2": {
      passenger_id: 3,
      name: "Alex",
      surname: "Georgescu", 
      seat: "5",
      price: 72.75,
      baggage: [{ baggage_title: "Bagaj mare", price: 35 }]
    }
  };

  const handleStartPayment = () => {
    setStep('payment');
  };

  const handlePaymentComplete = (result: TicketPurchaseResult) => {
    setPurchaseResult(result);
    setStep('success');
  };

  const handlePaymentCancel = () => {
    setStep('demo');
  };

  const handleSuccessContinue = () => {
    setStep('demo');
    setPurchaseResult(null);
  };

  if (step === 'payment') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PaymentFlow
          reservation={mockReservation}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  if (step === 'success' && purchaseResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PaymentSuccess
          result={purchaseResult}
          onContinue={handleSuccessContinue}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Demo Sistem Plată</h1>
          <p className="text-muted-foreground">
            Testează fluxul complet buy_ticket cu timer și gestionare plată
          </p>
        </div>
      </div>

      {/* Mock Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Rezervare Mock pentru Testare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comanda:</span>
                <span className="font-medium">#{mockReservation.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline">{mockReservation.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valabilă până:</span>
                <span className="font-mono text-sm">{mockReservation.reservation_until}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timer:</span>
                <span className="font-medium">{mockReservation.reservation_until_min} minute</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preț total:</span>
                <span className="font-bold text-lg">{mockReservation.price_total} {mockReservation.currency}</span>
              </div>
              {mockReservation.promocode_info?.promocode_valid === 1 && (
                <div className="flex justify-between text-green-600">
                  <span>Promocode "{mockReservation.promocode_info.promocode_name}":</span>
                  <span>-{mockReservation.promocode_info.price_promocode} {mockReservation.currency}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Inclus: 3 pasageri, 2 călătorii, bagaje, reduceri
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Testare Flux Plată
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Ce vei testa:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Timer live</strong> - countdown 30 minute până la expirarea rezervării</li>
              <li>• <strong>Validări</strong> - verificare timp rămas, status rezervare</li>
              <li>• <strong>Buy_ticket API</strong> - simulare procesare plată cu delay realist</li>
              <li>• <strong>Extragere bilete</strong> - parsare răspuns pentru link-uri per pasager</li>
              <li>• <strong>Gestionare errori</strong> - timeout, rezervare expirată, API errors</li>
              <li>• <strong>UI Success</strong> - afișare link-uri download și rezumat final</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Funcționalități demonstrate:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div>
                <div className="font-medium">Timer Management:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Countdown live cu culori (verde → galben → roșu)</li>
                  <li>Blocare acțiuni la expirare</li>
                  <li>Validare timp minim (1 min) pentru plată</li>
                </ul>
              </div>
              <div>
                <div className="font-medium">Payment Processing:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Simulare API call cu loading state</li>
                  <li>Extragere link-uri per pasager din răspuns</li>
                  <li>Comparare preț final vs inițial</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          <Button 
            onClick={handleStartPayment}
            className="w-full"
            size="lg"
          >
            <Clock className="h-4 w-4 mr-2" />
            Începe Demo Plată - {mockReservation.price_total} {mockReservation.currency}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Demo-ul va simula procesarea unei plăți reale cu toate validările
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Implementare Tehnică</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">API Call buy_ticket:</h4>
              <div className="bg-slate-100 p-3 rounded font-mono text-xs">
                {`POST /curl/buy_ticket.php
{
  "login": "demo_login",
  "password": "demo_password", 
  "json": 1,
  "order_id": ${mockReservation.order_id},
  "lang": "ro",
  "v": "1.1"
}`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Mock Response Structure:</h4>
              <div className="bg-slate-100 p-3 rounded font-mono text-xs">
                {`{
  "order_id": ${mockReservation.order_id},
  "price_total": ${mockReservation.price_total},
  "currency": "${mockReservation.currency}",
  "link": "https://bussystem.com/print/order/...",
  "0": { "ticket_id": "...", "security": "...", "link": "..." },
  "1": { "ticket_id": "...", "security": "...", "link": "..." },
  "2": { "ticket_id": "...", "security": "...", "link": "..." }
}`}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/booking-demo")}>
                Demo Rezervare Completă
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/bussystem-demo")}>
                Demo API Integration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
