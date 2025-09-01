// Demo page for new_order system
// Shows order creation workflow with different scenarios

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  User, 
  MapPin, 
  Clock, 
  Settings,
  Ticket,
  Bus,
  Plane,
  Train,
  Plus,
  Minus,
  Info
} from 'lucide-react';

import { OrderCreation } from '@/components/OrderCreation';
import {
  createSimpleOrder,
  createTransferOrder,
  createCombinedOrder,
  validateOrder,
  analyzeOrder
} from '@/lib/newOrderApi';

import type {
  OrderBuilder,
  Passenger,
  TripMeta,
  ReservationInfo
} from '@/types/newOrder';

// Demo data
const DEMO_CREDENTIALS = {
  login: 'demo_user',
  password: 'demo_pass'
};

const DEMO_INTERVALS = [
  { id: '12850', name: 'Bucharest → Cluj (Direct)', type: 'simple' },
  { id: '7147', name: 'Prague → Vienna (Direct)', type: 'simple' },
  { id: '5286', name: 'Berlin → Munich (Transfer)', type: 'transfer' },
  { id: '7152', name: 'Paris → London (Transfer)', type: 'transfer' }
];

const DEMO_PASSENGERS: Passenger[] = [
  {
    name: 'John',
    surname: 'Doe',
    birth_date: '1990-05-15',
    phone: '+40123456789',
    email: 'john.doe@example.com',
    document_type: 'passport',
    document_number: 'AB123456',
    gender: 'M',
    citizenship: 'RO'
  },
  {
    name: 'Jane',
    surname: 'Smith',
    birth_date: '1985-08-22',
    document_type: 'id_card',
    document_number: 'CD789012',
    gender: 'F',
    citizenship: 'RO'
  }
];

export const NewOrderDemo: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('simple');
  const [orderBuilder, setOrderBuilder] = useState<OrderBuilder | null>(null);
  const [lastReservation, setLastReservation] = useState<ReservationInfo | null>(null);
  const [demoCredentials, setDemoCredentials] = useState(DEMO_CREDENTIALS);
  
  // Simple order state
  const [simpleOrder, setSimpleOrder] = useState({
    date: '2024-01-15',
    interval_id: '12850',
    seats: ['15', '16']
  });
  
  // Transfer order state
  const [transferOrder, setTransferOrder] = useState({
    date: '2024-01-15',
    interval_id: '5286',
    seatsPerSegment: [['15', '16'], ['9', '10'], ['5', '6']] // 3 segments, 2 passengers
  });
  
  // Combined order state
  const [combinedTrips, setCombinedTrips] = useState([
    {
      date: '2024-01-15',
      interval_id: '7147',
      seats: ['15', '16']
    },
    {
      date: '2024-01-16',
      interval_id: '5286',
      seats: ['24', '25']
    }
  ]);
  
  // Passengers state
  const [passengers, setPassengers] = useState<Passenger[]>(DEMO_PASSENGERS);

  // Build order based on selected tab
  const buildOrder = useCallback(() => {
    let builder: OrderBuilder;
    
    switch (selectedTab) {
      case 'simple': {
        const simpleTripMeta: TripMeta = {
          date: simpleOrder.date,
          interval_id: simpleOrder.interval_id,
          seatsPerPassenger: simpleOrder.seats,
          segments: 1,
          needOrderData: true,
          needBirth: true,
          needDoc: true
        };
        
        builder = {
          trips: [simpleTripMeta],
          passengers,
          commonData: {
            phone: passengers[0]?.phone,
            email: passengers[0]?.email,
            currency: 'EUR',
            lang: 'en'
          }
        };
        break;
      }
        
      case 'transfer': {
        // Convert seats to transfer format
        const transferSeats = passengers.map((_, passengerIndex) => {
          return transferOrder.seatsPerSegment.map(segment => segment[passengerIndex]).join(',');
        });
        
        const transferTripMeta: TripMeta = {
          date: transferOrder.date,
          interval_id: transferOrder.interval_id,
          seatsPerPassenger: transferSeats,
          segments: transferOrder.seatsPerSegment.length,
          needOrderData: true,
          needBirth: true
        };
        
        builder = {
          trips: [transferTripMeta],
          passengers,
          commonData: {
            phone: passengers[0]?.phone,
            email: passengers[0]?.email,
            currency: 'EUR',
            lang: 'en'
          }
        };
        break;
      }
        
      case 'combined': {
        const combinedTripsMeta: TripMeta[] = combinedTrips.map(trip => ({
          date: trip.date,
          interval_id: trip.interval_id,
          seatsPerPassenger: trip.seats,
          segments: 1,
          needOrderData: true,
          needBirth: true
        }));
        
        builder = {
          trips: combinedTripsMeta,
          passengers,
          commonData: {
            phone: passengers[0]?.phone,
            email: passengers[0]?.email,
            currency: 'EUR',
            lang: 'en'
          }
        };
        break;
      }
        
      default:
        return;
    }
    
    setOrderBuilder(builder);
  }, [selectedTab, simpleOrder, transferOrder, combinedTrips, passengers]);

  // Handle order creation success
  const handleOrderCreated = useCallback((reservation: ReservationInfo) => {
    setLastReservation(reservation);
    console.log('Order created successfully:', reservation);
  }, []);

  // Handle order creation failure
  const handleOrderFailed = useCallback((error: string) => {
    console.error('Order creation failed:', error);
  }, []);

  // Handle timer expiration
  const handleTimerExpired = useCallback(() => {
    console.log('Reservation expired');
    setLastReservation(null);
  }, []);

  // Add passenger
  const addPassenger = useCallback(() => {
    const newPassenger: Passenger = {
      name: '',
      surname: '',
      birth_date: '',
      document_type: 'passport',
      document_number: '',
      gender: 'M',
      citizenship: 'RO'
    };
    setPassengers(prev => [...prev, newPassenger]);
  }, []);

  // Remove passenger
  const removePassenger = useCallback((index: number) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter((_, i) => i !== index));
    }
  }, [passengers.length]);

  // Update passenger
  const updatePassenger = useCallback((index: number, field: keyof Passenger, value: string) => {
    setPassengers(prev => prev.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    ));
  }, []);

  // Add trip to combined order
  const addCombinedTrip = useCallback(() => {
    setCombinedTrips(prev => [...prev, {
      date: '2024-01-17',
      interval_id: '7152',
      seats: passengers.map(() => '99')
    }]);
  }, [passengers]);

  // Remove trip from combined order
  const removeCombinedTrip = useCallback((index: number) => {
    if (combinedTrips.length > 1) {
      setCombinedTrips(prev => prev.filter((_, i) => i !== index));
    }
  }, [combinedTrips.length]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Ticket className="h-8 w-8" />
          New Order System Demo
        </h1>
        <p className="text-gray-600">
          Create temporary reservations with automatic timer management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Login</Label>
                <Input
                  value={demoCredentials.login}
                  onChange={(e) => setDemoCredentials(prev => ({ ...prev, login: e.target.value }))}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={demoCredentials.password}
                  onChange={(e) => setDemoCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Order Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="simple">Simple</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  <TabsTrigger value="combined">Combined</TabsTrigger>
                </TabsList>

                {/* Simple Order */}
                <TabsContent value="simple" className="space-y-4">
                  <Alert>
                    <Bus className="h-4 w-4" />
                    <AlertDescription>
                      Single trip, no transfers. Each passenger gets one seat.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={simpleOrder.date}
                      onChange={(e) => setSimpleOrder(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Route</Label>
                    <Select 
                      value={simpleOrder.interval_id} 
                      onValueChange={(value) => setSimpleOrder(prev => ({ ...prev, interval_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEMO_INTERVALS.filter(i => i.type === 'simple').map(interval => (
                          <SelectItem key={interval.id} value={interval.id}>
                            {interval.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Seats (comma separated)</Label>
                    <Input
                      value={simpleOrder.seats.join(', ')}
                      onChange={(e) => setSimpleOrder(prev => ({ 
                        ...prev, 
                        seats: e.target.value.split(',').map(s => s.trim()) 
                      }))}
                      placeholder="15, 16"
                    />
                  </div>
                </TabsContent>

                {/* Transfer Order */}
                <TabsContent value="transfer" className="space-y-4">
                  <Alert>
                    <Train className="h-4 w-4" />
                    <AlertDescription>
                      Single trip with transfers. Passengers change vehicles during journey.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={transferOrder.date}
                      onChange={(e) => setTransferOrder(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Route</Label>
                    <Select 
                      value={transferOrder.interval_id} 
                      onValueChange={(value) => setTransferOrder(prev => ({ ...prev, interval_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEMO_INTERVALS.filter(i => i.type === 'transfer').map(interval => (
                          <SelectItem key={interval.id} value={interval.id}>
                            {interval.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Transfer Segments</Label>
                    {transferOrder.seatsPerSegment.map((segment, segmentIndex) => (
                      <div key={segmentIndex} className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Segment {segmentIndex + 1}</Badge>
                        <Input
                          value={segment.join(', ')}
                          onChange={(e) => {
                            const newSeats = e.target.value.split(',').map(s => s.trim());
                            setTransferOrder(prev => ({
                              ...prev,
                              seatsPerSegment: prev.seatsPerSegment.map((seg, i) => 
                                i === segmentIndex ? newSeats : seg
                              )
                            }));
                          }}
                          placeholder="15, 16"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Combined Order */}
                <TabsContent value="combined" className="space-y-4">
                  <Alert>
                    <Plane className="h-4 w-4" />
                    <AlertDescription>
                      Multiple separate trips. Each trip is independent.
                    </AlertDescription>
                  </Alert>
                  
                  {combinedTrips.map((trip, tripIndex) => (
                    <Card key={tripIndex} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Trip {tripIndex + 1}</h4>
                        {combinedTrips.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCombinedTrip(tripIndex)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={trip.date}
                            onChange={(e) => {
                              setCombinedTrips(prev => prev.map((t, i) => 
                                i === tripIndex ? { ...t, date: e.target.value } : t
                              ));
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label>Route</Label>
                          <Select 
                            value={trip.interval_id} 
                            onValueChange={(value) => {
                              setCombinedTrips(prev => prev.map((t, i) => 
                                i === tripIndex ? { ...t, interval_id: value } : t
                              ));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DEMO_INTERVALS.map(interval => (
                                <SelectItem key={interval.id} value={interval.id}>
                                  {interval.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Seats</Label>
                          <Input
                            value={trip.seats.join(', ')}
                            onChange={(e) => {
                              const newSeats = e.target.value.split(',').map(s => s.trim());
                              setCombinedTrips(prev => prev.map((t, i) => 
                                i === tripIndex ? { ...t, seats: newSeats } : t
                              ));
                            }}
                            placeholder="15, 16"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <Button variant="outline" onClick={addCombinedTrip} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trip
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Passengers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passengers.map((passenger, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Passenger {index + 1}</h4>
                    {passengers.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePassenger(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Surname</Label>
                      <Input
                        value={passenger.surname}
                        onChange={(e) => updatePassenger(index, 'surname', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Birth Date</Label>
                      <Input
                        type="date"
                        value={passenger.birth_date}
                        onChange={(e) => updatePassenger(index, 'birth_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select 
                        value={passenger.gender} 
                        onValueChange={(value) => updatePassenger(index, 'gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {index === 0 && (
                      <>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
              
              <Button variant="outline" onClick={addPassenger} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Passenger
              </Button>
            </CardContent>
          </Card>

          <Button onClick={buildOrder} className="w-full" size="lg">
            Build Order
          </Button>
        </div>

        {/* Order Creation Panel */}
        <div className="space-y-6">
          {orderBuilder ? (
            <OrderCreation
              builder={orderBuilder}
              credentials={demoCredentials}
              onOrderCreated={handleOrderCreated}
              onOrderFailed={handleOrderFailed}
              onTimerExpired={handleTimerExpired}
              autoValidate={true}
              showAnalytics={true}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Configure your order and click "Build Order" to begin</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Reservation */}
          {lastReservation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Latest Reservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Order ID:</strong> {lastReservation.order_id}</div>
                  <div><strong>Status:</strong> {lastReservation.status}</div>
                  <div><strong>Total:</strong> {lastReservation.price_total} {lastReservation.currency}</div>
                  <div><strong>Expires:</strong> {lastReservation.reservation_until}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrderDemo;
