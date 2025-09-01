// Demo page for bus plan visualization system
// Shows different bus types and plan configurations

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bus, 
  Settings, 
  BarChart3, 
  RefreshCw, 
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react';

import { BusPlanVisualization } from '@/components/BusPlanVisualization';
import { 
  getBusPlan, 
  preloadBusPlans, 
  getBusPlanCacheStats,
  clearBusPlanCache,
  analyzeBusPlan
} from '@/lib/planApi';

import type { 
  BusPlan, 
  BusPlanConfig, 
  SeatSelectionState,
  PlanApiResponse,
  PlanCacheStats
} from '@/types/getPlan';

// Demo bus types (these would normally come from API)
const DEMO_BUS_TYPES = [
  { id: '1', name: 'Standard City Bus', description: 'Regular city transport', seats: 45 },
  { id: '2', name: 'Double Decker', description: 'Two-floor tourist bus', seats: 80 },
  { id: '3', name: 'Coach Bus', description: 'Long distance comfort', seats: 55 },
  { id: '22', name: 'Minibus', description: 'Small group transport', seats: 25 },
  { id: '15', name: 'Express Bus', description: 'High-speed intercity', seats: 50 },
];

export const PlanDemo: React.FC = () => {
  // Selected bus type and configuration
  const [selectedBusTypeId, setSelectedBusTypeId] = useState<string>('22');
  const [customBusTypeId, setCustomBusTypeId] = useState<string>('');
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');
  const [version, setVersion] = useState<1.1 | 2.0>(2.0);
  
  // Plan data and loading state
  const [currentPlan, setCurrentPlan] = useState<BusPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Selection state
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [maxSeats, setMaxSeats] = useState<number>(4);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('multiple');
  
  // Configuration options
  const [showSeatNumbers, setShowSeatNumbers] = useState(true);
  const [enableSelection, setEnableSelection] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);
  
  // Cache stats
  const [cacheStats, setCacheStats] = useState<PlanCacheStats | null>(null);

  // Load plan
  const loadPlan = useCallback(async (busTypeId: string) => {
    if (!busTypeId) return;
    
    setIsLoading(true);
    setLastError(null);
    
    try {
      console.log(`Loading plan for bus type: ${busTypeId}`);
      
      const result = await getBusPlan(busTypeId, {
        orientation,
        version,
        useCache: true
      });
      
      if (result.success && result.data) {
        setCurrentPlan(result.data.plan);
        console.log('Plan loaded successfully:', result.data.plan);
      } else {
        setLastError(result.error?.message || 'Failed to load plan');
        setCurrentPlan(null);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      setCurrentPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [orientation, version]);

  // Handle bus type change
  const handleBusTypeChange = useCallback((busTypeId: string) => {
    setSelectedBusTypeId(busTypeId);
    if (busTypeId !== 'custom') {
      setSelectedSeats([]);
      loadPlan(busTypeId);
    }
  }, [loadPlan]);

  // Handle custom bus type
  const handleCustomBusType = useCallback(() => {
    if (customBusTypeId.trim()) {
      setSelectedSeats([]);
      loadPlan(customBusTypeId.trim());
    }
  }, [customBusTypeId, loadPlan]);

  // Handle seat selection
  const handleSeatSelection = useCallback((seats: string[]) => {
    setSelectedSeats(seats);
  }, []);

  // Refresh cache stats
  const refreshCacheStats = useCallback(() => {
    const stats = getBusPlanCacheStats();
    setCacheStats(stats);
  }, []);

  // Clear cache
  const handleClearCache = useCallback(() => {
    clearBusPlanCache();
    refreshCacheStats();
    setCurrentPlan(null);
  }, [refreshCacheStats]);

  // Preload common plans
  const handlePreloadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const busTypeIds = DEMO_BUS_TYPES.map(bt => bt.id);
      const result = await preloadBusPlans(busTypeIds, { orientation, version });
      
      console.log(`Preloaded ${result.success} plans, ${result.failed} failed`);
      if (result.errors.length > 0) {
        console.warn('Preload errors:', result.errors);
      }
      
      refreshCacheStats();
    } catch (error) {
      console.error('Preload error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orientation, version, refreshCacheStats]);

  // Load initial plan
  useEffect(() => {
    if (selectedBusTypeId && selectedBusTypeId !== 'custom') {
      loadPlan(selectedBusTypeId);
    }
  }, [selectedBusTypeId, loadPlan]);

  // Update cache stats periodically
  useEffect(() => {
    refreshCacheStats();
    const interval = setInterval(refreshCacheStats, 5000);
    return () => clearInterval(interval);
  }, [refreshCacheStats]);

  // Configuration for plan visualization
  const planConfig: Partial<BusPlanConfig> = {
    orientation,
    version,
    showSeatNumbers,
    enableSelection,
    selectionMode,
    maxSelections: maxSeats
  };

  const selectionState: Partial<SeatSelectionState> = {
    selectedSeats,
    maxSeats: enableSelection ? maxSeats : undefined
  };

  // Plan analysis
  const planAnalysis = currentPlan ? analyzeBusPlan(currentPlan) : null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Bus className="h-8 w-8" />
          Bus Plan Visualization Demo
        </h1>
        <p className="text-gray-600">
          Interactive demonstration of the get_plan API with seat selection
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Plan Demo</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {/* Bus Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Bus Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Predefined Bus Types</Label>
                  <Select value={selectedBusTypeId} onValueChange={handleBusTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_BUS_TYPES.map(busType => (
                        <SelectItem key={busType.id} value={busType.id}>
                          {busType.name} ({busType.seats} seats)
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Bus Type ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedBusTypeId === 'custom' && (
                  <div>
                    <Label>Custom Bus Type ID</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customBusTypeId}
                        onChange={(e) => setCustomBusTypeId(e.target.value)}
                        placeholder="Enter bus type ID"
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomBusType()}
                      />
                      <Button onClick={handleCustomBusType} disabled={!customBusTypeId.trim()}>
                        Load
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Label>Orientation:</Label>
                  <Select value={orientation} onValueChange={(value: 'h' | 'v') => setOrientation(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h">Horizontal</SelectItem>
                      <SelectItem value="v">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Version:</Label>
                  <Select value={version.toString()} onValueChange={(value) => setVersion(parseFloat(value) as 1.1 | 2.0)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.1">1.1</SelectItem>
                      <SelectItem value="2.0">2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => selectedBusTypeId !== 'custom' && loadPlan(selectedBusTypeId)}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Reload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading state */}
          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Loading bus plan...</AlertDescription>
            </Alert>
          )}

          {/* Error state */}
          {lastError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {lastError}
              </AlertDescription>
            </Alert>
          )}

          {/* Plan visualization */}
          {currentPlan && (
            <>
              <BusPlanVisualization
                plan={currentPlan}
                config={planConfig}
                selectionState={selectionState}
                onSelectionChange={handleSeatSelection}
                showControls={showControls}
                showStatistics={showStatistics}
              />

              {/* Selection summary */}
              {selectedSeats.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Selected seats:</strong> {selectedSeats.join(', ')}
                    {maxSeats && ` (${selectedSeats.length}/${maxSeats})`}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Visualization Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Display Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label>Show Seat Numbers</Label>
                    <Switch checked={showSeatNumbers} onCheckedChange={setShowSeatNumbers} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Show Controls</Label>
                    <Switch checked={showControls} onCheckedChange={setShowControls} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Show Statistics</Label>
                    <Switch checked={showStatistics} onCheckedChange={setShowStatistics} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Selection Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label>Enable Selection</Label>
                    <Switch checked={enableSelection} onCheckedChange={setEnableSelection} />
                  </div>
                  
                  {enableSelection && (
                    <>
                      <div>
                        <Label>Selection Mode</Label>
                        <Select value={selectionMode} onValueChange={(value: 'single' | 'multiple') => setSelectionMode(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="multiple">Multiple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectionMode === 'multiple' && (
                        <div>
                          <Label>Max Seats: {maxSeats}</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={maxSeats}
                            onChange={(e) => setMaxSeats(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePreloadPlans} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Preload Common Plans
                </Button>
                <Button variant="outline" onClick={handleClearCache}>
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {/* Cache Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
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
                    <div className="text-2xl font-bold text-green-600">{cacheStats.hit_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Hit Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{cacheStats.total_entries}</div>
                    <div className="text-sm text-gray-600">Cached Plans</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No cache data available</p>
              )}
            </CardContent>
          </Card>

          {/* Plan Analysis */}
          {planAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Plan Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-lg font-semibold">{planAnalysis.statistics.totalSeats}</div>
                    <div className="text-sm text-gray-600">Total Seats</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{planAnalysis.statistics.totalFloors}</div>
                    <div className="text-sm text-gray-600">Floors</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{planAnalysis.statistics.totalRows}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{planAnalysis.statistics.availableSeats}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{planAnalysis.insights.planComplexity} complexity</Badge>
                  <Badge variant="outline">{planAnalysis.insights.layoutType}</Badge>
                  <Badge variant="outline">{planAnalysis.insights.seatDensity} density</Badge>
                </div>

                {planAnalysis.insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {planAnalysis.insights.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanDemo;
