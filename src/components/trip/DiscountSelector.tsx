/**
 * DISCOUNT SELECTOR COMPONENT
 * 
 * Component for displaying and selecting discounts for a specific segment
 * Supports both outbound and return journey discounts
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Percent, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Discount, DiscountSelection } from '@/types/tripDetail';
import { calculateDiscountPrice, formatDiscountPrice } from '@/lib/tripDetailApi';

export interface DiscountSelectorProps {
  discounts: Discount[];
  selectedDiscount: DiscountSelection | null;
  basePrice: number;
  passengers: number;
  currency: string;
  segmentName: string;
  onSelectDiscount: (discount: Discount) => void;
  onDeselectDiscount: () => void;
  loading?: boolean;
}

export const DiscountSelector: React.FC<DiscountSelectorProps> = ({
  discounts,
  selectedDiscount,
  basePrice,
  passengers,
  currency,
  segmentName,
  onSelectDiscount,
  onDeselectDiscount,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4" />
            Loading Discounts...
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-2 text-muted-foreground text-sm">
            Loading available discounts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!discounts || discounts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4" />
            Discounts - {segmentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-2 text-muted-foreground text-sm">
            No discounts available for this segment
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDiscountSelect = (discount: Discount) => {
    if (selectedDiscount?.discount_id === discount.discount_id) {
      onDeselectDiscount();
    } else {
      onSelectDiscount(discount);
    }
  };

  const totalSavings = selectedDiscount ? 
    (basePrice * passengers) - Math.max(0, (basePrice * passengers) - calculateDiscountPrice(basePrice, selectedDiscount, passengers)) : 0;

  return (
    <Card>
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4" />
            Discounts - {segmentName}
            {selectedDiscount && (
              <Badge variant="default" className="bg-primary text-xs">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {selectedDiscount && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Selected: {selectedDiscount.discount_name}</span>
            <span className="text-green-600 font-medium">
              Save {formatDiscountPrice(totalSavings, currency)}
            </span>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {discounts.map((discount) => {
              const isSelected = selectedDiscount?.discount_id === discount.discount_id;
              const discountAmount = calculateDiscountPrice(basePrice, discount, passengers);
              const finalPrice = Math.max(0, (basePrice * passengers) - discountAmount);
              const savings = (basePrice * passengers) - finalPrice;

              return (
                <div
                  key={discount.discount_id}
                  className={`border rounded-lg p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleDiscountSelect(discount)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{discount.discount_name}</h4>
                        {isSelected && (
                          <Badge variant="default" className="bg-primary text-xs">
                            <Check className="h-2 w-2 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Per passenger:</span>
                          <div className="font-medium">
                            {formatDiscountPrice(discount.discount_price, discount.discount_currency || currency)}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">You save:</span>
                          <div className="font-medium text-green-600">
                            {formatDiscountPrice(savings, currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-3">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscountSelect(discount);
                        }}
                      >
                        {isSelected ? 'Deselect' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
