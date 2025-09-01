// src/pages/TicketPrintDemo.tsx - Demo complete pentru sistemul de printare bilete

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Download, ExternalLink, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TicketPrintManager } from "@/components/TicketPrintManager";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TicketPrintDemo() {
  const navigate = useNavigate();
  const [selectedDemo, setSelectedDemo] = useState<'single' | 'family' | 'business'>('family');

  // Mock buy_ticket responses for different scenarios
  const demoScenarios = {
    single: {
      title: "Călător Individual",
      description: "Un pasager cu bagaj mic",
      response: {
        order_id: 123456,
        price_total: 89.50,
        currency: "EUR",
        link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?order_id=123456&security=sec_abc123&lang=ru",
        "0": {
          passenger_id: 1,
          transaction_id: "txn_1698765432_1",
          ticket_id: "ticket_123456_1",
          security: "sec_xyz789_1",
          price: 74.50,
          currency: "EUR",
          link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=ticket_123456_1&security=sec_xyz789_1&lang=ru",
          baggage: [
            {
              baggage_title: "Bagaj mic",
              price: 15,
              currency: "EUR"
            }
          ]
        }
      },
      passengers: [
        { firstName: "Alexandru", lastName: "Popescu" }
      ]
    },
    
    family: {
      title: "Familie cu Copii",
      description: "3 pasageri cu reduceri și bagaje diferite",
      response: {
        order_id: 234567,
        price_total: 203.25,
        currency: "EUR", 
        link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?order_id=234567&security=sec_family456&lang=ru",
        "0": {
          passenger_id: 1,
          transaction_id: "txn_1698765433_1",
          ticket_id: "ticket_234567_1",
          security: "sec_adult1_789",
          price: 75.00,
          currency: "EUR",
          link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=ticket_234567_1&security=sec_adult1_789&lang=ru",
          baggage: [
            {
              baggage_title: "Bagaj mediu",
              price: 25,
              currency: "EUR"
            }
          ]
        },
        "1": {
          passenger_id: 2,
          transaction_id: "txn_1698765433_2", 
          ticket_id: "ticket_234567_2",
          security: "sec_adult2_456",
          price: 67.50,
          currency: "EUR",
          link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=ticket_234567_2&security=sec_adult2_456&lang=ru",
          baggage: [
            {
              baggage_title: "Bagaj mic",
              price: 15,
              currency: "EUR"
            }
          ]
        },
        "2": {
          passenger_id: 3,
          transaction_id: "txn_1698765433_3",
          ticket_id: "ticket_234567_3", 
          security: "sec_child_123",
          price: 45.75,
          currency: "EUR",
          link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=ticket_234567_3&security=sec_child_123&lang=ru",
          baggage: []
        }
      },
      passengers: [
        { firstName: "Maria", lastName: "Ionescu" },
        { firstName: "Ion", lastName: "Ionescu" },
        { firstName: "Ana", lastName: "Ionescu" }
      ]
    },
    
    business: {
      title: "Călătorie de Afaceri",
      description: "2 pasageri cu bagaje premium",
      response: {
        order_id: 345678,
        price_total: 285.80,
        currency: "EUR",
        link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?order_id=345678&security=sec_business789&lang=ru",
        "0": {
          passenger_id: 1,
          transaction_id: "txn_1698765434_1",
          ticket_id: "ticket_345678_1",
          security: "sec_business1_999",
          price: 125.00,
          currency: "EUR",
          link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=ticket_345678_1&security=sec_business1_999&lang=ru",
          baggage: [
            {
              baggage_title: "Bagaj mare",
              price: 35,
              currency: "EUR"
            },
            {
              baggage_title: "Bagaj de mână premium",
              price: 20,
              currency: "EUR"
            }
          ]
        },
        "1": {
          passenger_id: 2,
          transaction_id: "txn_1698765434_2",
          ticket_id: "ticket_345678_2",
          security: "sec_business2_888",
          price: 105.80,
          currency: "EUR", 
          link: "https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=ticket_345678_2&security=sec_business2_888&lang=ru",
          baggage: [
            {
              baggage_title: "Bagaj mare",
              price: 35,
              currency: "EUR"
            }
          ]
        }
      },
      passengers: [
        { firstName: "Andrei", lastName: "Georgescu" },
        { firstName: "Elena", lastName: "Marinescu" }
      ]
    }
  };

  const currentDemo = demoScenarios[selectedDemo];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Demo Printare Bilete</h1>
          <p className="text-muted-foreground">
            Testează sistemul de printare bilete cu link-uri multi-limbă și gestionare bagaje
          </p>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Selectează Scenariul de Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(demoScenarios).map(([key, scenario]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-colors ${
                  selectedDemo === key ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedDemo(key as keyof typeof demoScenarios)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{scenario.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                  <div className="flex justify-between text-xs">
                    <span>{scenario.passengers.length} pasager{scenario.passengers.length > 1 ? 'i' : ''}</span>
                    <span className="font-medium">
                      {scenario.response.price_total} {scenario.response.currency}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Demo Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {currentDemo.title} - Comanda #{currentDemo.response.order_id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numărul comenzii:</span>
                <span className="font-medium">#{currentDemo.response.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total pasageri:</span>
                <span className="font-medium">{currentDemo.passengers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preț total:</span>
                <span className="font-bold text-lg">
                  {currentDemo.response.price_total} {currentDemo.response.currency}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Pasageri:</h4>
              {currentDemo.passengers.map((passenger, index) => {
                const passengerData = currentDemo.response[index.toString() as keyof typeof currentDemo.response];
                const price = typeof passengerData === 'object' && passengerData && 'price' in passengerData 
                  ? (passengerData as { price: number }).price 
                  : null;
                
                return (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{passenger.firstName} {passenger.lastName}</span>
                    {price && (
                      <span className="text-muted-foreground ml-2">
                        - {price} {currentDemo.response.currency}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation Info */}
      <Alert className="mb-6">
        <AlertDescription>
          <strong>Funcționalități demonstrate:</strong>
          <br />• Link-uri separate pentru comanda completă și bilete individuale
          <br />• Suport multi-limbă (Română, Rusă, Engleză) cu reconstrucție automată URL-uri
          <br />• Afișare detalii bagaje per pasager cu costuri
          <br />• Deschidere securizată în tab nou cu `target="_blank" rel="noopener"`
          <br />• Extragere automată token-uri security din răspunsul buy_ticket
        </AlertDescription>
      </Alert>

      {/* Ticket Print Manager Demo */}
      <TicketPrintManager
        buyTicketResponse={currentDemo.response}
        passengerNames={currentDemo.passengers}
      />

      {/* API Response Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Răspuns buy_ticket Mock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 p-4 rounded-lg">
            <pre className="text-xs font-mono overflow-x-auto">
              {JSON.stringify(currentDemo.response, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate("/payment-demo")}>
          <Download className="h-4 w-4 mr-2" />
          Demo Plată Completă
        </Button>
        <Button variant="outline" onClick={() => navigate("/booking-demo")}>
          <FileText className="h-4 w-4 mr-2" />
          Demo Rezervare
        </Button>
      </div>
    </div>
  );
}
