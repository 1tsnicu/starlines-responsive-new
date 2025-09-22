/**
 * BAGGAGE SELECTOR COMPONENT
 * 
 * Component for displaying and selecting baggage for a specific segment
 * Supports both outbound and return journey baggage
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Luggage, 
  Plus, 
  Minus, 
  Package, 
  Weight, 
  Ruler,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { BaggageItem, BaggageSelection } from '@/types/tripDetail';
import { 
  calculateBaggagePrice, 
  formatBaggagePrice, 
  getBaggageDimensions, 
  getBaggageWeight 
} from '@/lib/tripDetailApi';
import { useLocalization } from '@/contexts/LocalizationContext';

export interface BaggageSelectorProps {
  baggageItems: BaggageItem[];
  selectedBaggage: Record<string, BaggageSelection>;
  passengers: number;
  currency: string;
  segmentName: string;
  onAddBaggage: (baggage: BaggageItem, quantity: number) => void;
  onRemoveBaggage: (baggageId: string) => void;
  onUpdateQuantity: (baggageId: string, quantity: number) => void;
  loading?: boolean;
}

export const BaggageSelector: React.FC<BaggageSelectorProps> = ({
  baggageItems,
  selectedBaggage,
  passengers,
  currency,
  segmentName,
  onAddBaggage,
  onRemoveBaggage,
  onUpdateQuantity,
  loading = false
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { t } = useLocalization();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Luggage className="h-5 w-5" />
            {t('baggage.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {t('baggage.loading')}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!baggageItems || baggageItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Luggage className="h-5 w-5" />
            {t('baggage.title')} - {segmentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {t('baggage.noneAvailable')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleQuantityChange = (baggageId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [baggageId]: quantity }));
  };

  const handleAddBaggage = (baggage: BaggageItem) => {
    const quantity = quantities[baggage.baggage_id] || 1;
    if (quantity > 0) {
      onAddBaggage(baggage, quantity);
      setQuantities(prev => ({ ...prev, [baggage.baggage_id]: 0 }));
    }
  };

  const getBaggageTypeColor = (baggageType: string) => {
    switch (baggageType) {
      case 'small_baggage':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium_baggage':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'large_baggage':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBaggageTypeIcon = (baggageType: string) => {
    switch (baggageType) {
      case 'small_baggage':
        return '👜';
      case 'medium_baggage':
        return '🎒';
      case 'large_baggage':
        return '🧳';
      default:
        return '📦';
    }
  };

  const totalSelectedPrice = Object.values(selectedBaggage).reduce((total, baggage) => {
    return total + (baggage.price * baggage.quantity);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Luggage className="h-5 w-5" />
          {t('baggage.title')} - {segmentName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('baggage.selectForPassengers')} {passengers}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Available Baggage Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">{t('baggage.availableOptions')}</h4>
            {baggageItems.map((baggage) => {
              const isSelected = selectedBaggage[baggage.baggage_id];
              const quantity = quantities[baggage.baggage_id] || 0;
              const maxPerPerson = parseInt(baggage.max_per_person);
              const maxTotal = parseInt(baggage.max_in_bus);

              return (
                <div
                  key={baggage.baggage_id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getBaggageTypeIcon(baggage.baggage_type)}</span>
                        <div>
                          <h4 className="font-medium">{baggage.baggage_title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getBaggageTypeColor(baggage.baggage_type)}`}
                          >
                            {baggage.baggage_type_abbreviated}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          <span className="text-muted-foreground">{t('baggage.size')}:</span>
                          <span className="font-medium">{getBaggageDimensions(baggage)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Weight className="h-3 w-3" />
                          <span className="text-muted-foreground">{t('baggage.weight')}:</span>
                          <span className="font-medium">{getBaggageWeight(baggage)}</span>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">{t('baggage.pricePerItem')}:</span>
                          <div className="font-medium">
                            {baggage.price === 0 ? t('common.free') : formatBaggagePrice(baggage.price, baggage.currency)}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">{t('baggage.maxPerPerson')}:</span>
                          <div className="font-medium">{maxPerPerson}</div>
                        </div>
                      </div>

                      {/* Quantity Selection */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`quantity-${baggage.baggage_id}`} className="text-sm">
                          {t('baggage.quantity')}:
                        </Label>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(baggage.baggage_id, Math.max(0, quantity - 1))}
                            disabled={quantity <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            id={`quantity-${baggage.baggage_id}`}
                            type="number"
                            min="0"
                            max={maxPerPerson}
                            value={quantity}
                            onChange={(e) => handleQuantityChange(baggage.baggage_id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(baggage.baggage_id, Math.min(maxPerPerson, quantity + 1))}
                            disabled={quantity >= maxPerPerson}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant={quantity > 0 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAddBaggage(baggage)}
                          disabled={quantity <= 0}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          {t('baggage.add')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Baggage Summary */}
          {Object.keys(selectedBaggage).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {t('baggage.selected')}
                </h4>
                {Object.values(selectedBaggage).map((baggage) => (
                  <div key={baggage.baggage_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getBaggageTypeIcon(baggage.baggage_type)}</span>
                      <div>
                        <div className="font-medium">{baggage.baggage_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {baggage.quantity} × {formatBaggagePrice(baggage.price, baggage.currency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatBaggagePrice(baggage.price * baggage.quantity, baggage.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {baggage.quantity} {t('baggage.items')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveBaggage(baggage.baggage_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">{t('baggage.total')}:</span>
                  <span className="font-bold text-lg">
                    {formatBaggagePrice(totalSelectedPrice, currency)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
