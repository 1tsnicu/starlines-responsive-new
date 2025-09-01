/**
 * BAGGAGE SELECTION COMPONENT
 * 
 * Componentă React pentru selecția bagajelor cu validare în timp real
 * Integrează toate funcționalitățile get_baggage și new_order payload
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MinusIcon, 
  PlusIcon, 
  ShoppingCartIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon
} from 'lucide-react';

import { fetchBaggageInfo } from '@/lib/baggageApi';
import { 
  buildNewOrderBaggagePayload,
  calculateBaggageSelectionCost,
  validateBaggageSelectionComplete,
  generateBaggageSelectionSummary
} from '@/lib/newOrderBaggageBuilder';
import { generateBaggageDisplayInfo } from '@/lib/normalizeGetBaggage';

import type {
  GetBaggageRequest,
  BaggageItem,
  BaggageGroup,
  BaggageSelection,
  NormalizedBaggageResponse,
  NewOrderBaggagePayload
} from '@/types/getBaggage';

// ===============================
// Component Props
// ===============================

interface BaggageSelectionProps {
  // Required props
  intervalId: string;
  
  // Optional configuration
  stationFromId?: string;
  stationToId?: string;
  currency?: "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK";
  language?: "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro";
  
  // Selection management
  initialSelection?: BaggageSelection[];
  onSelectionChange?: (selection: BaggageSelection[]) => void;
  onPayloadReady?: (payload: NewOrderBaggagePayload) => void;
  
  // Validation
  maxTotalItems?: number;
  maxTotalCost?: number;
  passengerCount?: number;
  
  // UI customization
  showCostSummary?: boolean;
  showValidationErrors?: boolean;
  groupByCategory?: boolean;
  compactMode?: boolean;
  readonly?: boolean;
  
  // Event handlers
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

// ===============================
// Main Component
// ===============================

export function BaggageSelection({
  intervalId,
  stationFromId,
  stationToId,
  currency = 'EUR',
  language = 'ro',
  initialSelection = [],
  onSelectionChange,
  onPayloadReady,
  maxTotalItems,
  maxTotalCost,
  passengerCount = 1,
  showCostSummary = true,
  showValidationErrors = true,
  groupByCategory = true,
  compactMode = false,
  readonly = false,
  onError,
  onLoadingChange
}: BaggageSelectionProps) {
  
  // ===============================
  // State Management
  // ===============================
  
  const [baggageData, setBaggageData] = useState<NormalizedBaggageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<BaggageSelection[]>(initialSelection);
  
  // ===============================
  // Computed Values
  // ===============================
  
  const costCalculation = useMemo(() => {
    if (!baggageData) return null;
    
    return calculateBaggageSelectionCost(
      selection,
      baggageData.baggage_items,
      { exclude_free: false }
    );
  }, [selection, baggageData]);
  
  const validation = useMemo(() => {
    if (!baggageData) return null;
    
    return validateBaggageSelectionComplete(
      selection,
      baggageData.baggage_items,
      {
        max_total_items: maxTotalItems,
        max_total_cost: maxTotalCost
      }
    );
  }, [selection, baggageData, maxTotalItems, maxTotalCost]);
  
  const summary = useMemo(() => {
    if (!baggageData || selection.length === 0) return null;
    
    return generateBaggageSelectionSummary(
      selection,
      baggageData.baggage_items,
      language
    );
  }, [selection, baggageData, language]);

  // ===============================
  // Effects
  // ===============================
  
  useEffect(() => {
    loadBaggageData();
  }, [intervalId, stationFromId, stationToId, currency, language]);
  
  useEffect(() => {
    onSelectionChange?.(selection);
    
    // Build payload if we have valid selection
    if (baggageData && selection.length > 0) {
      const payloadResult = buildNewOrderBaggagePayload(
        selection,
        baggageData.baggage_items,
        {
          exclude_free_baggage: true,
          validate_limits: true,
          currency,
          include_metadata: true
        }
      );
      
      if (payloadResult.success && payloadResult.payload) {
        onPayloadReady?.(payloadResult.payload);
      }
    }
  }, [selection, baggageData]);
  
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading]);

  // ===============================
  // Data Loading
  // ===============================
  
  const loadBaggageData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: GetBaggageRequest = {
        interval_id: intervalId,
        station_from_id: stationFromId,
        station_to_id: stationToId,
        currency: currency as "EUR" | "RON" | "PLN" | "MDL" | "RUB" | "UAH" | "CZK",
        lang: language as "en" | "ru" | "ua" | "de" | "pl" | "cz" | "ro"
      };
      
      const data = await fetchBaggageInfo(request);
      setBaggageData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare la încărcarea bagajelor';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Selection Handlers
  // ===============================
  
  const handleQuantityChange = (baggageId: string, newQuantity: number) => {
    if (readonly) return;
    
    setSelection(current => {
      // Remove if quantity is 0
      if (newQuantity <= 0) {
        return current.filter(item => item.baggage_id !== baggageId);
      }
      
      // Update existing or add new
      const existingIndex = current.findIndex(item => item.baggage_id === baggageId);
      
      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = { baggage_id: baggageId, quantity: newQuantity };
        return updated;
      } else {
        return [...current, { baggage_id: baggageId, quantity: newQuantity }];
      }
    });
  };
  
  const getSelectedQuantity = (baggageId: string): number => {
    return selection.find(item => item.baggage_id === baggageId)?.quantity || 0;
  };
  
  const canIncrease = (item: BaggageItem): boolean => {
    const currentQuantity = getSelectedQuantity(item.baggage_id);
    
    if (item.max_per_person && currentQuantity >= item.max_per_person) {
      return false;
    }
    
    return true;
  };

  // ===============================
  // Render Functions
  // ===============================
  
  const renderBaggageItem = (item: BaggageItem) => {
    const displayInfo = generateBaggageDisplayInfo(item);
    const selectedQuantity = getSelectedQuantity(item.baggage_id);
    const canIncr = canIncrease(item);
    
    return (
      <Card key={item.baggage_id} className={`${compactMode ? 'p-3' : 'p-4'} ${selectedQuantity > 0 ? 'ring-2 ring-blue-200' : ''}`}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between gap-4">
            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{displayInfo.category_icon}</span>
                <h4 className="font-medium text-sm line-clamp-1">{displayInfo.title}</h4>
                {item.is_included && (
                  <Badge variant="secondary" className="text-xs">Gratuit</Badge>
                )}
              </div>
              
              {!compactMode && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {displayInfo.dimensions && (
                    <div>📏 {displayInfo.dimensions}</div>
                  )}
                  {displayInfo.weight && (
                    <div>⚖️ {displayInfo.weight}</div>
                  )}
                  {displayInfo.restrictions && (
                    <div>⚠️ {displayInfo.restrictions}</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Price & Selection */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm font-medium">
                {displayInfo.price_display}
              </div>
              
              {!readonly && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleQuantityChange(item.baggage_id, selectedQuantity - 1)}
                    disabled={selectedQuantity <= 0}
                  >
                    <MinusIcon className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center text-sm font-medium">
                    {selectedQuantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleQuantityChange(item.baggage_id, selectedQuantity + 1)}
                    disabled={!canIncr}
                  >
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {readonly && selectedQuantity > 0 && (
                <Badge variant="outline">{selectedQuantity}×</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderBaggageGroup = (group: BaggageGroup) => {
    return (
      <div key={group.group_id} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base">{group.group_name}</h3>
          <Badge variant={group.group_type === 'free' ? 'secondary' : 'default'}>
            {group.items.length} {group.items.length === 1 ? 'opțiune' : 'opțiuni'}
          </Badge>
        </div>
        
        <div className="grid gap-3">
          {group.items.map(renderBaggageItem)}
        </div>
      </div>
    );
  };

  // ===============================
  // Main Render
  // ===============================
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bagaje disponibile</CardTitle>
          <CardDescription>Se încarcă opțiunile de bagaje...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={loadBaggageData}
          >
            Încearcă din nou
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!baggageData || baggageData.baggage_items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bagaje</CardTitle>
          <CardDescription>Nu sunt disponibile opțiuni de bagaje pentru această rută.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Bagaje disponibile
          </CardTitle>
          <CardDescription>
            Selectează bagajele necesare pentru călătoria ta
            {passengerCount > 1 && ` (${passengerCount} călători)`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Validation Errors */}
      {showValidationErrors && validation && !validation.valid && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {showValidationErrors && validation && validation.warnings.length > 0 && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index}>• {warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Baggage Selection */}
      {groupByCategory ? (
        <div className="space-y-6">
          {baggageData.baggage_groups.map(renderBaggageGroup)}
        </div>
      ) : (
        <div className="grid gap-3">
          {baggageData.baggage_items.map(renderBaggageItem)}
        </div>
      )}

      {/* Cost Summary */}
      {showCostSummary && costCalculation && costCalculation.total_cost > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Total bagaje</div>
                {summary && (
                  <div className="text-sm text-muted-foreground">
                    {summary.short_summary}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {costCalculation.total_cost.toFixed(2)} {costCalculation.currency}
                </div>
                {costCalculation.free_items > 0 && (
                  <div className="text-xs text-muted-foreground">
                    + {costCalculation.free_items} gratuite
                  </div>
                )}
              </div>
            </div>
            
            {validation?.valid && (
              <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                Selecția este validă
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {!compactMode && baggageData.stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{baggageData.stats.total_free_items}</div>
                <div className="text-xs text-muted-foreground">Gratuite</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{baggageData.stats.total_paid_items}</div>
                <div className="text-xs text-muted-foreground">Cu plată</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {baggageData.stats.price_range.min.toFixed(0)}-{baggageData.stats.price_range.max.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Preț ({baggageData.stats.price_range.currency})
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {baggageData.stats.weight_limits.max.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Max kg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===============================
// Export Additional Components
// ===============================

export default BaggageSelection;
