/**
 * GET ALL ROUTES DEMO PAGE
 * 
 * Pagină demo completă pentru sistemul get_all_routes
 * Demonstrează toate funcționalitățile și integrarea cu get_routes
 */

import React, { useState } from 'react';
import { RouteSchedulePage } from '@/components/RouteSchedulePage';
import { RouteSearchPage } from '@/components/RouteSearchPage';
import { env } from '@/config/env';
import type { RouteOption } from '@/types/routes';
import type { RouteSchedule, BaggageSelection } from '@/types/getAllRoutes';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export function GetAllRoutesDemo() {
  const { toast } = useToast();
  
  // Demo state
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [bookingData, setBookingData] = useState<{
    schedule: RouteSchedule;
    selectedBaggage: BaggageSelection[];
    totalPrice: number;
  } | null>(null);

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    
    // Check if route has timetable_id for detailed schedule
    const hasSchedule = route.segments.some(segment => segment.timetable_id);
    
    if (hasSchedule) {
      setShowSchedule(true);
    } else {
      toast({
        title: "Orar indisponibil",
        description: "Această rută nu are orar detaliat disponibil.",
        variant: "destructive"
      });
    }
  };

  const handleBookingSelect = (data: {
    schedule: RouteSchedule;
    selectedBaggage: BaggageSelection[];
    totalPrice: number;
  }) => {
    setBookingData(data);
    toast({
      title: "Rezervare pregătită",
      description: `Date colectate pentru rezervare. Total bagaje: ${data.totalPrice.toFixed(2)} EUR`,
    });
  };

  const handleBackToSearch = () => {
    setShowSchedule(false);
    setSelectedRoute(null);
    setBookingData(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Sistem GET_ALL_ROUTES - Demo Complet</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Demonstrație completă a sistemului de orar detaliat pentru rute. 
          Selectează o rută din lista de căutare pentru a vedea orarul complet cu stații, bagaje și politici.
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Demo Live</TabsTrigger>
          <TabsTrigger value="features">Funcționalități</TabsTrigger>
          <TabsTrigger value="business">Reguli Business</TabsTrigger>
          <TabsTrigger value="integration">Integrare</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {!showSchedule ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pas 1: Căutare Rute</CardTitle>
                  <CardDescription>
                    Caută rute disponibile și selectează una pentru a vedea orarul detaliat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RouteSearchPage 
                    onRouteSelect={handleRouteSelect}
                    showScheduleButton={true}
                  />
                </CardContent>
              </Card>
              
              {selectedRoute && (
                <Alert>
                  <AlertDescription>
                    Rută selectată: <strong>{selectedRoute.segments[0]?.point_from_name} → {selectedRoute.segments[selectedRoute.segments.length - 1]?.point_to_name}</strong>
                    <br />
                    {selectedRoute.segments.some(s => s.timetable_id) ? 
                      "✅ Are orar detaliat disponibil" : 
                      "❌ Nu are orar detaliat"
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : selectedRoute ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Pas 2: Orar Detaliat</h2>
                  <p className="text-muted-foreground">
                    Vizualizează orarul complet cu stații, bagaje și politici de anulare
                  </p>
                </div>
                <Button variant="outline" onClick={handleBackToSearch}>
                  ← Înapoi la căutare
                </Button>
              </div>
              
              <RouteSchedulePage
                timetable_id={selectedRoute.segments.find(s => s.timetable_id)?.timetable_id ? String(selectedRoute.segments.find(s => s.timetable_id)?.timetable_id) : ''}
                route_name={`${selectedRoute.segments[0]?.point_from_name} → ${selectedRoute.segments[selectedRoute.segments.length - 1]?.point_to_name}`}
                onBookingSelect={handleBookingSelect}
                onClose={handleBackToSearch}
              />
            </div>
          ) : null}
          
          {/* Booking Result */}
          {bookingData && (
            <Card>
              <CardHeader>
                <CardTitle>Pas 3: Date Rezervare Colectate</CardTitle>
                <CardDescription>
                  Următorul pas ar fi trimiterea acestor date la new_order pentru rezervare efectivă
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Detalii Rută:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Nume: {bookingData.schedule.route_name}</li>
                      <li>• Operator: {bookingData.schedule.carrier}</li>
                      <li>• Route ID: {bookingData.schedule.route_id}</li>
                      <li>• Timetable ID: {bookingData.schedule.timetable_id}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Bagaje Selectate:</h4>
                    {bookingData.selectedBaggage.length > 0 ? (
                      <ul className="text-sm space-y-1 mt-2">
                        {bookingData.selectedBaggage.map((sel, index) => (
                          <li key={index}>
                            • {sel.quantity}x {sel.item.baggage_title} - {sel.total_price.toFixed(2)} EUR
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">Fără bagaje suplimentare</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total bagaje: {bookingData.totalPrice.toFixed(2)} EUR
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Prețul biletelor se calculează la new_order)
                  </p>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Următorul pas:</strong> Transmite aceste date la new_order împreună cu:
                    route_id, interval_id, passenger details, și selected baggage IDs pentru rezervare efectivă.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🚌 Traseu & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Funcționalități:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Lista completă de stații în ordine</li>
                      <li>• Ore de sosire și plecare pentru fiecare stație</li>
                      <li>• Suport pentru călătorii multi-zi (day_in_way)</li>
                      <li>• Informații transfer (schimbare stație/timp)</li>
                      <li>• Coordonate GPS pentru fiecare stație</li>
                      <li>• Durata opririi la fiecare stație</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">UI Features:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Timeline vizual cu indicatori colorați</li>
                      <li>• Click pe stație pentru detalii GPS</li>
                      <li>• Badge-uri pentru transferuri</li>
                      <li>• Display multi-zi inteligent</li>
                      <li>• Link către hărți pentru coordonate</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🧳 Sistem Bagaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Validări Business:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• max_per_person: limită per călător</li>
                      <li>• max_in_bus: limită totală per autobuz</li>
                      <li>• Separare bagaj gratuit vs plătit</li>
                      <li>• Calcul preț total în timp real</li>
                      <li>• Validare cantități înainte de rezervare</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Informații Afișate:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Greutate și dimensiuni (kg, cm)</li>
                      <li>• Preț individual și total</li>
                      <li>• Tip bagaj (free/paid marker)</li>
                      <li>• Descriere și restricții</li>
                      <li>• Selector cantitate cu +/- buttons</li>
                    </ul>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Notă:</strong> La new_order se trimit doar bagajele PLĂTITE. 
                    Bagajele incluse (price=0) nu trebuie trimise în cerere.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📋 Politici & Restricții</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Politici Anulare:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• cancel_free_min: fereastră gratuită</li>
                      <li>• cancel_hours_info: tarife pe intervale</li>
                      <li>• Calculator estimare rambursare</li>
                      <li>• Afișare politici în format prietenos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Restricții Rezervare:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• buy/reserve/request capabilities</li>
                      <li>• start_sale_day: când începe vânzarea</li>
                      <li>• stop_sale_hours: când se oprește</li>
                      <li>• lock_min: timp blocare comandă</li>
                      <li>• max_seats: locuri maxime per rezervare</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Rules Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Când să apelezi get_all_routes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      <strong>REGULA DE AUR:</strong> Apelează get_all_routes DOAR dacă timetable_id din get_routes nu este gol!
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600">✅ Când să apelezi:</h4>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>• User clicks "Vezi orar complet"</li>
                        <li>• User selectează o rută specifică</li>
                        <li>• Ai nevoie de detalii stații</li>
                        <li>• Vrei să afișezi bagaje disponibile</li>
                        <li>• Trebuie să calculezi politici anulare</li>
                        <li>• User vrea să vadă fotografii rută</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">❌ Când să NU apelezi:</h4>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>• La fiecare afișare listă rute</li>
                        <li>• Pentru validare prețuri (folosește new_order)</li>
                        <li>• Dacă timetable_id este gol/undefined</li>
                        <li>• Pentru căutări rapide</li>
                        <li>• În loop-uri sau batch processing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔒 Rate Limiting & Caching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Rate Limits:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• <Badge variant="secondary">10 cereri/minut</Badge></li>
                      <li>• <Badge variant="secondary">60 cereri/oră</Badge></li>
                      <li>• Automatic backoff la rate limit</li>
                      <li>• Error handling prietenos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Cache Strategy:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• <Badge variant="outline">30 min TTL</Badge> pentru schedule</li>
                      <li>• Cache per timetable_id + lang</li>
                      <li>• Auto cleanup expired entries</li>
                      <li>• Force refresh option</li>
                    </ul>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    Răspunsurile get_all_routes sunt relativ statice (orare, bagaje, politici) 
                    astfel că cache-ul de 30 minute este optim pentru performanță.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🛡️ Error Handling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Erori API:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• <code>empty_timetable_id</code> → Nu afișa buton</li>
                      <li>• <code>route_no_found</code> → "Orar indisponibil"</li>
                      <li>• <code>dealer_no_activ</code> → Problema credențiale</li>
                      <li>• <code>timeout</code> → Retry cu backoff</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Fallback Strategy:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Afișează info din get_routes</li>
                      <li>• Ascunde funcții avansate</li>
                      <li>• Păstrează funcționalitatea de bază</li>
                      <li>• Log errors pentru debugging</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🔗 Integrare cu get_routes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Flux de date:</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`1. get_routes → RouteOption[] cu timetable_id
2. User selectează rută cu timetable_id
3. get_all_routes(timetable_id) → RouteSchedule
4. User configurează bagaje + verifică politici
5. Trimite la new_order pentru rezervare efectivă`}
                    </pre>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      <strong>Conexiunea cheie:</strong> timetable_id din get_routes devine parametrul principal pentru get_all_routes
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Integrare cu new_order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Date necesare pentru new_order:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium">Din get_routes:</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>• route_id, interval_id</li>
                        <li>• point_from_id, point_to_id</li>
                        <li>• date, passenger counts</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium">Din get_all_routes:</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>• baggage_id[] (doar plătite!)</li>
                        <li>• quantities pentru fiecare bagaj</li>
                        <li>• Validări max_per_person/max_in_bus</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`// Exemplu parametri new_order
{
  route_id: "12345",
  interval_id: "abc123", 
  date: "2025-08-30",
  point_from_id: "1001",
  point_to_id: "2002",
  adt: 1,
  
  // Din get_all_routes (doar bagaje plătite):
  baggage: [
    { baggage_id: "bag001", quantity: 1 },
    { baggage_id: "bag003", quantity: 2 }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚙️ Backend Implementation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Endpoint Backend (/api/proxy/get-all-routes):</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`// Node.js endpoint example
app.post('/api/proxy/get-all-routes', async (req, res) => {
  const { timetable_id, lang = 'ru' } = req.body;
  
  // Validate
  if (!timetable_id) {
    return res.status(400).json({ 
      error: 'empty_timetable_id' 
    });
  }
  
  // Call Bussystem API
  const response = await fetch(
    'https://test-api.bussystem.eu/server/curl/get_all_routes.php',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: env.BUS_LOGIN,
        password: env.BUS_PASSWORD,
        timetable_id,
        lang,
        json: 1
      })
    }
  );
  
  // Handle XML fallback + normalization
  // ... (vezi implementarea din getAllRoutesHttp.ts)
});`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🧪 Testing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Unit Tests:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Normalizare XML→JSON</li>
                      <li>• Validare bagaje (limits)</li>
                      <li>• Calcul estimare anulare</li>
                      <li>• Timeline generation</li>
                      <li>• Cache expiry logic</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Integration Tests:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• End-to-end get_routes → get_all_routes</li>
                      <li>• Error scenarios (invalid timetable_id)</li>
                      <li>• Rate limiting behavior</li>
                      <li>• Cache hit/miss scenarios</li>
                      <li>• UI interaction flow</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
