// src/pages/BaggageDemo.tsx - Demo page showcasing BOTH old and new baggage selection systems

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  BarChart3 as BarChart3Icon, 
  RefreshCw as RefreshCwIcon, 
  Code as CodeIcon, 
  Info as InfoIcon, 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  Users 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaggageSelection } from "@/components/BaggageSelection";
import { 
  fetchBaggageInfo as getBaggage, 
  getBaggageApiStats, 
  clearBaggageCache 
} from "@/lib/baggageApi";
import type { 
  BaggageItem as LegacyBaggageItem,
  BaggageSelection as BaggageSelectionType,
  NewOrderBaggagePayload,
  GetBaggageRequest,
  NormalizedBaggageResponse
} from "@/types/getBaggage";

// Type aliases for demo configuration
type Currency = "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
type Language = "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";

// Legacy types for comparison
interface PassengerBaggage {
  baggage_id: string;
  baggage_name: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

// Mock BaggageSelector component for legacy system
interface BaggageSelectorProps {
  baggage: LegacyBaggageItem[];
  passengerCount: number;
  selectedBaggage: PassengerBaggage[];
  onSelectionChange: (selection: PassengerBaggage[]) => void;
  currency: string;
}

const BaggageSelector = ({ baggage, passengerCount, selectedBaggage, onSelectionChange, currency }: BaggageSelectorProps) => (
  <div className="p-4 border rounded-lg">
    <p className="text-sm text-muted-foreground">
      Mock legacy baggage selector - {baggage.length} items for {passengerCount} passengers
    </p>
  </div>
);

// ===============================
// Demo Configuration
// ===============================

const DEMO_INTERVALS = [
  { id: 'test_interval_1', name: 'București → Cluj (Matinal)', request_get_baggage: 1 },
  { id: 'test_interval_2', name: 'Timișoara → Constanța (Seara)', request_get_baggage: 1 },
  { id: 'legacy_interval', name: 'Rută Legacy (fără get_baggage)', request_get_baggage: 0 }
];

const DEMO_STATIONS = [
  { id: 'station_1', name: 'Gara de Nord București' },
  { id: 'station_2', name: 'Autogara Cluj' },
  { id: 'station_3', name: 'Terminal Timișoara' },
  { id: 'station_4', name: 'Gara Constanța' }
];

// ===============================
// Main Component
// ===============================

export default function BaggageDemo() {
  const navigate = useNavigate();
  
  // ===============================
  // Legacy System State (for comparison)
  // ===============================
  const [legacyBaggage, setLegacyBaggage] = useState<LegacyBaggageItem[]>([]);
  const [selectedLegacyBaggage, setSelectedLegacyBaggage] = useState<PassengerBaggage[]>([]);
  
  // ===============================
  // New System State
  // ===============================
  const [newBaggageSelection, setNewBaggageSelection] = useState<BaggageSelectionType[]>([]);
  const [newOrderPayload, setNewOrderPayload] = useState<NewOrderBaggagePayload | null>(null);
  const [apiStats, setApiStats] = useState<{
    performance: { total_requests: number; cache_hit_ratio: number };
    cache: { total_entries: number };
    state: { loading: boolean; error?: string };
  } | null>(null);
  
  // ===============================
  // Demo Configuration State
  // ===============================
  const [demoConfig, setDemoConfig] = useState({
    intervalId: DEMO_INTERVALS[0].id,
    stationFromId: '',
    stationToId: '',
    currency: 'EUR' as Currency,
    language: 'ro' as Language,
    passengerCount: 3,
    maxTotalItems: 10,
    maxTotalCost: 500,
    showAdvanced: false
  });
  
  const [loading, setLoading] = useState(false);

  // Mock route data for context
  const mockOutboundRoute = {
    departure_city: "București",
    arrival_city: "Cluj-Napoca",
    departure_date: "2024-01-15",
    departure_time: "08:00",
    arrival_time: "15:30",
    price: 75,
    currency: "RON",
    luggage: "1 bagaj până la 20kg inclus gratuit, bagaj de mână până la 5kg"
  };

  const mockReturnRoute = {
    departure_city: "Cluj-Napoca", 
    arrival_city: "București",
    departure_date: "2024-01-22",
    departure_time: "16:00",
    arrival_time: "23:30",
    price: 75,
    currency: "RON"
  };

  // ===============================
  // Effects
  // ===============================
  
  useEffect(() => {
    updateApiStats();
    const interval = setInterval(updateApiStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadLegacyBaggage();
  }, []);

  // ===============================
  // Legacy System Functions
  // ===============================
  
  const loadLegacyBaggage = async () => {
    try {
      setLoading(true);
      // Simulate legacy baggage loading
      const legacyResponse = await getBaggage({ 
        interval_id: "54321", 
        station_to_id: "station_123",
        currency: "EUR" 
      });
      // Extract baggage items from normalized response
      const baggageItems = legacyResponse.baggage_items || [];
      setLegacyBaggage(baggageItems);
    } catch (error) {
      console.error("Error loading legacy baggage:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLegacyBaggageCost = (baggage: PassengerBaggage[]) => {
    return baggage.reduce((sum, b) => sum + b.total_price, 0);
  };

  // ===============================
  // New System Functions
  // ===============================
  
  const updateApiStats = () => {
    const stats = getBaggageApiStats();
    setApiStats(stats);
  };
  
  const handleClearCache = () => {
    clearBaggageCache();
    updateApiStats();
  };

  const handleNewSelectionChange = (selection: BaggageSelectionType[]) => {
    setNewBaggageSelection(selection);
  };
  
  const handleNewPayloadReady = (payload: NewOrderBaggagePayload) => {
    setNewOrderPayload(payload);
  };
  
  const handleConfigChange = (field: string, value: string | number | boolean) => {
    setDemoConfig(prev => ({
      ...prev,
      [field]: field === 'currency' ? value as Currency : 
               field === 'language' ? value as Language : 
               value
    }));
  };

  const selectedInterval = DEMO_INTERVALS.find(i => i.id === demoConfig.intervalId);
  const useNewSystem = selectedInterval?.request_get_baggage === 1;

  // ===============================
  // Render Functions
  // ===============================
  
  const renderConfiguration = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Configurare Demo
        </CardTitle>
        <CardDescription>
          Configurează parametrii pentru testarea bagajelor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Interval Selection */}
          <div className="space-y-2">
            <Label htmlFor="interval">Interval / Rută</Label>
            <select
              id="interval"
              className="w-full p-2 border rounded-md"
              value={demoConfig.intervalId}
              onChange={(e) => handleConfigChange('intervalId', e.target.value)}
            >
              {DEMO_INTERVALS.map(interval => (
                <option key={interval.id} value={interval.id}>
                  {interval.name} {interval.request_get_baggage ? '(NEW)' : '(LEGACY)'}
                </option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground">
              {useNewSystem ? '✅ Folosește noul sistem get_baggage' : '❌ Sistem legacy (doar text)'}
            </div>
          </div>
          
          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Monedă</Label>
            <select
              id="currency"
              className="w-full p-2 border rounded-md"
              value={demoConfig.currency}
              onChange={(e) => handleConfigChange('currency', e.target.value)}
              disabled={!useNewSystem}
            >
              <option value="EUR">EUR</option>
              <option value="RON">RON</option>
              <option value="USD">USD</option>
            </select>
          </div>
          
          {/* Passenger Count */}
          <div className="space-y-2">
            <Label htmlFor="passengers">Număr călători</Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              max="10"
              value={demoConfig.passengerCount}
              onChange={(e) => handleConfigChange('passengerCount', parseInt(e.target.value) || 1)}
            />
          </div>
          
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Limbă</Label>
            <select
              id="language"
              className="w-full p-2 border rounded-md"
              value={demoConfig.language}
              onChange={(e) => handleConfigChange('language', e.target.value)}
              disabled={!useNewSystem}
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Options - Only for new system */}
        {useNewSystem && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => handleConfigChange('showAdvanced', !demoConfig.showAdvanced)}
            >
              {demoConfig.showAdvanced ? 'Ascunde' : 'Arată'} opțiuni avansate
            </Button>
            
            {demoConfig.showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="stationFrom">Stația de plecare (opțional)</Label>
                  <select
                    id="stationFrom"
                    className="w-full p-2 border rounded-md"
                    value={demoConfig.stationFromId}
                    onChange={(e) => handleConfigChange('stationFromId', e.target.value)}
                  >
                    <option value="">-- Selectează --</option>
                    {DEMO_STATIONS.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stationTo">Stația de sosire (opțional)</Label>
                  <select
                    id="stationTo"
                    className="w-full p-2 border rounded-md"
                    value={demoConfig.stationToId}
                    onChange={(e) => handleConfigChange('stationToId', e.target.value)}
                  >
                    <option value="">-- Selectează --</option>
                    {DEMO_STATIONS.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxItems">Limită bagaje totale</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    min="1"
                    max="50"
                    value={demoConfig.maxTotalItems}
                    onChange={(e) => handleConfigChange('maxTotalItems', parseInt(e.target.value) || 10)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxCost">Limită cost total</Label>
                  <Input
                    id="maxCost"
                    type="number"
                    min="10"
                    max="2000"
                    value={demoConfig.maxTotalCost}
                    onChange={(e) => handleConfigChange('maxTotalCost', parseInt(e.target.value) || 500)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderApiStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3Icon className="h-5 w-5" />
          Statistici API
        </CardTitle>
        <CardDescription>
          Performanța și cache-ul sistemului nou
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats.performance.total_requests}</div>
                <div className="text-xs text-muted-foreground">Total cereri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats.performance.cache_hit_ratio}%</div>
                <div className="text-xs text-muted-foreground">Cache hit ratio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats.cache.total_entries}</div>
                <div className="text-xs text-muted-foreground">Intrări cache</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {apiStats.state.loading ? 'DA' : 'NU'}
                </div>
                <div className="text-xs text-muted-foreground">Se încarcă</div>
              </div>
            </div>
            
            {apiStats.state.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Ultima eroare: {apiStats.state.error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={updateApiStats}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Actualizează
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
              >
                Golește cache
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Se încarcă statisticile...
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPayloadPreview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CodeIcon className="h-5 w-5" />
          New Order Payload
        </CardTitle>
        <CardDescription>
          Payload generat pentru API new_order
        </CardDescription>
      </CardHeader>
      <CardContent>
        {newOrderPayload ? (
          <div className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Payload generat cu succes și gata pentru trimitere către new_order API
              </AlertDescription>
            </Alert>
            
            <Textarea
              value={JSON.stringify(newOrderPayload, null, 2)}
              readOnly
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(newOrderPayload, null, 2))}
              >
                Copiază JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => console.log('New Order Payload:', newOrderPayload)}
              >
                Log în consolă
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {useNewSystem ? 'Selectează bagaje pentru a genera payload-ul' : 'Payload disponibil doar pentru noul sistem'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const handleBooking = () => {
    const legacyCost = calculateLegacyBaggageCost(selectedLegacyBaggage);
    
    const bookingData = {
      system: useNewSystem ? 'NEW_GET_BAGGAGE' : 'LEGACY',
      route: mockReturnRoute,
      passengers: demoConfig.passengerCount,
      legacy_baggage: useNewSystem ? [] : selectedLegacyBaggage,
      new_baggage: useNewSystem ? newBaggageSelection : [],
      new_order_payload: useNewSystem ? newOrderPayload : null,
      total_baggage_cost: useNewSystem ? 
        (newOrderPayload?.baggage_metadata?.total_cost || 0) : 
        legacyCost,
      total: (demoConfig.passengerCount * mockReturnRoute.price) + 
             (useNewSystem ? 
               (newOrderPayload?.baggage_metadata?.total_cost || 0) : 
               legacyCost)
    };
    
    console.log("Booking data:", bookingData);
    alert(`Rezervare simulată! Sistem: ${bookingData.system}. Verificați consola pentru detalii.`);
  };

  // ===============================
  // Main Render
  // ===============================

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Încărcare sisteme bagaje...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Demo Sistem Bagaje</h1>
          <p className="text-muted-foreground">
            Compară sistemul legacy cu noul sistem get_baggage
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge variant={useNewSystem ? "default" : "secondary"} className="text-sm">
          {useNewSystem ? '🚀 Noul sistem GET_BAGGAGE activ' : '📜 Sistem legacy activ'}
        </Badge>
      </div>

      {/* Configuration */}
      {renderConfiguration()}

      {/* Trip Context */}
      <Card className="my-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Context Călătorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <MapPin className="h-4 w-4" />
                Dus: {mockOutboundRoute.departure_city} → {mockOutboundRoute.arrival_city}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mockOutboundRoute.departure_date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mockOutboundRoute.departure_time} - {mockOutboundRoute.arrival_time}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <MapPin className="h-4 w-4" />
                Întoarcere: {mockReturnRoute.departure_city} → {mockReturnRoute.arrival_city}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mockReturnRoute.departure_date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mockReturnRoute.departure_time} - {mockReturnRoute.arrival_time}
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{demoConfig.passengerCount} călători</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Preț standard per segment</div>
              <div className="text-lg font-bold">{mockReturnRoute.price} {mockReturnRoute.currency}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="baggage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="baggage">
            {useNewSystem ? 'Bagaje NOI' : 'Bagaje Legacy'}
          </TabsTrigger>
          <TabsTrigger value="payload" disabled={!useNewSystem}>
            Payload
          </TabsTrigger>
          <TabsTrigger value="stats" disabled={!useNewSystem}>
            Statistici
          </TabsTrigger>
          <TabsTrigger value="comparison">
            Comparație
          </TabsTrigger>
        </TabsList>

        <TabsContent value="baggage" className="space-y-6">
          {useNewSystem ? (
            // NEW SYSTEM
            <BaggageSelection
              intervalId={demoConfig.intervalId}
              stationFromId={demoConfig.stationFromId || undefined}
              stationToId={demoConfig.stationToId || undefined}
              currency={demoConfig.currency}
              language={demoConfig.language}
              passengerCount={demoConfig.passengerCount}
              maxTotalItems={demoConfig.maxTotalItems}
              maxTotalCost={demoConfig.maxTotalCost}
              onSelectionChange={handleNewSelectionChange}
              onPayloadReady={handleNewPayloadReady}
              showCostSummary={true}
              showValidationErrors={true}
              groupByCategory={true}
              compactMode={false}
              readonly={false}
            />
          ) : (
            // LEGACY SYSTEM
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Legacy - Informații Bagaje</CardTitle>
                  <CardDescription>
                    Pentru rute cu request_get_baggage = 0 se afișează doar textul informativ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Politică bagaje:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mockOutboundRoute.luggage}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {legacyBaggage.length > 0 && (
                <BaggageSelector
                  baggage={legacyBaggage}
                  passengerCount={demoConfig.passengerCount}
                  selectedBaggage={selectedLegacyBaggage}
                  onSelectionChange={setSelectedLegacyBaggage}
                  currency="EUR"
                />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payload" className="space-y-6">
          {renderPayloadPreview()}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {renderApiStats()}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparație Sisteme</CardTitle>
              <CardDescription>
                Diferențele între sistemul legacy și noul sistem get_baggage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-red-600">Sistem Legacy</h3>
                  <ul className="space-y-2 text-sm">
                    <li>❌ Doar text informativ din route.luggage</li>
                    <li>❌ Nu permite selecție detaliată</li>
                    <li>❌ Nu oferă validare business rules</li>
                    <li>❌ Nu generează payload new_order</li>
                    <li>❌ Nu respectă limite max_per_person</li>
                    <li>❌ Nu are caching inteligent</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600">Sistem Nou GET_BAGGAGE</h3>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Lista detaliată bagaje din API</li>
                    <li>✅ Selecție interactivă cu validare</li>
                    <li>✅ Business rules (max_per_person, max_in_bus)</li>
                    <li>✅ Generare automată payload new_order</li>
                    <li>✅ Exclude bagaje gratuite din comandă</li>
                    <li>✅ Caching cu TTL 5-30 minute</li>
                    <li>✅ Rate limiting (15/min, 100/h)</li>
                    <li>✅ XML → JSON normalizare</li>
                    <li>✅ Grupare categorii (cabină, cală, special)</li>
                    <li>✅ Calcul cost în timp real</li>
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Migrare:</strong> Rutele cu request_get_baggage = 1 vor folosi noul sistem. 
                  Rutele legacy (request_get_baggage = 0) continuă să afișeze text din luggage.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <Button onClick={handleBooking} size="lg" className="flex-1">
          Simulează Rezervarea ({useNewSystem ? 'SISTEM NOU' : 'LEGACY'})
        </Button>
        <Button variant="outline" onClick={() => navigate("/discount-demo")} size="lg">
          Vezi Demo Reduceri
        </Button>
      </div>

      {/* Developer Information */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <div><strong>Info pentru dezvoltatori:</strong></div>
            <div>• <strong>Noul sistem:</strong> request_get_baggage = 1 → API get_baggage → selecție detaliată</div>
            <div>• <strong>Sistem legacy:</strong> request_get_baggage = 0 → doar text din route.luggage</div>
            <div>• <strong>Business rules:</strong> bagaj cu price = 0 NU se trimite la new_order</div>
            <div>• <strong>Payload format:</strong> baggage: [{'{'} baggage_id: "123", quantity: "2" {'}'}]</div>
            <div>• <strong>Validare:</strong> max_per_person respectat, max_in_bus ca warning</div>
            <div>• <strong>Cache:</strong> per (interval_id, station_from_id, station_to_id, currency, lang)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
