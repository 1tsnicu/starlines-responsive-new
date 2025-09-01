// src/components/SeatSelectionDemo.tsx - Demo component for testing seat selection

import React, { useState, useEffect } from "react";
import { getFreeSeats } from "@/lib/bussystem";
import { MultiSegmentSeatSelector } from "./MultiSegmentSeatSelector";
import type { FreeSeatsTrip } from "@/types/seats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SeatSelectionDemo() {
  const [segments, setSegments] = useState<FreeSeatsTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [finalSelections, setFinalSelections] = useState<{ [bustype_id: string]: string[] } | null>(null);

  const loadMockSegments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load mock seat data that includes multi-segment trips
      const freeSeatsResponse = await getFreeSeats({
        interval_id: "12345", // Mock route
        date: "2025-08-27"
      });
      
      setSegments(freeSeatsResponse.trips);
      setShowSelector(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionComplete = (selections: { [bustype_id: string]: string[] }) => {
    setFinalSelections(selections);
    setShowSelector(false);
  };

  const handleReset = () => {
    setSegments([]);
    setShowSelector(false);
    setFinalSelections(null);
    setError(null);
  };

  if (showSelector && segments.length > 0) {
    return (
      <MultiSegmentSeatSelector
        segments={segments}
        passengerCount={2}
        onSelectionComplete={handleSelectionComplete}
        onBack={() => setShowSelector(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demo Selectare Locuri - Bussystem API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Acest demo demonstrează funcționalitatea de selectare a locurilor pentru călătorii cu multiple segmente.
            Folosește API-ul Bussystem pentru a obține informații despre locurile libere și schemele de locuri.
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              Eroare: {error}
            </div>
          )}

          {finalSelections && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">Selecție finalizată:</h3>
              <div className="space-y-1 text-sm text-green-700">
                {Object.entries(finalSelections).map(([bustype_id, seatNumbers]) => (
                  <div key={bustype_id}>
                    <strong>Segment {bustype_id}:</strong> Locuri {seatNumbers.join(", ")}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={loadMockSegments} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Încarcă Demo Segmente
            </Button>
            
            {(finalSelections || error) && (
              <Button variant="outline" onClick={handleReset}>
                Reset Demo
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>Funcționalități implementate:</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Încărcare automată scheme locuri când <code>has_plan = 1</code></li>
              <li>Vizualizare grafică planuri locuri (matrice cu etaje și rânduri)</li>
              <li>Selecție interactivă cu validare număr pasageri</li>
              <li>Suport segmente multiple cu scheme diferite</li>
              <li>Afișare prețuri și disponibilitate per loc</li>
              <li>Alocare automată pentru segmente fără scheme vizuale</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
