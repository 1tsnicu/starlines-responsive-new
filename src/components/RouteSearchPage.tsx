/**
 * ROUTE SEARCH COMPONENT
 * 
 * Componentă completă pentru căutarea rutelor de transport cu:
 * - Form de căutare cu validări
 * - Listă de rezultate cu filtrare
 * - Detalii rute cu capacități (seats, plans, discounts)
 * - Integrare cu cache și error handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Bus,
  ArrowRight,
  Filter,
  SortAsc,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  Wifi,
  Zap,
  Car,
  Plane
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { PointAutocomplete } from '@/components/PointAutocomplete';
import { useLocalization } from '@/contexts/LocalizationContext';

import {
  searchRoutes,
  revalidateRouteOption,
  applyFilters,
  sortRouteOptions,
  getCacheStats,
  clearCache,
  type RouteSearchParams
} from '@/lib/routesApi';
import type { 
  RouteOption, 
  RouteSearchFilters, 
  RouteSearchError,
  TransportMode,
  LanguageCode,
  CurrencyCode 
} from '@/types/routes';
import type { PointCity } from '@/types/points';

// ===============================
// Component Props
// ===============================

interface RouteSearchPageProps {
  onRouteSelect?: (route: RouteOption) => void;
  showScheduleButton?: boolean;
  initialSearch?: {
    from?: PointCity;
    to?: PointCity;
    date?: string;
  };
}

// ===============================
// Component Types
// ===============================

interface RouteSearchState {
  // Search form
  searchForm: {
    from?: PointCity;
    to?: PointCity;
    date: string;
    allowTransfers: boolean;
    onlyByStations: boolean;
  };
  
  // Results
  loading: boolean;
  error?: RouteSearchError;
  allOptions: RouteOption[];
  filteredOptions: RouteOption[];
  
  // UI state
  filters: RouteSearchFilters;
  sortBy: 'time' | 'price' | 'duration' | 'transfers';
  selectedOption?: RouteOption;
  showFilters: boolean;
}

// ===============================
// Main Component
// ===============================

export const RouteSearchPage: React.FC<RouteSearchPageProps> = ({
  onRouteSelect,
  showScheduleButton = false,
  initialSearch
}) => {
  const { currentLanguage, currentCurrency, t } = useLocalization();
  
  const [state, setState] = useState<RouteSearchState>({
    searchForm: {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
      allowTransfers: true,
      onlyByStations: false
    },
    loading: false,
    allOptions: [],
    filteredOptions: [],
    filters: {},
    sortBy: 'time',
    showFilters: false
  });
  
  // ===============================
  // Search Logic
  // ===============================
  
  const handleSearch = async () => {
    if (!state.searchForm.from || !state.searchForm.to) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing from/to locations',
          user_message: 'Please select departure and arrival locations',
          retry_suggested: false
        }
      }));
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const searchParams: RouteSearchParams = {
        from: state.searchForm.from.point_id,
        to: state.searchForm.to.point_id,
        date: state.searchForm.date,
        currency: currentCurrency as CurrencyCode,
        language: currentLanguage as LanguageCode,
        allowTransfers: state.searchForm.allowTransfers,
        onlyByStations: state.searchForm.onlyByStations,
        ws: 1 // Start with fast search
      };
      
      console.log('🔍 Starting route search...', searchParams);
      
      const options = await searchRoutes(searchParams);
      
      setState(prev => ({
        ...prev,
        loading: false,
        allOptions: options,
        filteredOptions: sortRouteOptions(options, prev.sortBy)
      }));
      
      console.log(`✅ Search completed: ${options.length} options found`);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as RouteSearchError
      }));
    }
  };
  
  // ===============================
  // Filter & Sort Logic
  // ===============================
  
  const applyFiltersAndSort = useMemo(() => {
    let filtered = applyFilters(state.allOptions, state.filters);
    filtered = sortRouteOptions(filtered, state.sortBy);
    return filtered;
  }, [state.allOptions, state.filters, state.sortBy]);
  
  useEffect(() => {
    setState(prev => ({ ...prev, filteredOptions: applyFiltersAndSort }));
  }, [applyFiltersAndSort]);
  
  const updateFilters = (newFilters: Partial<RouteSearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  };
  
  const updateSort = (sortBy: RouteSearchState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }));
  };
  
  // ===============================
  // Route Selection
  // ===============================
  
  const handleSelectRoute = async (option: RouteOption) => {
    setState(prev => ({ ...prev, selectedOption: option }));
    
    // Call parent callback if provided
    if (onRouteSelect) {
      onRouteSelect(option);
    }
    
    // If route needs revalidation (used transfers), revalidate it
    if (option.needs_revalidation && state.searchForm.from && state.searchForm.to) {
      try {
        console.log('🔍 Revalidating route option...', option.option_id);
        
        const revalidated = await revalidateRouteOption(option, {
          from: state.searchForm.from.point_id,
          to: state.searchForm.to.point_id,
          date: state.searchForm.date,
          currency: currentCurrency as CurrencyCode,
          language: currentLanguage as LanguageCode
        });
        
        setState(prev => ({ ...prev, selectedOption: revalidated }));
        console.log('✅ Route revalidated successfully');
        
      } catch (error) {
        console.error('❌ Route revalidation failed:', error);
        // Keep original option but show warning
      }
    }
  };
  
  // ===============================
  // Utility Functions
  // ===============================
  
  const formatDuration = (duration?: string) => {
    if (!duration) return '';
    const [hours, minutes] = duration.split(':');
    return `${hours}h ${minutes}m`;
  };
  
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Preț la cerere';
    return `${price} ${currency || currentCurrency}`;
  };
  
  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'train': return <Car className="h-4 w-4" />;
      case 'air': return <Plane className="h-4 w-4" />;
      case 'mixed': return <ArrowRight className="h-4 w-4" />;
      default: return <Bus className="h-4 w-4" />;
    }
  };
  
  const getComfortIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'wifi': return <Wifi className="h-3 w-3" />;
      case '220v': return <Zap className="h-3 w-3" />;
      case 'wc': return <Users className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };
  
  // ===============================
  // Render Functions
  // ===============================
  
  const renderSearchForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          Căutare Rute Transport
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Location */}
          <div className="space-y-2">
            <Label htmlFor="from">Plecare din</Label>
            <PointAutocomplete
              value={state.searchForm.from}
              onSelect={(point) => setState(prev => ({
                ...prev,
                searchForm: { ...prev.searchForm, from: point }
              }))}
              transport="bus"
              language={currentLanguage as LanguageCode}
              placeholder="Selectează orașul de plecare..."
            />
          </div>
          
          {/* To Location */}
          <div className="space-y-2">
            <Label htmlFor="to">Destinația</Label>
            <PointAutocomplete
              value={state.searchForm.to}
              onSelect={(point) => setState(prev => ({
                ...prev,
                searchForm: { ...prev.searchForm, to: point }
              }))}
              transport="bus"
              language={currentLanguage as LanguageCode}
              placeholder="Selectează destinația..."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data plecare</Label>
            <Input
              id="date"
              type="date"
              value={state.searchForm.date}
              onChange={(e) => setState(prev => ({
                ...prev,
                searchForm: { ...prev.searchForm, date: e.target.value }
              }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Transfers */}
          <div className="space-y-2">
            <Label>Conexiuni</Label>
            <Select
              value={state.searchForm.allowTransfers ? 'yes' : 'no'}
              onValueChange={(value) => setState(prev => ({
                ...prev,
                searchForm: { ...prev.searchForm, allowTransfers: value === 'yes' }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Permite conexiuni</SelectItem>
                <SelectItem value="no">Doar directe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Station specificity */}
          <div className="space-y-2">
            <Label>Căutare</Label>
            <Select
              value={state.searchForm.onlyByStations ? 'stations' : 'cities'}
              onValueChange={(value) => setState(prev => ({
                ...prev,
                searchForm: { ...prev.searchForm, onlyByStations: value === 'stations' }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cities">În orașe</SelectItem>
                <SelectItem value="stations">Doar în stații</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSearch} 
            disabled={state.loading || !state.searchForm.from || !state.searchForm.to}
            className="flex-1"
          >
            {state.loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Căutare...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Caută Rute
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={() => clearCache()}>
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderFiltersAndSort = () => (
    <Card className="mb-4">
      <Collapsible open={state.showFilters} onOpenChange={(open) => setState(prev => ({ ...prev, showFilters: open }))}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtre și Sortare
              </span>
              <Badge variant="secondary">{state.filteredOptions.length} rezultate</Badge>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Sort */}
              <div className="space-y-2">
                <Label>Sortare</Label>
                <Select value={state.sortBy} onValueChange={updateSort}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Ora plecare</SelectItem>
                    <SelectItem value="price">Preț</SelectItem>
                    <SelectItem value="duration">Durată</SelectItem>
                    <SelectItem value="transfers">Nr. conexiuni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Max transfers */}
              <div className="space-y-2">
                <Label>Max. conexiuni</Label>
                <Select 
                  value={state.filters.max_transfers?.toString() || 'all'} 
                  onValueChange={(value) => updateFilters({ 
                    max_transfers: value === 'all' ? undefined : parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    <SelectItem value="0">Direct</SelectItem>
                    <SelectItem value="1">Max 1 conexiune</SelectItem>
                    <SelectItem value="2">Max 2 conexiuni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* E-ticket only */}
              <div className="space-y-2">
                <Label>Tip bilet</Label>
                <Select 
                  value={state.filters.eticket_only ? 'eticket' : 'all'} 
                  onValueChange={(value) => updateFilters({ 
                    eticket_only: value === 'eticket' 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    <SelectItem value="eticket">Doar E-ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Clear filters */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  variant="outline" 
                  onClick={() => setState(prev => ({ ...prev, filters: {} }))}
                  className="w-full"
                >
                  Șterge Filtre
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
  
  const renderRouteCard = (option: RouteOption) => (
    <Card 
      key={option.option_id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        state.selectedOption?.option_id === option.option_id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => handleSelectRoute(option)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getTransportIcon(option.trans)}
              <span className="font-medium">{option.main_carrier || 'Transport'}</span>
            </div>
            
            {option.transfer_count > 0 && (
              <Badge variant="secondary">
                {option.transfer_count} conexiuni
              </Badge>
            )}
            
            {option.eticket_available && (
              <Badge variant="outline">E-ticket</Badge>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatPrice(option.price_from, option.currency)}
            </div>
            {option.price_to && option.price_to !== option.price_from && (
              <div className="text-xs text-muted-foreground">
                până la {formatPrice(option.price_to, option.currency)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-bold">{option.departure.time}</div>
              <div className="text-sm text-muted-foreground">
                {option.segments[0].point_from_name}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                {formatDuration(option.duration)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold">{option.arrival.time}</div>
              <div className="text-sm text-muted-foreground">
                {option.segments[option.segments.length - 1].point_to_name}
              </div>
            </div>
          </div>
        </div>
        
        {option.comfort_features.length > 0 && (
          <div className="flex gap-2 mb-2">
            {option.comfort_features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                {getComfortIcon(feature)}
                <span>{feature}</span>
              </div>
            ))}
            {option.comfort_features.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{option.comfort_features.length - 4} mai multe
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
          <div className="flex gap-4">
            {option.canGetPlan && <span>✓ Plan locuri</span>}
            {option.canGetSeats && <span>✓ Selectare locuri</span>}
            {option.canGetDiscounts && <span>✓ Discounturi</span>}
          </div>
          
          <div>
            {option.needs_revalidation && (
              <span className="text-amber-600">Necesită revalidare</span>
            )}
          </div>
        </div>
        
        {showScheduleButton && (
          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRoute(option);
                }}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Selectează
              </Button>
              
              {option.segments.some(s => s.timetable_id) && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRoute(option);
                  }}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Vezi orar complet
                </Button>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {option.segments.some(s => s.timetable_id) ? 
                "✅ Are orar detaliat" : 
                "⚠️ Fără orar detaliat"
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderResults = () => {
    if (state.loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (state.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.error.user_message}
            {state.error.retry_suggested && (
              <Button variant="outline" size="sm" onClick={handleSearch} className="ml-2">
                Încearcă din nou
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (state.filteredOptions.length === 0 && state.allOptions.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Caută rute de transport</h3>
            <p className="text-muted-foreground">
              Selectează punctele de plecare și destinație pentru a vedea rutele disponibile.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    if (state.filteredOptions.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nu sunt rezultate</h3>
            <p className="text-muted-foreground mb-4">
              Filtrele aplicate nu au returnat rezultate. Încearcă să modifici criteriile de căutare.
            </p>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, filters: {} }))}>
              Șterge toate filtrele
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {state.filteredOptions.map(renderRouteCard)}
      </div>
    );
  };
  
  // ===============================
  // Main Render
  // ===============================
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Căutare Rute Transport</h1>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Cache: {JSON.stringify(getCacheStats())}</span>
        </div>
      </div>
      
      {renderSearchForm()}
      
      {state.allOptions.length > 0 && renderFiltersAndSort()}
      
      {renderResults()}
      
      {state.selectedOption && (
        <Card>
          <CardHeader>
            <CardTitle>Ruta Selectată</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(state.selectedOption, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteSearchPage;
