/**
 * DISCOUNT SELECTION COMPONENT
 * 
 * Componentă React pentru selecția interactivă de discounturi
 * Cu validare în timp real și integrare new_order payload
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Percent, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Users,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';

import { fetchDiscountInfo } from '@/lib/discountApi';
import {
  buildNewOrderDiscountPayload,
  addDiscountSelection,
  removeDiscountSelection,
  calculateDiscountSelectionCost,
  validateAllSelections
} from '@/lib/newOrderDiscountBuilder';

import type {
  DiscountItem,
  DiscountSelection,
  NewOrderDiscountPayload,
  NormalizedDiscountResponse,
  PassengerDiscountValidation
} from '@/types/getDiscount';

// ===============================
// Component Props
// ===============================

interface DiscountSelectionProps {
  // Required props
  intervalId: string;
  currency: 'EUR' | 'RON' | 'PLN' | 'MDL' | 'RUB' | 'UAH' | 'CZK';
  language: 'en' | 'ru' | 'ua' | 'de' | 'pl' | 'cz' | 'ro';
  
  // Passenger and trip info
  passengers: Array<{
    index: number;
    name?: string;
    surname?: string;
    birth_date?: string;
    age?: number;
    has_document?: boolean;
  }>;
  
  trips: Array<{
    index: number;
    interval_id: string;
    name?: string;
  }>;
  
  // Callbacks
  onSelectionChange?: (selections: DiscountSelection[]) => void;
  onPayloadReady?: (payload: NewOrderDiscountPayload) => void;
  onLoadingChange?: (loading: boolean) => void;
  
  // UI Configuration
  showCostSummary?: boolean;
  showValidationErrors?: boolean;
  groupByCategory?: boolean;
  compactMode?: boolean;
  readonly?: boolean;
  
  // Validation limits
  maxSelectionsPerPassenger?: number;
  requireValidation?: boolean;
}

// ===============================
// Main Component
// ===============================

export function DiscountSelection({
  intervalId,
  currency,
  language,
  passengers,
  trips,
  onSelectionChange,
  onPayloadReady,
  onLoadingChange,
  showCostSummary = true,
  showValidationErrors = true,
  groupByCategory = true,
  compactMode = false,
  readonly = false,
  maxSelectionsPerPassenger = 1,
  requireValidation = true
}: DiscountSelectionProps) {
  // ===============================
  // State Management
  // ===============================
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountData, setDiscountData] = useState<NormalizedDiscountResponse | null>(null);
  const [selections, setSelections] = useState<DiscountSelection[]>([]);
  const [validationResults, setValidationResults] = useState<PassengerDiscountValidation[]>([]);
  
  // ===============================
  // Effects
  // ===============================
  
  const loadDiscountData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchDiscountInfo({
        interval_id: intervalId,
        currency,
        lang: language
      });
      
      setDiscountData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load discounts';
      setError(errorMessage);
      console.error('Error loading discount data:', err);
    } finally {
      setLoading(false);
    }
  }, [intervalId, currency, language]);
  
  useEffect(() => {
    loadDiscountData();
  }, [loadDiscountData]);
  
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);
  
  // Update payload when selections change
  useEffect(() => {
    if (discountData && selections.length > 0) {
      try {
        const payload = buildNewOrderDiscountPayload({
          selections,
          discounts: discountData.discounts,
          passengers,
          trips,
          currency,
          business_rules: discountData.business_rules
        });
        
        onPayloadReady?.(payload);
      } catch (err) {
        console.error('Error building discount payload:', err);
      }
    }
    
    onSelectionChange?.(selections);
  }, [selections, discountData, passengers, trips, currency, onSelectionChange, onPayloadReady]);
  
  // Validate selections when they change
  useEffect(() => {
    if (discountData && requireValidation) {
      const results = validateAllSelections(
        selections,
        discountData.discounts,
        passengers,
        discountData.business_rules
      );
      setValidationResults(results);
    }
  }, [selections, discountData, passengers, requireValidation]);
  
  // ===============================
  // Event Handlers
  // ===============================
  
  const handleDiscountToggle = (
    discountId: string, 
    passengerIndex: number, 
    tripIndex: number,
    checked: boolean
  ) => {
    if (readonly) return;
    
    const selection: DiscountSelection = {
      discount_id: discountId,
      passenger_index: passengerIndex,
      trip_index: tripIndex
    };
    
    setSelections(prev => {
      if (checked) {
        return addDiscountSelection(
          prev, 
          selection, 
          discountData?.business_rules
        );
      } else {
        return removeDiscountSelection(prev, selection);
      }
    });
  };
  
  const isDiscountSelected = (
    discountId: string, 
    passengerIndex: number, 
    tripIndex: number
  ): boolean => {
    return selections.some(s => 
      s.discount_id === discountId &&
      s.passenger_index === passengerIndex &&
      s.trip_index === tripIndex
    );
  };
  
  const canSelectDiscount = (
    discountId: string,
    passengerIndex: number,
    tripIndex: number
  ): boolean => {
    if (readonly) return false;
    
    // Check max selections per passenger
    const passengerSelections = selections.filter(
      s => s.passenger_index === passengerIndex && s.trip_index === tripIndex
    );
    
    const isCurrentlySelected = isDiscountSelected(discountId, passengerIndex, tripIndex);
    
    return isCurrentlySelected || passengerSelections.length < maxSelectionsPerPassenger;
  };
  
  // ===============================
  // Render Helpers
  // ===============================
  
  const renderDiscountItem = (
    discount: DiscountItem, 
    passengerIndex: number, 
    tripIndex: number
  ) => {
    const isSelected = isDiscountSelected(discount.discount_id, passengerIndex, tripIndex);
    const canSelect = canSelectDiscount(discount.discount_id, passengerIndex, tripIndex);
    
    // Get validation for this passenger
    const passengerValidation = validationResults.find(
      v => v.passenger_index === passengerIndex
    );
    
    const passenger = passengers[passengerIndex];
    const hasValidationErrors = passengerValidation?.validation_result?.errors?.length > 0;
    
    return (
      <div
        key={`${discount.discount_id}-${passengerIndex}-${tripIndex}`}
        className={`p-3 border rounded-lg transition-colors ${
          isSelected ? 'border-primary bg-primary/5' : 'border-border'
        } ${!canSelect && !isSelected ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id={`discount-${discount.discount_id}-${passengerIndex}-${tripIndex}`}
            checked={isSelected}
            onCheckedChange={(checked) => 
              handleDiscountToggle(discount.discount_id, passengerIndex, tripIndex, checked as boolean)
            }
            disabled={!canSelect && !isSelected}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <label
                htmlFor={`discount-${discount.discount_id}-${passengerIndex}-${tripIndex}`}
                className="font-medium text-sm cursor-pointer"
              >
                {discount.name}
              </label>
              
              {discount.category && (
                <Badge variant="outline" className="text-xs">
                  {getCategoryDisplayName(discount.category)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                <span className="font-medium">
                  -{discount.price} {discount.currency || currency}
                </span>
              </div>
              
              {discount.rules && (
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span className="text-xs truncate">{discount.rules}</span>
                </div>
              )}
            </div>
            
            {/* Validation indicators */}
            {discount.requires_birth_date && (
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                <Calendar className="h-3 w-3" />
                <span>Necesită data nașterii</span>
              </div>
            )}
            
            {discount.requires_document && (
              <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                <FileText className="h-3 w-3" />
                <span>Necesită document</span>
              </div>
            )}
            
            {/* Validation errors for this selection */}
            {showValidationErrors && hasValidationErrors && isSelected && (
              <div className="mt-2">
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    {passengerValidation.validation_result.errors[0]}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderPassengerSection = (passenger: typeof passengers[0], passengerIndex: number) => {
    const passengerSelections = selections.filter(s => s.passenger_index === passengerIndex);
    
    return (
      <div key={passengerIndex} className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {passenger.name && passenger.surname 
              ? `${passenger.name} ${passenger.surname}`
              : `Pasager ${passengerIndex + 1}`
            }
          </span>
          
          {passenger.age && (
            <Badge variant="outline" className="text-xs">
              {passenger.age} ani
            </Badge>
          )}
          
          {passengerSelections.length > 0 && (
            <Badge className="text-xs">
              {passengerSelections.length} {passengerSelections.length === 1 ? 'discount' : 'discounturi'}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 pl-6">
          {trips.map((trip, tripIndex) => (
            <div key={tripIndex} className="space-y-2">
              {trips.length > 1 && (
                <div className="text-sm font-medium text-muted-foreground">
                  {trip.name || `Segment ${tripIndex + 1}`}
                </div>
              )}
              
              <div className="space-y-2">
                {discountData?.discounts.map(discount => 
                  renderDiscountItem(discount, passengerIndex, tripIndex)
                )}
              </div>
            </div>
          ))}
        </div>
        
        {passengerIndex < passengers.length - 1 && <Separator />}
      </div>
    );
  };
  
  const renderCostSummary = () => {
    if (!showCostSummary || selections.length === 0 || !discountData) {
      return null;
    }
    
    const cost = calculateDiscountSelectionCost(selections, discountData.discounts);
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4" />
            Reduceri selectate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total reduceri:</span>
            <span className="font-bold text-lg text-green-600">
              -{cost.total_discount} {cost.currency}
            </span>
          </div>
          
          {cost.breakdown.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Detalii:</div>
              {cost.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="truncate">
                    {item.discount.name} (P{item.selection.passenger_index + 1})
                  </span>
                  <span>-{item.amount} {item.discount.currency || currency}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // ===============================
  // Main Render
  // ===============================
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Se încarcă discounturile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Eroare la încărcarea discounturilor: {error}
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            onClick={loadDiscountData}
            className="mt-3"
          >
            Încearcă din nou
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!discountData || discountData.discounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Percent className="h-8 w-8" />
            <p>Nu sunt discounturi disponibile pentru această rută.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main discount selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Discounturi disponibile
          </CardTitle>
          <CardDescription>
            Selectează discounturile aplicabile pentru fiecare pasager
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {passengers.map((passenger, index) => 
            renderPassengerSection(passenger, index)
          )}
        </CardContent>
      </Card>
      
      {/* Cost summary */}
      {renderCostSummary()}
      
      {/* Statistics */}
      {discountData.stats.total_available > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statistici</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{discountData.stats.total_available}</div>
                <div className="text-xs text-muted-foreground">Disponibile</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{selections.length}</div>
                <div className="text-xs text-muted-foreground">Selectate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(selections.map(s => s.passenger_index)).size}
                </div>
                <div className="text-xs text-muted-foreground">Pasageri</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  -{discountData.stats.total_savings.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Max economii</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===============================
// Helper Functions
// ===============================

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    child: 'Copii',
    adult: 'Adulți', 
    senior: 'Seniori',
    student: 'Studenți',
    group: 'Grup',
    special: 'Special'
  };
  
  return names[category] || category;
}
