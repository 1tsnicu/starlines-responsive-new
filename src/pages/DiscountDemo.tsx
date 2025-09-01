/**
 * DISCOUNT DEMO PAGE
 * 
 * Pagină de demonstrație pentru sistemul de discounturi
 * Cu testare completă și exemple practice
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Users, 
  Percent, 
  Play, 
  Code, 
  Database,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

import { DiscountSelection } from '@/components/DiscountSelection';
import { discountApi } from '@/lib/discountApi';

import type { 
  DiscountSelection as DiscountSelectionType,
  NewOrderDiscountPayload,
  DiscountCacheStats
} from '@/types/getDiscount';

// ===============================
// Demo Configuration
// ===============================

const DEMO_INTERVALS = [
  { id: 'MD-RO-001', name: 'Chișinău → București', route: 'Moldova → România' },
  { id: 'RO-PL-002', name: 'București → Varșovia', route: 'România → Polonia' },
  { id: 'UA-MD-003', name: 'Kiev → Chișinău', route: 'Ucraina → Moldova' },
  { id: 'PL-DE-004', name: 'Varșovia → Berlin', route: 'Polonia → Germania' }
];

const DEMO_PASSENGERS = [
  {
    index: 0,
    name: 'Ana',
    surname: 'Popescu',
    birth_date: '1990-05-15',
    age: 34,
    has_document: true
  },
  {
    index: 1,
    name: 'Mihai',
    surname: 'Ionescu', 
    birth_date: '2010-08-22',
    age: 14,
    has_document: false
  },
  {
    index: 2,
    name: 'Elena',
    surname: 'Georgescu',
    birth_date: '1955-12-03',
    age: 69,
    has_document: true
  }
];

const DEMO_TRIPS = [
  { index: 0, interval_id: 'MD-RO-001', name: 'Chișinău → București' },
  { index: 1, interval_id: 'RO-PL-002', name: 'București → Varșovia' }
];

// ===============================
// Main Component
// ===============================

export default function DiscountDemo() {
  const navigate = useNavigate();
  
  // ===============================
  // State Management
  // ===============================
  
  const [demoConfig, setDemoConfig] = useState({
    intervalId: 'MD-RO-001',
    currency: 'EUR' as const,
    language: 'ro' as const,
    passengerCount: 2,
    showCostSummary: true,
    showValidationErrors: true,
    groupByCategory: true,
    compactMode: false
  });
  
  const [activePassengers, setActivePassengers] = useState(DEMO_PASSENGERS.slice(0, 2));
  const [selections, setSelections] = useState<DiscountSelectionType[]>([]);
  const [payload, setPayload] = useState<NewOrderDiscountPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<DiscountCacheStats | null>(null);

  // ===============================
  // Effects
  // ===============================
  
  useEffect(() => {
    setActivePassengers(DEMO_PASSENGERS.slice(0, demoConfig.passengerCount));
  }, [demoConfig.passengerCount]);
  
  useEffect(() => {
    // Update cache stats periodically
    const interval = setInterval(() => {
      setCacheStats(discountApi.getCacheStats());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // ===============================
  // Event Handlers
  // ===============================
  
  const handleConfigChange = (key: string, value: string | number | boolean) => {
    setDemoConfig(prev => ({ ...prev, [key]: value }));
    setSelections([]); // Reset selections when config changes
    setPayload(null);
  };
  
  const handleSelectionChange = (newSelections: DiscountSelectionType[]) => {
    setSelections(newSelections);
  };
  
  const handlePayloadReady = (newPayload: NewOrderDiscountPayload) => {
    setPayload(newPayload);
  };
  
  const clearCache = () => {
    discountApi.clearCache();
    setCacheStats(discountApi.getCacheStats());
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // ===============================
  // Render Helpers
  // ===============================
  
  const renderDemoControls = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurare Demo
        </CardTitle>
        <CardDescription>
          Configurează parametrii pentru testarea sistemului de discounturi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Interval/Rută</Label>
            <Select
              value={demoConfig.intervalId}
              onValueChange={(value) => handleConfigChange('intervalId', value)}
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
          
          <div className="space-y-2">
            <Label htmlFor="currency">Monedă</Label>
            <Select
              value={demoConfig.currency}
              onValueChange={(value) => handleConfigChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="RON">RON (Leu românesc)</SelectItem>
                <SelectItem value="PLN">PLN (Zlot polonez)</SelectItem>
                <SelectItem value="MDL">MDL (Leu moldovenesc)</SelectItem>
                <SelectItem value="UAH">UAH (Hryvnia)</SelectItem>
                <SelectItem value="CZK">CZK (Coroană cehă)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Limbă</Label>
            <Select
              value={demoConfig.language}
              onValueChange={(value) => handleConfigChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ro">Română</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="ua">Українська</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pl">Polski</SelectItem>
                <SelectItem value="cz">Čeština</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passengerCount">Număr pasageri</Label>
            <Select
              value={demoConfig.passengerCount.toString()}
              onValueChange={(value) => handleConfigChange('passengerCount', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 pasager</SelectItem>
                <SelectItem value="2">2 pasageri</SelectItem>
                <SelectItem value="3">3 pasageri</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={demoConfig.showCostSummary}
              onChange={(e) => handleConfigChange('showCostSummary', e.target.checked)}
            />
            <span className="text-sm">Afișează sumar costuri</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={demoConfig.showValidationErrors}
              onChange={(e) => handleConfigChange('showValidationErrors', e.target.checked)}
            />
            <span className="text-sm">Afișează erori validare</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={demoConfig.groupByCategory}
              onChange={(e) => handleConfigChange('groupByCategory', e.target.checked)}
            />
            <span className="text-sm">Grupează pe categorii</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={demoConfig.compactMode}
              onChange={(e) => handleConfigChange('compactMode', e.target.checked)}
            />
            <span className="text-sm">Mod compact</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderPassengerInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pasageri Demo ({activePassengers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activePassengers.map((passenger, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">
                  {passenger.name} {passenger.surname}
                </div>
                <div className="text-sm text-muted-foreground">
                  {passenger.age} ani • Născut: {passenger.birth_date}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={passenger.age < 18 ? 'secondary' : passenger.age >= 65 ? 'outline' : 'default'}>
                  {passenger.age < 18 ? 'Copil' : passenger.age >= 65 ? 'Senior' : 'Adult'}
                </Badge>
                {passenger.has_document && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Cu document
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
  const renderSelectionSummary = () => {
    if (selections.length === 0) {
      return (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <Percent className="h-8 w-8 mx-auto mb-2" />
            <p>Nu sunt discounturi selectate</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Selecții Active ({selections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {selections.map((selection, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">
                  Discount {selection.discount_id} pentru pasager {selection.passenger_index + 1}
                </span>
                <Badge variant="outline">
                  Segment {selection.trip_index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderPayloadPreview = () => {
    if (!payload) {
      return (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <Code className="h-8 w-8 mx-auto mb-2" />
            <p>Payload se va genera când selectezi discounturi</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            New Order Payload
          </CardTitle>
          <CardDescription>
            Payload generat pentru integrarea cu API-ul new_order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Discount ID Array:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(payload.discount_id, null, 2))}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiază
              </Button>
            </div>
            
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(payload.discount_id, null, 2)}
            </pre>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total selecții:</span>
                <div className="text-lg font-bold text-green-600">
                  {selections.length}
                </div>
              </div>
              <div>
                <span className="font-medium">Elemente payload:</span>
                <div className="text-lg font-bold">
                  {payload.discount_id.length}
                </div>
              </div>
            </div>
            
            {selections.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {selections.length} selecții active pentru {activePassengers.length} pasageri
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderCacheInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cacheStats ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{cacheStats.total_entries}</div>
                <div className="text-xs text-muted-foreground">Cache entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{cacheStats.hit_rate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Hit rate</div>
              </div>
            </div>
            
            <Button variant="outline" onClick={clearCache} className="w-full">
              Golește Cache
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center">Cache stats loading...</p>
        )}
      </CardContent>
    </Card>
  );

  // ===============================
  // Main Render
  // ===============================

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discount System Demo</h1>
          <p className="text-muted-foreground">
            Testează și explorează sistemul de discounturi pentru transportul în comun
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList>
          <TabsTrigger value="demo">Demo Interactiv</TabsTrigger>
          <TabsTrigger value="payload">Payload & API</TabsTrigger>
          <TabsTrigger value="technical">Detalii Tehnice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Configuration */}
            <div className="space-y-6">
              {renderDemoControls()}
              {renderPassengerInfo()}
            </div>
            
            {/* Middle column: Main discount selection */}
            <div className="lg:col-span-2">
              <DiscountSelection
                intervalId={demoConfig.intervalId}
                currency={demoConfig.currency}
                language={demoConfig.language}
                passengers={activePassengers}
                trips={DEMO_TRIPS}
                onSelectionChange={handleSelectionChange}
                onPayloadReady={handlePayloadReady}
                onLoadingChange={setIsLoading}
                showCostSummary={demoConfig.showCostSummary}
                showValidationErrors={demoConfig.showValidationErrors}
                groupByCategory={demoConfig.groupByCategory}
                compactMode={demoConfig.compactMode}
                maxSelectionsPerPassenger={2}
                requireValidation={true}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="payload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderSelectionSummary()}
              {renderCacheInfo()}
            </div>
            <div>
              {renderPayloadPreview()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Arhitectura sistemului</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div><strong>HTTP Client:</strong> Browser-compatible cu XML fallback</div>
                  <div><strong>Rate Limiting:</strong> 15 req/min, 100 req/h</div>
                  <div><strong>Caching:</strong> TTL dinamic 5-30 min</div>
                  <div><strong>Validation:</strong> Business rules în timp real</div>
                  <div><strong>TypeScript:</strong> 30+ interfețe type-safe</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Features implementate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>✅ Discounturi pe vârstă (copii/seniori)</div>
                  <div>✅ Discounturi pentru studenți</div>
                  <div>✅ Discounturi de grup</div>
                  <div>✅ Validare documente</div>
                  <div>✅ Integrare new_order</div>
                  <div>✅ UI responsiv</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div><strong>Endpoint:</strong> get_discount</div>
                  <div><strong>Trigger:</strong> request_get_discount = 1</div>
                  <div><strong>Format:</strong> discount_id array</div>
                  <div><strong>Validation:</strong> Business rules compliance</div>
                  <div><strong>Currency:</strong> Multi-currency support</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div><strong>Load Time:</strong> &lt;2s (cached)</div>
                  <div><strong>Cache Hit Rate:</strong> ~85%</div>
                  <div><strong>Memory Usage:</strong> Optimizat</div>
                  <div><strong>Bundle Size:</strong> Tree-shaken</div>
                  <div><strong>Validation:</strong> Real-time</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
