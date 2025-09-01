// Reserve Ticket Demo Page
// Interactive demonstration of ticket reservation functionality

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ticket, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  Info
} from 'lucide-react';

import { ReserveTicket } from '@/components/ReserveTicket';
import { getAllReservations } from '@/lib/reserveTicketApi';
import type { 
  ReserveTicketResponse,
  ReservationStatus 
} from '@/types/reserveTicket';

export default function ReserveTicketDemo() {
  const [lastResult, setLastResult] = useState<ReserveTicketResponse | null>(null);
  const [allReservations, setAllReservations] = useState<ReservationStatus[]>([]);
  const [activeTab, setActiveTab] = useState('demo');

  /**
   * Handle successful reservation
   */
  const handleReservationSuccess = (result: ReserveTicketResponse) => {
    setLastResult(result);
    refreshReservations();
    
    // Show success message
    console.log('Reservation completed successfully:', result);
  };

  /**
   * Handle reservation error
   */
  const handleReservationError = (error: string) => {
    console.error('Reservation failed:', error);
    refreshReservations();
  };

  /**
   * Refresh all reservations list
   */
  const refreshReservations = () => {
    const reservations = getAllReservations();
    setAllReservations([...reservations]);
  };

  /**
   * Format status for display
   */
  const getStatusInfo = (status: ReservationStatus['status']) => {
    switch (status) {
      case 'created':
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Created' };
      case 'reserving':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Reserving' };
      case 'reserved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Reserved' };
      case 'sms_required':
        return { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare, label: 'SMS Required' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Failed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Ticket className="h-8 w-8" />
          Reserve Ticket Demo
        </h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the reserve_ticket API endpoint for payment-on-boarding reservations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="guide">Usage Guide</TabsTrigger>
          <TabsTrigger value="status">Reservations</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ticket Reservation
              </CardTitle>
              <CardDescription>
                Reserve tickets with payment on boarding for an existing order from new_order API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReserveTicket
                onReservationComplete={handleReservationSuccess}
                onReservationError={handleReservationError}
                className="max-w-4xl"
              />
            </CardContent>
          </Card>

          {/* Last Result Display */}
          {lastResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Last Reservation Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lastResult.success && lastResult.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {lastResult.data.total_passengers}
                        </div>
                        <div className="text-sm text-green-700">Total Passengers</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {lastResult.data.trips.length}
                        </div>
                        <div className="text-sm text-blue-700">Trip Segments</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {lastResult.data.all_reserved ? 'All' : 'Partial'}
                        </div>
                        <div className="text-sm text-purple-700">Reservation Status</div>
                      </div>
                    </div>

                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(lastResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {lastResult.error?.error || 'Unknown error occurred'}
                      {lastResult.error?.code && (
                        <span className="block text-sm mt-1">
                          Error Code: {lastResult.error.code}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Usage Guide Tab */}
        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reservation Workflow</CardTitle>
              <CardDescription>
                Step-by-step guide for using the reserve_ticket API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Order</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the new_order API to create an order and get an order_id
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Provide Contact Info</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter phone number (required), optional secondary phone, email, and special requests
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Submit Reservation</h3>
                    <p className="text-sm text-muted-foreground">
                      Click "Reserve Tickets" to submit the reservation request
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Handle Response</h3>
                    <p className="text-sm text-muted-foreground">
                      Get ticket IDs, security codes, and reservation details. Handle SMS validation if required.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Common Error Scenarios</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">dealer_no_activ</Badge>
                    <span className="text-sm">Invalid credentials or inactive dealer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">order_id</Badge>
                    <span className="text-sm">Order not found or invalid order ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">need_sms_validation</Badge>
                    <span className="text-sm">SMS validation required for this phone number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">free_seat</Badge>
                    <span className="text-sm">Selected seat is no longer available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">reserve_validation</Badge>
                    <span className="text-sm">Phone already has pay-on-board reservations</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">All Reservations</h2>
            <Button onClick={refreshReservations} variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {allReservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No reservations found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a reservation in the Demo tab to see it here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allReservations.map((reservation) => {
                const statusInfo = getStatusInfo(reservation.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={reservation.order_id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-800 rounded-lg p-2">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Order #{reservation.order_id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Created {reservation.created_at.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {reservation.passengers_reserved}/{reservation.passengers_total} passengers
                          </span>
                        </div>
                        {reservation.reserved_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Reserved {reservation.reserved_at.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {reservation.expires_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Expires {reservation.expires_at.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {reservation.last_error && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {reservation.last_error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Examples</CardTitle>
              <CardDescription>
                Sample API requests and responses for different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Reservation Request</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "login": "your_login",
  "password": "your_password",
  "v": "1.1",
  "order_id": 1026665,
  "phone": "440776251258",
  "email": "passenger@example.com",
  "lang": "en"
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Successful Response</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "order_id": "1026665",
    "trips": [{
      "trip_id": "0",
      "interval_id": "2759016",
      "route_id": "14379",
      "route_name": "Prague - Krakow - Chernivtsi",
      "carrier": "OOO Avtocombinat-1",
      "passengers": [{
        "passenger_id": "0",
        "transaction_id": "1037500",
        "name": "John",
        "surname": "Doe",
        "seat": "42",
        "ticket_id": "20834",
        "security": "613464",
        "reserve_before": "2023-02-20 14:00:00"
      }]
    }],
    "total_passengers": 1,
    "all_reserved": true,
    "has_errors": false
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Error Response</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "success": false,
  "error": {
    "error": "Selected seat is no longer available",
    "code": "free_seat",
    "retry_suggested": false
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Always validate phone numbers and ensure order_id exists before calling reserve_ticket
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Implement proper timeout handling (15-30 seconds) as reservation can take time
                </AlertDescription>
              </Alert>

              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Be prepared to handle SMS validation flow for certain phone numbers or routes
                </AlertDescription>
              </Alert>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Store ticket_id and security codes securely for each passenger
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
