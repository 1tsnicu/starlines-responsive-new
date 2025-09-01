/**
 * SEATS DEMO PAGE
 * 
 * Pagină demonstrativă pentru sistemul de selectare locuri
 * Include toate funcționalitățile: trenuri, autobuze, cache, statistici
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Train, 
  Bus, 
  Settings, 
  BarChart3, 
  RefreshCw, 
  Download,
  Info,
  MapPin,
  Clock,
  CreditCard
} from 'lucide-react';

import { SeatSelection } from '@/components/SeatSelection';
import type { SeatSelection as SelectedSeat, SeatsCacheStats } from '@/types/getFreeSeats';
import { 
  getApiCacheStats,
  invalidateIntervalCache,
  type FreeSeatsApiConfig 
} from '@/lib/freeSeatsApi';

// ===============================
// Demo Configuration
// ===============================

const DEMO_INTERVALS = [
  {
    id: 'INT001',
    name: 'Bucharest → Cluj-Napoca',
    type: 'train' as const,
    departure: '08:30',
    arrival: '15:45',
    duration: '7h 15m',
    trains: [
      { id: 'T001', name: 'InterCity 401', vagons: ['V1', 'V2', 'V3'] },
      { id: 'T002', name: 'Rapid 302', vagons: ['V1', 'V2'] }
    ]
  },
  {
    id: 'INT002', 
    name: 'Timișoara → Iași',
    type: 'bus' as const,
    departure: '06:00',
    arrival: '14:30',
    duration: '8h 30m',
    buses: [
      { id: 'B001', name: 'Express Bus 1' },
      { id: 'B002', name: 'Comfort Plus' }
    ]
  },
  {
    id: 'INT003',
    name: 'Constanța → Brașov', 
    type: 'train' as const,
    departure: '09:15',
    arrival: '13:45',
    duration: '4h 30m',
    trains: [
      { id: 'T003', name: 'Regional 201', vagons: ['V1', 'V2', 'V3', 'V4'] }
    ]
  }
];

const DEMO_CREDENTIALS = {
  login: 'demo_user',
  password: 'demo_pass',
  session: 'demo_session_123'
};

// ===============================
// Demo Component
// ===============================

export const SeatsDemo: React.FC = () => {
  // ===============================
  // State Management
  // ===============================
  
  const [selectedInterval, setSelectedInterval] = useState(DEMO_INTERVALS[0]);
  const [selectedTrain, setSelectedTrain] = useState<string>('all');
  const [selectedVagon, setSelectedVagon] = useState<string>('all');
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('en');
  
  // Configuration state
  const [apiConfig, setApiConfig] = useState<FreeSeatsApiConfig>({
    http: {
      timeout_ms: 15000,
      max_retries: 3,
      fallback_to_xml: true,
      debug: true
    },
    cache: {
      max_entries: 100,
      default_ttl_ms: 5 * 60 * 1000,
      debug: true
    },
    force_refresh: false,
    fallback_on_error: true,
    debug: true
  });
  
  // UI state
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [cacheStats, setCacheStats] = useState<SeatsCacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // ===============================
  // Event Handlers
  // ===============================
  
  const handleIntervalChange = useCallback((intervalId: string) => {
    const interval = DEMO_INTERVALS.find(i => i.id === intervalId);
    if (interval) {
      setSelectedInterval(interval);
      setSelectedTrain('all');
      setSelectedVagon('all');
      setSelectedSeats([]);
      setLastError(null);
    }
  }, []);
  
  const handleSeatSelection = useCallback((seats: SelectedSeat[]) => {
    setSelectedSeats(seats);
  }, []);
  
  const handleError = useCallback((error: Error) => {
    setLastError(error.message);
  }, []);
  
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  
  const refreshCacheStats = useCallback(() => {
    const stats = getApiCacheStats(apiConfig.cache);
    setCacheStats(stats as SeatsCacheStats);
  }, [apiConfig.cache]);
  
  const clearIntervalCache = useCallback(() => {
    const deletedCount = invalidateIntervalCache(selectedInterval.id, apiConfig.cache);
    alert(`Cleared ${deletedCount} cache entries for interval ${selectedInterval.id}`);
    refreshCacheStats();
  }, [selectedInterval.id, apiConfig.cache, refreshCacheStats]);
  
  const downloadSeatsData = useCallback(() => {
    if (selectedSeats.length === 0) {
      alert('No seats selected to download');
      return;
    }
    
    const data = {
      interval_id: selectedInterval.id,
      interval_name: selectedInterval.name,
      selected_seats: selectedSeats,
      total_price: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
      currency,
      selection_date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seats-selection-${selectedInterval.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedSeats, selectedInterval, currency]);
  
  // ===============================
  // Render Helpers
  // ===============================
  
  const renderIntervalCard = (interval: typeof DEMO_INTERVALS[0]) => (
    <Card key={interval.id} className={`cursor-pointer transition-all ${
      selectedInterval.id === interval.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
    }`} onClick={() => handleIntervalChange(interval.id)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {interval.type === 'train' ? (
              <Train size={18} className="text-blue-600" />
            ) : (
              <Bus size={18} className="text-green-600" />
            )}
            <span className="font-medium">{interval.name}</span>
          </div>
          <Badge variant={interval.type === 'train' ? 'default' : 'secondary'}>
            {interval.type}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{interval.departure}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin size={14} />
            <span>{interval.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{interval.arrival}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderConfigPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings size={18} />
          <span>Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="RON">RON (Lei)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ro">Română</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedInterval.type === 'train' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="train">Select Train (Optional)</Label>
              <Select value={selectedTrain} onValueChange={setSelectedTrain}>
                <SelectTrigger>
                  <SelectValue placeholder="All trains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All trains</SelectItem>
                  {selectedInterval.trains?.map(train => (
                    <SelectItem key={train.id} value={train.id}>
                      {train.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTrain && (
              <div>
                <Label htmlFor="vagon">Select Vagon (Optional)</Label>
                <Select value={selectedVagon} onValueChange={setSelectedVagon}>
                  <SelectTrigger>
                    <SelectValue placeholder="All vagons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vagons</SelectItem>
                    {selectedInterval.trains
                      ?.find(t => t.id === selectedTrain)
                      ?.vagons.map(vagon => (
                        <SelectItem key={vagon} value={vagon}>
                          Vagon {vagon}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Label htmlFor="advanced">Advanced Configuration</Label>
          <Switch
            id="advanced"
            checked={showAdvancedConfig}
            onCheckedChange={setShowAdvancedConfig}
          />
        </div>
        
        {showAdvancedConfig && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={apiConfig.http?.timeout_ms || 15000}
                  onChange={(e) => setApiConfig(prev => ({
                    ...prev,
                    http: { ...prev.http, timeout_ms: parseInt(e.target.value) }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="retries">Max Retries</Label>
                <Input
                  id="retries"
                  type="number"
                  value={apiConfig.http?.max_retries || 3}
                  onChange={(e) => setApiConfig(prev => ({
                    ...prev,
                    http: { ...prev.http, max_retries: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="forceRefresh">Force Refresh (Bypass Cache)</Label>
              <Switch
                id="forceRefresh"
                checked={apiConfig.force_refresh || false}
                onCheckedChange={(checked) => setApiConfig(prev => ({
                  ...prev,
                  force_refresh: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="debug">Debug Mode</Label>
              <Switch
                id="debug"
                checked={apiConfig.debug || false}
                onCheckedChange={(checked) => setApiConfig(prev => ({
                  ...prev,
                  debug: checked,
                  http: { ...prev.http, debug: checked },
                  cache: { ...prev.cache, debug: checked }
                }))}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderCacheStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 size={18} />
            <span>Cache Statistics</span>
          </div>
          <Button variant="outline" size="sm" onClick={refreshCacheStats}>
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cacheStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.hits}</div>
              <div className="text-sm text-gray-600">Cache Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{cacheStats.misses}</div>
              <div className="text-sm text-gray-600">Cache Misses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cacheStats.hit_rate}%</div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{cacheStats.total_entries}</div>
              <div className="text-sm text-gray-600">Entries</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Click refresh to load cache statistics
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={clearIntervalCache}>
            Clear Cache for Current Interval
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderSelectedSeats = () => {
    if (selectedSeats.length === 0) return null;
    
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-green-800">
            <span>Selected Seats ({selectedSeats.length})</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">{totalPrice} {currency}</span>
              <Button variant="outline" size="sm" onClick={downloadSeatsData}>
                <Download size={14} className="mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedSeats.map(seat => (
              <div key={seat.seat_number} className="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                  <span className="font-medium">Seat {seat.seat_number}</span>
                  {seat.vagon_id && (
                    <span className="text-sm text-gray-600 ml-2">Vagon {seat.vagon_id}</span>
                  )}
                </div>
                <span className="font-medium">{seat.price} {currency}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // ===============================
  // Main Render
  // ===============================
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Free Seats Selection Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Demonstrație completă pentru sistemul de selectare locuri libere. 
          Testează funcționalitățile pentru trenuri și autobuze cu cache inteligent.
        </p>
      </div>
      
      {/* Interval Selection */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Select Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_INTERVALS.map(renderIntervalCard)}
        </div>
      </div>
      
      {/* Debug Info */}
      {import.meta.env.DEV && (
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode:</strong> Using proxy at <code>/api/bussystem</code>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Display */}
      {lastError && (
        <Alert className="border-red-200 bg-red-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {lastError}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Configuration and Stats */}
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="stats">Cache Stats</TabsTrigger>
          <TabsTrigger value="selected">Selected Seats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          {renderConfigPanel()}
        </TabsContent>
        
        <TabsContent value="stats">
          {renderCacheStats()}
        </TabsContent>
        
        <TabsContent value="selected">
          {renderSelectedSeats()}
        </TabsContent>
      </Tabs>
      
      {/* Seat Selection Component */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Seat Selection - {selectedInterval.name}
        </h2>
        
        <SeatSelection
          intervalId={selectedInterval.id}
          login={DEMO_CREDENTIALS.login}
          password={DEMO_CREDENTIALS.password}
          trainId={selectedTrain || undefined}
          vagonId={selectedVagon === 'all' ? undefined : selectedVagon}
          currency={currency}
          lang={language}
          session={DEMO_CREDENTIALS.session}
          maxSeats={4}
          allowMultipleSelection={true}
          showPrices={true}
          showSeatNumbers={true}
          showLegend={true}
          showStatistics={true}
          onSeatSelect={handleSeatSelection}
          onError={handleError}
          onLoadingChange={handleLoadingChange}
          apiConfig={apiConfig}
          className="border rounded-lg p-6 bg-white shadow-sm"
        />
      </div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">Loading seats...</span>
            </div>
          </Card>
        </div>
      )}
      
      {/* Footer */}
      <div className="text-center text-gray-600 border-t pt-8">
        <p>
          Demo implementation of get_free_seats API integration. 
          All data is simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
};

export default SeatsDemo;
