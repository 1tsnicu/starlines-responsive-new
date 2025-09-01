import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CancellationManager } from '../components/CancellationManager';
import { CancellationResultDisplay } from '../components/CancellationResultDisplay';
import { ArrowLeft } from 'lucide-react';

import type { CancellationResult } from '../types/cancellation';

// Mock ticket data for demonstration
const mockTickets = [
  {
    ticket_id: 12345,
    security: 98765,
    passenger_name: "Popescu Ioan",
    seat_number: "A12",
    route: "București - Cluj-Napoca",
    departure_time: "2024-01-20 08:30",
    price: 89.50
  },
  {
    ticket_id: 12346,
    security: 98766,
    passenger_name: "Popescu Maria",
    seat_number: "A13", 
    route: "București - Cluj-Napoca",
    departure_time: "2024-01-20 08:30",
    price: 89.50
  },
  {
    ticket_id: 12347,
    security: 98767,
    passenger_name: "Popescu Ana",
    seat_number: "B05",
    route: "București - Cluj-Napoca", 
    departure_time: "2024-01-20 08:30",
    price: 67.25
  }
];

const mockOrder = {
  order_id: 555001,
  security: 111222,
  total_paid: 246.25,
  purchase_date: "2024-01-15 14:22"
};

export default function CancellationDemo() {
  const [view, setView] = useState<'manager' | 'result'>('manager');
  const [cancellationResult, setCancellationResult] = useState<CancellationResult | null>(null);

  const handleCancellationComplete = (result: CancellationResult) => {
    setCancellationResult(result);
    setView('result');
  };

  const handleReturnToManager = () => {
    setCancellationResult(null);
    setView('manager');
  };

  const handleReturnHome = () => {
    // In a real app, navigate to home page
    console.log('Navigate to home page');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
            <h1 className="text-3xl font-bold">Demo Sistem Anulare</h1>
          </div>
          <p className="text-muted-foreground">
            Demonstrație completă a sistemului de anulare și returnare bilete
          </p>
        </div>

        {view === 'manager' && (
          <Tabs defaultValue="cancellation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cancellation">Gestionare Anulări</TabsTrigger>
              <TabsTrigger value="order-info">Informații Comandă</TabsTrigger>
            </TabsList>
            
            <TabsContent value="order-info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detalii Comandă #{mockOrder.order_id}</CardTitle>
                  <CardDescription>
                    Comandă plasată la {new Date(mockOrder.purchase_date).toLocaleDateString('ro-RO')} 
                    la {new Date(mockOrder.purchase_date).toLocaleTimeString('ro-RO')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID Comandă:</span>
                        <span className="font-medium">#{mockOrder.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total plătit:</span>
                        <span className="font-medium">{mockOrder.total_paid.toFixed(2)} EUR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Număr bilete:</span>
                        <span className="font-medium">{mockTickets.length}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="default">Activ</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rută:</span>
                        <span className="font-medium">{mockTickets[0].route}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plecare:</span>
                        <span className="font-medium">
                          {new Date(mockTickets[0].departure_time).toLocaleDateString('ro-RO')} la{' '}
                          {new Date(mockTickets[0].departure_time).toLocaleTimeString('ro-RO', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bilete Incluse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTickets.map((ticket, index) => (
                      <div key={ticket.ticket_id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{ticket.passenger_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Bilet #{ticket.ticket_id} • Loc {ticket.seat_number}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{ticket.price.toFixed(2)} EUR</div>
                            <Badge variant="outline">Activ</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cancellation" className="space-y-6">
              <CancellationManager
                tickets={mockTickets}
                order_id={mockOrder.order_id}
                order_security={mockOrder.security}
                onCancellationComplete={handleCancellationComplete}
              />
            </TabsContent>
          </Tabs>
        )}

        {view === 'result' && cancellationResult && (
          <CancellationResultDisplay
            result={cancellationResult}
            onClose={handleReturnToManager}
            onReturnHome={handleReturnHome}
          />
        )}
      </div>
    </div>
  );
}
