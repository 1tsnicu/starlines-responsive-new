// src/pages/BookingDemo.tsx - Complete booking demo with new_order integration

import React, { useState } from "react";
import { BookingForm } from "@/components/BookingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, MapPin, Calendar, Clock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Passenger, TripMeta, ReservationInfo } from "@/types/newOrder";
import { formatSeatForSegments, formatBaggageIds } from "@/lib/newOrderBuilder";

export default function BookingDemo() {
  const navigate = useNavigate();
  
  // Mock trip data
  const [trips] = useState<TripMeta[]>([
    {
      date: "2024-01-15",
      interval_id: "12345",
      seatsPerPassenger: ["3", "4", "5"], // Single segment seats
      segments: 1,
      needOrderData: true,
      needBirth: true,
      discounts: {
        1: "34835", // Passenger index 1 has discount
        2: "3196"   // Passenger index 2 has discount
      },
      baggagePaidIdsPerPassenger: [
        undefined, // Passenger 0: no paid baggage
        "bag_small_2", // Passenger 1: one small baggage
        "bag_small_2,bag_medium_ret" // Passenger 2: small + medium baggage
      ]
    },
    {
      date: "2024-01-22",
      interval_id: "54321",
      seatsPerPassenger: ["5,1", "6,2", "7,3"], // Multi-segment seats (2 segments)
      segments: 2,
      needOrderData: true,
      needBirth: true,
      discounts: {
        0: "3199", // Different discounts for return trip
        2: "3202"
      },
      baggagePaidIdsPerPassenger: [
        "bag_large_ret", // Passenger 0: large baggage
        undefined, // Passenger 1: no paid baggage
        "bag_small_ret,bag_medium_ret" // Passenger 2: small + medium
      ]
    }
  ]);

  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "Ion", surname: "Popescu", birth_date: "1990-05-15" },
    { name: "Maria", surname: "Ionescu", birth_date: "1985-08-22" },
    { name: "Alex", surname: "Georgescu", birth_date: "2000-12-10" }
  ]);

  const [promocode, setPromocode] = useState("PROMO77ENDLESS");
  const [reservation, setReservation] = useState<ReservationInfo | null>(null);

  const mockRouteDetails = {
    outbound: {
      departure_city: "București",
      arrival_city: "Cluj-Napoca",
      departure_time: "08:00",
      arrival_time: "15:30"
    },
    return: {
      departure_city: "Cluj-Napoca", 
      arrival_city: "București",
      departure_time: "16:00",
      arrival_time: "23:30"
    }
  };

  const handleReservationComplete = (reservationInfo: ReservationInfo) => {
    setReservation(reservationInfo);
    console.log("Reservation completed:", reservationInfo);
  };

  const demoSeatFormatting = () => {
    // Demonstrate seat formatting for multi-segment trips
    const seatSelections = [
      { segmentIndex: 0, seatNumber: "5" },
      { segmentIndex: 1, seatNumber: "1" }
    ];
    
    const formatted = formatSeatForSegments(seatSelections, 2);
    console.log("Formatted seat string:", formatted); // "5,1"
  };

  const demoBaggageFormatting = () => {
    // Demonstrate baggage formatting
    const baggageSelections = [
      { baggage_id: "bag_small_2", quantity: 1 },
      { baggage_id: "bag_medium_ret", quantity: 2 }
    ];
    
    const formatted = formatBaggageIds(baggageSelections);
    console.log("Formatted baggage string:", formatted); // "bag_small_2,bag_medium_ret,bag_medium_ret"
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Demo Rezervare Completă</h1>
          <p className="text-muted-foreground">
            Testează sistemul complet new_order cu validări și payload
          </p>
        </div>
      </div>

      {/* Trip Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Detalii Rezervare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Outbound */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <MapPin className="h-4 w-4" />
                Dus: {mockRouteDetails.outbound.departure_city} → {mockRouteDetails.outbound.arrival_city}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {trips[0].date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mockRouteDetails.outbound.departure_time} - {mockRouteDetails.outbound.arrival_time}
                </div>
              </div>
              <div className="text-sm">
                <span className="font-medium">Locuri:</span> {trips[0].seatsPerPassenger.join(", ")}
              </div>
            </div>
            
            {/* Return */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <MapPin className="h-4 w-4" />
                Întors: {mockRouteDetails.return.departure_city} → {mockRouteDetails.return.arrival_city}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {trips[1].date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mockRouteDetails.return.departure_time} - {mockRouteDetails.return.arrival_time}
                </div>
              </div>
              <div className="text-sm">
                <span className="font-medium">Locuri:</span> {trips[1].seatsPerPassenger.join(", ")}
                <Badge variant="outline" className="ml-2 text-xs">2 segmente</Badge>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{passengers.length} pasageri</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cu reduceri și bagaje</div>
              <div className="text-lg font-bold">~{Math.round(passengers.length * trips.length * 75 * 0.9)} EUR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <BookingForm
        trips={trips}
        passengers={passengers}
        onPassengersChange={setPassengers}
        promocode={promocode}
        onPromocodeChange={setPromocode}
        onReservationComplete={handleReservationComplete}
      />

      {/* Developer Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Informații Tehnice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Structura new_order payload:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• <strong>date:</strong> [{trips.map(t => `"${t.date}"`).join(", ")}]</div>
                <div>• <strong>interval_id:</strong> [{trips.map(t => `"${t.interval_id}"`).join(", ")}]</div>
                <div>• <strong>seat:</strong> Array cu locuri per trip, format potrivit pentru segmente</div>
                <div>• <strong>discount_id:</strong> Array cu obiecte per trip: {`{"indexPasager": "discount_id"}`}</div>
                <div>• <strong>baggage:</strong> Dicționar per trip cu bagaje plătite per pasager</div>
                <div>• <strong>promocode_name:</strong> "{promocode}" (aplicare automată 15% reducere)</div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Validări implementate:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>✓ Lungimi egale pentru date, interval_id, seat arrays</div>
                <div>✓ Același număr de pasageri pentru toate trip-urile</div>
                <div>✓ Validare segmente pentru trip-uri cu multiple segmente</div>
                <div>✓ Date obligatorii pentru pasageri (name, surname, phone când needOrderData=1)</div>
                <div>✓ Data nașterii când needBirth=1</div>
                <div>✓ Structura corectă pentru discount_id și baggage</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={demoSeatFormatting}>
                Demo Seat Formatting
              </Button>
              <Button variant="outline" size="sm" onClick={demoBaggageFormatting}>
                Demo Baggage Formatting
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/baggage-demo")}>
                Vezi Demo Bagaje
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservation result display */}
      {reservation && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Debug: Rezervare Finalizată</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(reservation, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
