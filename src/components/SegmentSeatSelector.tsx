// src/components/SegmentSeatSelector.tsx - Seat selection for individual segments

import React, { useMemo, useState, useEffect } from "react";
import { buildAnnotatedPlan, extractSeatNumbers } from "@/lib/planUtils";
import type { SeatPlan } from "@/types/plan";
import type { FreeSeatItem } from "@/types/seats";
import { SeatPlanGrid } from "./SeatPlanGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Props = {
  segmentName: string;
  plan: SeatPlan | null;
  freeSeats: FreeSeatItem[];
  maxSelect?: number;
  selected: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  loading?: boolean;
  error?: string;
};

export function SegmentSeatSelector({
  segmentName,
  plan,
  freeSeats,
  maxSelect = 2,
  selected,
  onSelectionChange,
  loading = false,
  error
}: Props) {
  const floors = useMemo(() => {
    if (!plan) return [];
    return buildAnnotatedPlan(plan, freeSeats);
  }, [plan, freeSeats]);

  const onToggle = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else if (newSelected.size < maxSelect) {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  // Extract selected seat numbers for display
  const selectedSeatNumbers = extractSeatNumbers(selected);

  // Count available seats
  const availableSeats = floors.reduce((count, floor) => 
    count + floor.rows.reduce((rowCount, row) => 
      rowCount + row.filter(seat => !seat.isAisle && seat.free === true).length, 0
    ), 0
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {segmentName}
            <Loader2 className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Se încarcă schema locurilor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">{segmentName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">
            Eroare la încărcarea schemei: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan || floors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{segmentName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Schema locurilor nu este disponibilă pentru acest segment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{segmentName}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {availableSeats} locuri libere
            </Badge>
            {selected.size > 0 && (
              <Badge variant="default">
                {selected.size}/{maxSelect} selectate
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SeatPlanGrid 
          floors={floors} 
          selected={selected} 
          onToggle={onToggle} 
          maxSelect={maxSelect} 
        />
        
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Locuri selectate ({selected.size}/{maxSelect}):
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedSeatNumbers.length > 0 
              ? selectedSeatNumbers.join(", ") 
              : "Niciun loc selectat"
            }
          </div>
        </div>

        {selected.size === maxSelect && (
          <div className="text-sm text-green-600 font-medium">
            ✓ Toate locurile au fost selectate pentru acest segment
          </div>
        )}
      </CardContent>
    </Card>
  );
}
