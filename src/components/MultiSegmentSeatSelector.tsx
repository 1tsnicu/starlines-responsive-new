// src/components/MultiSegmentSeatSelector.tsx - Complete seat selection for multi-segment trips

import React, { useState, useEffect } from "react";
import { getPlan } from "@/lib/bussystem";
import { validateMultiSegmentSelection, extractSeatNumbers } from "@/lib/planUtils";
import { SegmentSeatSelector } from "./SegmentSeatSelector";
import type { SeatPlan } from "@/types/plan";
import type { FreeSeatsTrip } from "@/types/seats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

type Props = {
  segments: FreeSeatsTrip[];
  passengerCount: number;
  onSelectionComplete: (selections: { [bustype_id: string]: string[] }) => void;
  onBack?: () => void;
};

type SegmentState = {
  plan: SeatPlan | null;
  selected: Set<string>;
  loading: boolean;
  error?: string;
};

export function MultiSegmentSeatSelector({ 
  segments, 
  passengerCount, 
  onSelectionComplete,
  onBack 
}: Props) {
  const [segmentStates, setSegmentStates] = useState<{ [bustype_id: string]: SegmentState }>({});

  // Initialize states for all segments
  useEffect(() => {
    const initialStates: { [bustype_id: string]: SegmentState } = {};
    segments.forEach(segment => {
      initialStates[segment.bustype_id] = {
        plan: null,
        selected: new Set(),
        loading: segment.has_plan === 1,
        error: undefined
      };
    });
    setSegmentStates(initialStates);
  }, [segments]);

  // Load seat plans for segments that have them
  useEffect(() => {
    segments.forEach(async (segment) => {
      if (segment.has_plan === 1) {
        try {
          const plan = await getPlan({ 
            bustype_id: segment.bustype_id,
            position: "h",
            v: "2.0"
          });
          
          setSegmentStates(prev => ({
            ...prev,
            [segment.bustype_id]: {
              ...prev[segment.bustype_id],
              plan,
              loading: false,
              error: undefined
            }
          }));
        } catch (error) {
          console.error(`Error loading plan for ${segment.bustype_id}:`, error);
          setSegmentStates(prev => ({
            ...prev,
            [segment.bustype_id]: {
              ...prev[segment.bustype_id],
              plan: null,
              loading: false,
              error: error instanceof Error ? error.message : "Failed to load seat plan"
            }
          }));
        }
      }
    });
  }, [segments]);

  const handleSelectionChange = (bustype_id: string, selected: Set<string>) => {
    setSegmentStates(prev => ({
      ...prev,
      [bustype_id]: {
        ...prev[bustype_id],
        selected
      }
    }));
  };

  const handleContinue = () => {
    const selections: { [bustype_id: string]: string[] } = {};
    segments.forEach(segment => {
      const state = segmentStates[segment.bustype_id];
      if (state) {
        selections[segment.bustype_id] = extractSeatNumbers(state.selected);
      }
    });
    onSelectionComplete(selections);
  };

  // Validation
  const allSelections = segments.map(segment => 
    segmentStates[segment.bustype_id]?.selected || new Set<string>()
  );
  const isValid = validateMultiSegmentSelection(allSelections, passengerCount);
  const hasAnySelection = allSelections.some(selection => selection.size > 0);

  // Count segments with plans vs without
  const segmentsWithPlans = segments.filter(s => s.has_plan === 1);
  const segmentsWithoutPlans = segments.filter(s => s.has_plan === 0);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Selectare locuri</h2>
        <p className="text-muted-foreground">
          Selectați {passengerCount} {passengerCount === 1 ? 'loc' : 'locuri'} pentru fiecare segment al călătoriei
        </p>
      </div>

      {/* Status overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Progres selecție: {allSelections.filter(s => s.size === passengerCount).length} / {segments.length} segmente complete
            </div>
            {isValid && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Toate segmentele sunt complete
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Segments with visual seat plans */}
      {segmentsWithPlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Segmente cu schemă vizuală</h3>
          {segmentsWithPlans.map((segment, index) => {
            const state = segmentStates[segment.bustype_id];
            if (!state) return null;

            return (
              <SegmentSeatSelector
                key={segment.bustype_id}
                segmentName={segment.trip_name || `Segment ${index + 1} (${segment.bustype_id})`}
                plan={state.plan}
                freeSeats={segment.free_seat}
                maxSelect={passengerCount}
                selected={state.selected}
                onSelectionChange={(selected) => handleSelectionChange(segment.bustype_id, selected)}
                loading={state.loading}
                error={state.error}
              />
            );
          })}
        </div>
      )}

      {/* Segments without visual plans - simple list selection */}
      {segmentsWithoutPlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Segmente cu selecție simplă</h3>
          {segmentsWithoutPlans.map((segment, index) => {
            const availableSeats = segment.free_seat.filter(seat => seat.seat_free === 1);
            const state = segmentStates[segment.bustype_id];
            
            return (
              <Card key={segment.bustype_id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {segment.trip_name || `Segment ${segmentsWithPlans.length + index + 1}`}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {availableSeats.length} locuri disponibile
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Pentru acest segment, locurile vor fi alocate automat la finalizarea rezervării.
                    </div>
                    
                    {/* Auto-complete selection for segments without plans */}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        {passengerCount} {passengerCount === 1 ? 'loc va fi alocat' : 'locuri vor fi alocate'} automat
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Validation alerts */}
      {hasAnySelection && !isValid && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vă rugăm să selectați {passengerCount} {passengerCount === 1 ? 'loc' : 'locuri'} pentru fiecare segment care are schemă vizuală.
          </AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← Înapoi
          </Button>
        )}
        
        <div className="flex-1" />
        
        <Button 
          onClick={handleContinue}
          disabled={segmentsWithPlans.length > 0 && !isValid}
          className="min-w-32"
        >
          Continuă
        </Button>
      </div>
    </div>
  );
}
