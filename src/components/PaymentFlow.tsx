// src/components/PaymentFlow.tsx - Complete payment flow with timer and buy_ticket integration

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  CreditCard, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Users,
  Package,
  Percent
} from "lucide-react";

import { buyTicket } from "@/lib/bussystem";
import {
  createPaymentTimer,
  extractPassengerTickets,
  createPaymentSummary,
  formatTimerDisplay,
  getTimerColorClass,
  canProceedWithPayment,
  formatPrice,
  formatPriceDifference
} from "@/lib/paymentUtils";

import { TicketPrintManager } from "./TicketPrintManager";

import type { NewOrderResponse } from "@/types/newOrder";
import type { 
  PaymentTimer, 
  TicketPurchaseResult,
  PassengerTicketInfo 
} from "@/types/buy";

interface PaymentFlowProps {
  reservation: NewOrderResponse;
  onPaymentComplete: (result: TicketPurchaseResult) => void;
  onCancel: () => void;
}

export function PaymentFlow({ reservation, onPaymentComplete, onCancel }: PaymentFlowProps) {
  const [timer, setTimer] = useState<PaymentTimer>(() => 
    createPaymentTimer(reservation.reservation_until)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(createPaymentTimer(reservation.reservation_until));
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation.reservation_until]);

  const handlePayment = async () => {
    setError(null);
    
    // Final validation before payment
    const validation = canProceedWithPayment(reservation.reservation_until);
    if (!validation.canProceed) {
      setError(validation.reason || "Nu se poate procesa plata");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call buy_ticket API
      const buyResponse = await buyTicket({
        order_id: reservation.order_id,
        lang: "ro",
        v: "1.1"
      });

      // Extract passenger tickets
      const passengerTickets = extractPassengerTickets(buyResponse);
      
      // Create payment summary
      const summary = createPaymentSummary(reservation, buyResponse);

      // Build complete result
      const result: TicketPurchaseResult = {
        success: true,
        order_id: buyResponse.order_id,
        price_total: buyResponse.price_total,
        currency: buyResponse.currency,
        allTicketsLink: buyResponse.link,
        passengerTickets,
        summary,
        rawResponse: buyResponse
      };

      onPaymentComplete(result);
      
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Eroare la procesarea plății");
    } finally {
      setIsProcessing(false);
    }
  };

  const timerColorClass = getTimerColorClass(timer);
  const canPay = !timer.isExpired && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Timer and Status */}
      <Card className={`border-2 ${timer.isExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timp Rămas pentru Plată
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-mono font-bold ${timerColorClass}`}>
              {formatTimerDisplay(timer)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {timer.isExpired 
                ? "Rezervarea a expirat" 
                : "Rezervarea este valabilă până la finalizarea plății"
              }
            </p>
          </div>
          
          {timer.isExpired && (
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Timpul de rezervare a expirat. Vă rugăm să reîncepeți procesul de rezervare.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Rezumatul Plății
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Comanda #{reservation.order_id}</span>
            <Badge variant="outline">{reservation.status}</Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Preț Total:</span>
              <span className="font-semibold text-lg">
                {formatPrice(reservation.price_total, reservation.currency)}
              </span>
            </div>
            
            {reservation.promocode_info?.promocode_valid === 1 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  Promocode "{reservation.promocode_info.promocode_name}"
                </span>
                <span>
                  -{formatPrice(reservation.promocode_info.price_promocode, reservation.currency)}
                </span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p>• Prețul include toate serviciile selectate (bilete, bagaje, reduceri)</p>
            <p>• Plata se procesează securizat prin Bussystem</p>
            <p>• Veți primi biletele electronice după confirmare</p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePayment}
          disabled={!canPay}
          className="flex-1"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Procesez plata...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Confirmă Plata - {formatPrice(reservation.price_total, reservation.currency)}
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Anulează
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="bg-slate-50">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-medium text-slate-900">Informații importante:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Rezervarea este valabilă pentru {reservation.reservation_until_min} minute</li>
              <li>După expirare, comanda se anulează automat</li>
              <li>Biletele vor fi trimise prin email după plată</li>
              <li>Pentru suport: contactați serviciul clienți</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Success component for after payment
interface PaymentSuccessProps {
  result: TicketPurchaseResult;
  onContinue: () => void;
}

export function PaymentSuccess({ result, onContinue }: PaymentSuccessProps) {
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Plata Finalizată cu Succes!
            </h2>
            <p className="text-green-600">
              Comanda #{result.order_id} a fost procesată
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Price Summary */}
      {result.summary.hasPriceDifference && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ajustare preț finală:</strong> 
            {(() => {
              const diff = formatPriceDifference(result.summary.priceDifference, result.currency);
              return (
                <span className={diff.colorClass}>
                  {" "}{diff.formatted} față de prețul inițial
                </span>
              );
            })()}
          </AlertDescription>
        </Alert>
      )}

      {/* Download Links */}
            {/* Ticket Print Manager */}
      <TicketPrintManager 
        buyTicketResponse={result.rawResponse as {
          order_id: number;
          link: string;
          security?: string;
          price_total: number;
          currency: string;
          [key: string]: unknown;
        }}
        passengerNames={result.passengerTickets.map((ticket, index) => ({
          firstName: `Pasager`,
          lastName: `${index + 1}`
        }))}
      />

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full" size="lg">
        Continuă către Contul Meu
      </Button>
    </div>
  );
}
