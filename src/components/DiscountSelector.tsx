// src/components/DiscountSelector.tsx - Component for selecting discounts per passenger

import React from "react";
import type { DiscountItem, PassengerDiscount } from "@/types/discounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Percent, Euro } from "lucide-react";

type Props = {
  discounts: DiscountItem[];
  passengerCount: number;
  selectedDiscounts: PassengerDiscount[];
  onSelectionChange: (discounts: PassengerDiscount[]) => void;
  currency?: string;
  disabled?: boolean;
};

export function DiscountSelector({
  discounts,
  passengerCount,
  selectedDiscounts,
  onSelectionChange,
  currency = "EUR",
  disabled = false
}: Props) {
  const handleDiscountSelect = (passengerIndex: number, discountId: string | null) => {
    const newSelections = [...selectedDiscounts];
    
    // Remove existing discount for this passenger
    const existingIndex = newSelections.findIndex(d => d.passengerIndex === passengerIndex);
    if (existingIndex >= 0) {
      newSelections.splice(existingIndex, 1);
    }
    
    // Add new discount if selected
    if (discountId && discountId !== "none") {
      const discount = discounts.find(d => d.discount_id === discountId);
      if (discount) {
        newSelections.push({
          passengerIndex,
          discount_id: discount.discount_id,
          discount_name: discount.discount_name,
          discount_price: discount.discount_price,
          discount_currency: discount.discount_currency || currency
        });
      }
    }
    
    onSelectionChange(newSelections);
  };

  const getSelectedDiscountForPassenger = (passengerIndex: number): string => {
    const selection = selectedDiscounts.find(d => d.passengerIndex === passengerIndex);
    return selection?.discount_id || "none";
  };

  const calculateTotalSavings = (): number => {
    return selectedDiscounts.reduce((total, discount) => {
      // Assuming original price would be higher, calculate savings
      // This would need actual original price from route data
      return total + (75 - discount.discount_price); // Mock calculation
    }, 0);
  };

  if (discounts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Reduceri disponibile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available discounts overview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Reduceri disponibile:</Label>
          <div className="flex flex-wrap gap-2">
            {discounts.map((discount) => (
              <Badge key={discount.discount_id} variant="outline" className="text-xs">
                {discount.discount_name} - {discount.discount_price} {discount.discount_currency || currency}
              </Badge>
            ))}
          </div>
        </div>

        {/* Per-passenger discount selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Selectați reduceri pentru fiecare pasager:</Label>
          
          {Array.from({ length: passengerCount }, (_, index) => {
            const selectedDiscount = getSelectedDiscountForPassenger(index);
            const discountInfo = selectedDiscounts.find(d => d.passengerIndex === index);
            
            return (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pasager {index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <Select
                    value={selectedDiscount}
                    onValueChange={(value) => handleDiscountSelect(index, value)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selectați reducerea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Fără reducere</SelectItem>
                      {discounts.map((discount) => (
                        <SelectItem key={discount.discount_id} value={discount.discount_id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{discount.discount_name}</span>
                            <span className="text-muted-foreground ml-2">
                              {discount.discount_price} {discount.discount_currency || currency}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {discountInfo && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Euro className="h-3 w-3" />
                    <span>-{(75 - discountInfo.discount_price).toFixed(0)} {currency}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {selectedDiscounts.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Reduceri aplicate: {selectedDiscounts.length} din {passengerCount} pasageri
              </span>
              <span className="text-sm font-bold text-green-600">
                Economie totală: ~{calculateTotalSavings()} {currency}
              </span>
            </div>
          </div>
        )}

        {/* Age verification note */}
        <div className="text-xs text-muted-foreground p-2 bg-blue-50 border border-blue-200 rounded">
          <strong>Notă:</strong> Unele reduceri pot necesita verificarea vârstei sau a documentelor suport 
          (ex. carnet de student, pensionar) la îmbarcarea în autobuz.
        </div>
      </CardContent>
    </Card>
  );
}
