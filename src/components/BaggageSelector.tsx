// src/components/BaggageSelector.tsx - Component for selecting baggage per passenger

import React from "react";
import type { BaggageItem, PassengerBaggage } from "@/types/baggage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Package, Ruler, Weight, Minus, Plus, Euro, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  baggage: BaggageItem[];
  passengerCount: number;
  selectedBaggage: PassengerBaggage[];
  onSelectionChange: (baggage: PassengerBaggage[]) => void;
  currency?: string;
  disabled?: boolean;
};

export function BaggageSelector({
  baggage,
  passengerCount,
  selectedBaggage,
  onSelectionChange,
  currency = "EUR",
  disabled = false
}: Props) {
  // Separate free and paid baggage
  const freeBaggage = baggage.filter(b => b.price === 0);
  const paidBaggage = baggage.filter(b => b.price > 0);

  const handleQuantityChange = (
    passengerIndex: number, 
    baggageItem: BaggageItem, 
    newQuantity: number
  ) => {
    const newSelections = [...selectedBaggage];
    
    // Remove existing selection for this passenger + baggage type
    const existingIndex = newSelections.findIndex(
      s => s.passengerIndex === passengerIndex && s.baggage_id === baggageItem.baggage_id
    );
    
    if (existingIndex >= 0) {
      newSelections.splice(existingIndex, 1);
    }
    
    // Add new selection if quantity > 0
    if (newQuantity > 0) {
      newSelections.push({
        passengerIndex,
        baggage_id: baggageItem.baggage_id,
        baggage_title: baggageItem.baggage_title,
        quantity: newQuantity,
        price_per_item: baggageItem.price,
        total_price: newQuantity * baggageItem.price,
        currency: baggageItem.currency
      });
    }
    
    onSelectionChange(newSelections);
  };

  const getQuantityForPassenger = (passengerIndex: number, baggageId: string): number => {
    const selection = selectedBaggage.find(
      s => s.passengerIndex === passengerIndex && s.baggage_id === baggageId
    );
    return selection?.quantity || 0;
  };

  const getTotalQuantityForBaggage = (baggageId: string): number => {
    return selectedBaggage
      .filter(s => s.baggage_id === baggageId)
      .reduce((sum, s) => sum + s.quantity, 0);
  };

  const canIncrement = (passengerIndex: number, baggageItem: BaggageItem): boolean => {
    const currentForPassenger = getQuantityForPassenger(passengerIndex, baggageItem.baggage_id);
    const totalInBus = getTotalQuantityForBaggage(baggageItem.baggage_id);
    
    const maxPerPerson = Number(baggageItem.max_per_person || "999");
    const maxInBus = Number(baggageItem.max_in_bus || "999");
    
    return currentForPassenger < maxPerPerson && totalInBus < maxInBus;
  };

  const calculateTotalCost = (): number => {
    return selectedBaggage.reduce((total, item) => total + item.total_price, 0);
  };

  const formatDimensions = (item: BaggageItem): string => {
    const parts = [];
    if (item.length) parts.push(`${item.length}cm`);
    if (item.width) parts.push(`${item.width}cm`);
    if (item.height) parts.push(`${item.height}cm`);
    return parts.length > 0 ? parts.join(' × ') : '';
  };

  if (baggage.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Opțiuni Bagaje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Free baggage info */}
        {freeBaggage.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-green-700">Bagaj inclus gratuit:</Label>
            {freeBaggage.map((item) => (
              <div key={item.baggage_id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-green-800">{item.baggage_title}</div>
                    <div className="text-sm text-green-600 space-y-1">
                      {formatDimensions(item) && (
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          <span>{formatDimensions(item)}</span>
                        </div>
                      )}
                      {item.kg && (
                        <div className="flex items-center gap-1">
                          <Weight className="h-3 w-3" />
                          <span>până la {item.kg}kg</span>
                        </div>
                      )}
                      {item.max_per_person && (
                        <div className="text-xs">
                          Maxim {item.max_per_person} per pasager
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Inclus
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paid baggage selection */}
        {paidBaggage.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Bagaj adițional cu plată:</Label>
            
            {paidBaggage.map((baggageItem) => {
              const totalSelected = getTotalQuantityForBaggage(baggageItem.baggage_id);
              const maxInBus = Number(baggageItem.max_in_bus || "999");
              const isNearLimit = totalSelected >= maxInBus * 0.8;
              
              return (
                <div key={baggageItem.baggage_id} className="border rounded-lg p-4 space-y-4">
                  {/* Baggage info header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="font-medium">{baggageItem.baggage_title}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {formatDimensions(baggageItem) && (
                          <div className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            <span>{formatDimensions(baggageItem)}</span>
                          </div>
                        )}
                        {baggageItem.kg && (
                          <div className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            <span>până la {baggageItem.kg}kg</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs">
                          {baggageItem.max_per_person && (
                            <span>Max/pasager: {baggageItem.max_per_person}</span>
                          )}
                          {baggageItem.max_in_bus && (
                            <span>Max/autobuz: {baggageItem.max_in_bus}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {baggageItem.price} {baggageItem.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">per bucată</div>
                    </div>
                  </div>

                  {/* Availability warning */}
                  {isNearLimit && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Disponibilitate limitată: {maxInBus - totalSelected} locuri rămase în autobuz
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Per-passenger selection */}
                  <div className="space-y-3">
                    <Label className="text-sm">Selectare per pasager:</Label>
                    {Array.from({ length: passengerCount }, (_, index) => {
                      const currentQty = getQuantityForPassenger(index, baggageItem.baggage_id);
                      const canInc = canIncrement(index, baggageItem);
                      const canDec = currentQty > 0;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Pasager {index + 1}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(index, baggageItem, currentQty - 1)}
                                disabled={disabled || !canDec}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              
                              <span className="w-8 text-center text-sm font-medium">
                                {currentQty}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(index, baggageItem, currentQty + 1)}
                                disabled={disabled || !canInc}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {currentQty > 0 && (
                              <div className="text-sm text-green-600 flex items-center gap-1">
                                <Euro className="h-3 w-3" />
                                <span>{currentQty * baggageItem.price} {currency}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cost summary */}
        {selectedBaggage.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="space-y-2">
              <div className="font-medium text-blue-800">Rezumat bagaj adițional:</div>
              {paidBaggage.map(item => {
                const totalQty = getTotalQuantityForBaggage(item.baggage_id);
                if (totalQty === 0) return null;
                
                return (
                  <div key={item.baggage_id} className="flex justify-between text-sm text-blue-700">
                    <span>{totalQty}× {item.baggage_title}</span>
                    <span>{totalQty * item.price} {currency}</span>
                  </div>
                );
              })}
              
              <div className="flex justify-between font-bold text-blue-800 border-t border-blue-300 pt-2">
                <span>Total bagaj adițional:</span>
                <span>{calculateTotalCost()} {currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Important notes */}
        <div className="text-xs text-muted-foreground p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <div><strong>Important:</strong> Bagajul inclus gratuit este permis automat pentru fiecare pasager.</div>
              <div>Bagajul adițional cu plată trebuie declarat și plătit la rezervare.</div>
              <div>Dimensiunile și greutatea vor fi verificate la îmbarcarea în autobuz.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
