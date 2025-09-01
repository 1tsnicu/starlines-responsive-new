// src/components/BookingForm.tsx - Complete booking form with new_order integration

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Phone, Mail, Calendar, Clock, MapPin, Ticket, AlertCircle, CheckCircle, Timer } from "lucide-react";
import type { NewOrderPayload, ReservationInfo, Passenger, TripMeta, NewOrderResponse } from "@/types/newOrder";
import type { TicketPurchaseResult } from "@/types/buy";
import { buildNewOrderPayload, validateNewOrderPayload } from "@/lib/newOrderBuilder";
import { newOrder } from "@/lib/bussystem";
import { PaymentFlow, PaymentSuccess } from "./PaymentFlow";

interface BookingFormProps {
  trips: TripMeta[];
  passengers: Passenger[];
  onPassengersChange: (passengers: Passenger[]) => void;
  promocode?: string;
  onPromocodeChange?: (code: string) => void;
  onReservationComplete?: (reservation: ReservationInfo) => void;
}

export function BookingForm({
  trips,
  passengers,
  onPassengersChange,
  promocode,
  onPromocodeChange,
  onReservationComplete
}: BookingFormProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<NewOrderResponse | null>(null);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [purchaseResult, setPurchaseResult] = useState<TicketPurchaseResult | null>(null);

  // Check if passenger data is required
  const needOrderData = trips.some(t => t.needOrderData);
  const needBirth = trips.some(t => t.needBirth);

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    onPassengersChange(newPassengers);
  };

  const validateForm = (): string | null => {
    if (needOrderData) {
      if (!phone.trim()) return "Telefonul este obligatoriu";
      
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.name?.trim()) return `Numele pasagerului ${i + 1} este obligatoriu`;
        if (!p.surname?.trim()) return `Prenumele pasagerului ${i + 1} este obligatoriu`;
      }
    }

    if (needBirth) {
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.birth_date) return `Data nașterii pentru pasagerul ${i + 1} este obligatorie`;
      }
    }

    // Validate seats
    for (let tripIndex = 0; tripIndex < trips.length; tripIndex++) {
      const trip = trips[tripIndex];
      if (trip.seatsPerPassenger.length !== passengers.length) {
        return `Trip ${tripIndex + 1}: Numărul de locuri nu corespunde cu numărul de pasageri`;
      }
      
      for (let passengerIndex = 0; passengerIndex < passengers.length; passengerIndex++) {
        const seatStr = trip.seatsPerPassenger[passengerIndex];
        if (!seatStr) {
          return `Trip ${tripIndex + 1}, Pasager ${passengerIndex + 1}: Locul nu este selectat`;
        }
        
        if (trip.segments && trip.segments > 1) {
          const segments = seatStr.split(',');
          if (segments.length !== trip.segments) {
            return `Trip ${tripIndex + 1}, Pasager ${passengerIndex + 1}: Numărul de segmente nu corespunde`;
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build payload
      const payload = buildNewOrderPayload({
        login: "demo_login", // This would come from auth context
        password: "demo_password", // This would come from auth context
        passengers,
        trips,
        phone: phone || undefined,
        email: email || undefined,
        promocode: promocode || undefined,
        currency: "EUR",
        lang: "ru"
      });

      // Final validation
      validateNewOrderPayload(payload);

      // Submit order
      const response = await newOrder(payload);

      // Store full response for payment flow
      setReservation(response);
      setStep('payment'); // Move to payment step

      // Also call the callback with extracted info
      const reservationInfo: ReservationInfo = {
        order_id: response.order_id,
        security: response.security,
        reservation_until: response.reservation_until,
        reservation_until_min: response.reservation_until_min,
        price_total: response.price_total,
        currency: response.currency,
        status: response.status,
        promocode_info: response.promocode_info
      };
      
      onReservationComplete?.(reservationInfo);

    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Eroare la rezervare");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    // Mock calculation - in real app this would be more sophisticated
    const basePrice = 75;
    let total = passengers.length * trips.length * basePrice;
    
    // Add discounts, baggage, etc.
    trips.forEach(trip => {
      if (trip.discounts) {
        Object.keys(trip.discounts).forEach(() => {
          total -= 10; // Mock discount
        });
      }
      
      if (trip.baggagePaidIdsPerPassenger) {
        trip.baggagePaidIdsPerPassenger.forEach(baggage => {
          if (baggage) {
            total += baggage.split(',').length * 15; // Mock baggage cost
          }
        });
      }
    });
    
    return total;
  };

  // Payment flow handlers
  const handlePaymentComplete = (result: TicketPurchaseResult) => {
    setPurchaseResult(result);
    setStep('success');
  };

  const handlePaymentCancel = () => {
    setStep('form');
    setReservation(null);
  };

  const handleSuccessContinue = () => {
    // Reset form or navigate away
    setStep('form');
    setReservation(null);
    setPurchaseResult(null);
    setError(null);
    
    // Could call a parent callback here
    console.log("Booking flow completed:", purchaseResult);
  };

  // Render based on current step
  if (step === 'payment' && reservation) {
    return (
      <PaymentFlow
        reservation={reservation}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
      />
    );
  }

  if (step === 'success' && purchaseResult) {
    return (
      <PaymentSuccess
        result={purchaseResult}
        onContinue={handleSuccessContinue}
      />
    );
  }

  // Default form step
  if (reservation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Rezervare Confirmată
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Timer className="h-4 w-4" />
            <AlertDescription>
              Rezervarea este valabilă până la {reservation.reservation_until} 
              ({reservation.reservation_until_min} minute)
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Numărul comenzii</Label>
              <div className="font-mono font-bold">{reservation.order_id}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Cod securitate</Label>
              <div className="font-mono font-bold">{reservation.security}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Total de plată</Label>
              <div className="font-bold text-lg">{reservation.price_total} {reservation.currency}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <Badge variant={reservation.status === "reserve_ok" ? "default" : "secondary"}>
                {reservation.status}
              </Badge>
            </div>
          </div>

          {reservation.promocode_info && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                Promocod aplicat: {reservation.promocode_info.promocode_name}
              </div>
              <div className="text-sm text-green-600">
                Reducere: -{reservation.promocode_info.price_promocode} {reservation.currency}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1">
              Continuă la Plată
            </Button>
            <Button variant="outline">
              Printează Biletul
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Finalizare Rezervare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Trip Summary */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Rezumat călătorie</Label>
          {trips.map((trip, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  {index === 0 ? "Dus" : "Întors"} - {trip.interval_id}
                </div>
                <Badge variant="outline">{trip.date}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Locuri: {trip.seatsPerPassenger.join(", ")}
              </div>
              {trip.segments && trip.segments > 1 && (
                <div className="text-xs text-muted-foreground">
                  {trip.segments} segmente
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Informații de contact</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefon {needOrderData && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="phone"
                placeholder="+373 XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={needOrderData}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Passenger Information */}
        {needOrderData && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-base font-medium">Informații pasageri</Label>
              
              {passengers.map((passenger, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Pasager {index + 1}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nume *</Label>
                      <Input
                        placeholder="Nume"
                        value={passenger.name || ""}
                        onChange={(e) => updatePassenger(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Prenume *</Label>
                      <Input
                        placeholder="Prenume"
                        value={passenger.surname || ""}
                        onChange={(e) => updatePassenger(index, "surname", e.target.value)}
                        required
                      />
                    </div>
                    
                    {needBirth && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data nașterii *
                        </Label>
                        <Input
                          type="date"
                          value={passenger.birth_date || ""}
                          onChange={(e) => updatePassenger(index, "birth_date", e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Promocode */}
        <Separator />
        <div className="space-y-2">
          <Label>Cod promoțional</Label>
          <Input
            placeholder="PROMO77ENDLESS"
            value={promocode || ""}
            onChange={(e) => onPromocodeChange?.(e.target.value)}
          />
        </div>

        {/* Price Summary */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total estimat:</span>
            <span className="text-xl font-bold">{calculateTotalPrice()} EUR</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Prețul final va fi calculat la rezervare
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Se procesează..." : "Confirmă Rezervarea"}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Prin confirmarea rezervării, accepți termenii și condițiile de călătorie.
        </div>
      </CardContent>
    </Card>
  );
}
