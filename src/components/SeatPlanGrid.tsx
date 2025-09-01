// src/components/SeatPlanGrid.tsx - Visual seat map component

import React from "react";
import type { AnnotatedFloor } from "@/lib/planUtils";

type Props = {
  floors: AnnotatedFloor[];
  selected: Set<string>;        // multiselect: "floor-seat"
  onToggle: (id: string) => void;
  maxSelect?: number;
  disabled?: boolean;
};

export function SeatPlanGrid({ 
  floors, 
  selected, 
  onToggle, 
  maxSelect = 2,
  disabled = false 
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {floors.map((floor) => (
        <div key={floor.number} className="flex flex-col gap-2">
          <div className="text-sm font-medium">Etaj {floor.number}</div>

          <div className="inline-block rounded-xl p-4 border bg-gray-50">
            <div className="flex flex-col gap-1">
              {floor.rows.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-1 justify-center">
                  {row.map((seat, cIdx) => {
                    if (seat.isAisle) {
                      return <div key={cIdx} className="w-8 h-8" />;
                    }
                    
                    const id = `${floor.number}-${seat.value}`;
                    const isSelected = selected.has(id);
                    const isFree = seat.free !== false; // true or undefined => clickable; false => occupied
                    const isDisabled = disabled || !isFree || (!isSelected && selected.size >= maxSelect);

                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => isFree && !disabled && onToggle(id)}
                        disabled={isDisabled}
                        title={
                          seat.price 
                            ? `${seat.value} • ${seat.price} ${seat.currency ?? ""}`.trim() 
                            : seat.value
                        }
                        className={[
                          "w-8 h-8 text-xs rounded border flex items-center justify-center transition-all",
                          isFree 
                            ? "bg-white border-gray-300 hover:bg-blue-50" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200",
                          isSelected 
                            ? "ring-2 ring-blue-500 border-blue-500 bg-blue-100" 
                            : "",
                          isDisabled && !isSelected 
                            ? "opacity-50 cursor-not-allowed" 
                            : "",
                        ].join(" ")}
                      >
                        {seat.value}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
              <span>Liber</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 border border-gray-200 rounded"></div>
              <span>Ocupat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded"></div>
              <span>Selectat</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
