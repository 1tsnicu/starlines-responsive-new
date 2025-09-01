// React component for bus plan visualization with seat selection
// Supports both horizontal and vertical orientations, multiple floors

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Info,
  Users,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import type {
  BusPlan,
  BusPlanConfig,
  SeatInfo,
  FloorInfo,
  PlanRow,
  SeatSelectionState,
  SeatStyle
} from '@/types/getPlan';

// ===============================
// Seat Component
// ===============================

interface SeatComponentProps {
  seat: SeatInfo;
  isSelected: boolean;
  isBlocked: boolean;
  style?: SeatStyle;
  onClick?: () => void;
  showNumber?: boolean;
}

const SeatComponent: React.FC<SeatComponentProps> = ({
  seat,
  isSelected,
  isBlocked,
  style,
  onClick,
  showNumber = true
}) => {
  if (seat.isEmpty) {
    return <div className="w-8 h-8 m-0.5" />;
  }

  const baseClasses = "w-8 h-8 m-0.5 rounded border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-110";
  
  let seatClasses = baseClasses;
  const seatStyle: React.CSSProperties = {};

  if (isBlocked) {
    seatClasses += " bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed hover:scale-100";
  } else if (isSelected) {
    seatClasses += " bg-blue-500 border-blue-600 text-white shadow-lg";
  } else if (seat.isSelectable) {
    seatClasses += " bg-green-100 border-green-300 text-green-800 hover:bg-green-200";
  } else {
    seatClasses += " bg-red-100 border-red-300 text-red-800 cursor-not-allowed hover:scale-100";
  }

  // Apply custom styles
  if (style) {
    if (style.backgroundColor) seatStyle.backgroundColor = style.backgroundColor;
    if (style.borderColor) seatStyle.borderColor = style.borderColor;
    if (style.textColor) seatStyle.color = style.textColor;
  }

  return (
    <div
      className={seatClasses}
      style={seatStyle}
      onClick={seat.isSelectable && !isBlocked ? onClick : undefined}
      title={`Seat ${seat.number}${!seat.isSelectable ? ' (Occupied)' : ''}${isBlocked ? ' (Blocked)' : ''}`}
    >
      {showNumber && seat.number}
    </div>
  );
};

// ===============================
// Floor Component
// ===============================

interface FloorComponentProps {
  floor: FloorInfo;
  selectionState: SeatSelectionState;
  config: BusPlanConfig;
  onSeatClick: (seatNumber: string) => void;
  getSeatStyle?: (seat: SeatInfo) => SeatStyle;
  zoom: number;
}

const FloorComponent: React.FC<FloorComponentProps> = ({
  floor,
  selectionState,
  config,
  onSeatClick,
  getSeatStyle,
  zoom
}) => {
  return (
    <div 
      className={`floor-container p-4 border rounded-lg bg-gray-50 ${config.orientation === 'v' ? 'flex flex-col' : ''}`}
      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
    >
      {floor.rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`flex ${config.orientation === 'v' ? 'flex-col' : 'flex-row'} justify-center items-center mb-2`}
        >
          {row.seats.map((seat, seatIndex) => {
            const isSelected = selectionState.selectedSeats.includes(seat.number || '');
            const isBlocked = selectionState.blockedSeats?.includes(seat.number || '') || false;
            const isAllowed = !selectionState.allowedSeats || selectionState.allowedSeats.includes(seat.number || '');
            
            return (
              <SeatComponent
                key={`${rowIndex}-${seatIndex}`}
                seat={seat}
                isSelected={isSelected}
                isBlocked={isBlocked || !isAllowed}
                style={getSeatStyle?.(seat)}
                onClick={() => seat.number && onSeatClick(seat.number)}
                showNumber={config.showSeatNumbers}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ===============================
// Main Bus Plan Component
// ===============================

export interface BusPlanVisualizationProps {
  plan: BusPlan;
  config?: Partial<BusPlanConfig>;
  selectionState?: Partial<SeatSelectionState>;
  onSeatSelect?: (seatNumber: string) => void;
  onSeatDeselect?: (seatNumber: string) => void;
  onSelectionChange?: (selectedSeats: string[]) => void;
  getSeatStyle?: (seat: SeatInfo) => SeatStyle;
  showControls?: boolean;
  showStatistics?: boolean;
}

export const BusPlanVisualization: React.FC<BusPlanVisualizationProps> = ({
  plan,
  config: configOverride = {},
  selectionState: selectionOverride = {},
  onSeatSelect,
  onSeatDeselect,
  onSelectionChange,
  getSeatStyle,
  showControls = true,
  showStatistics = true
}) => {
  // Configuration
  const config: BusPlanConfig = useMemo(() => ({
    orientation: plan.orientation,
    version: plan.version,
    showSeatNumbers: true,
    enableSelection: true,
    selectionMode: 'multiple',
    ...configOverride
  }), [plan, configOverride]);

  // Selection state
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const selectionState: SeatSelectionState = useMemo(() => ({
    selectedSeats: internalSelection,
    maxSeats: undefined,
    allowedSeats: undefined,
    blockedSeats: [],
    ...selectionOverride
  }), [internalSelection, selectionOverride]);

  // UI state
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [orientation, setOrientation] = useState<'h' | 'v'>(config.orientation);

  // Statistics
  const statistics = useMemo(() => {
    let totalSeats = 0;
    let availableSeats = 0;
    let selectedSeats = 0;

    plan.floors.forEach(floor => {
      floor.rows.forEach(row => {
        row.seats.forEach(seat => {
          if (!seat.isEmpty) {
            totalSeats++;
            if (seat.isSelectable) {
              availableSeats++;
            }
            if (selectionState.selectedSeats.includes(seat.number || '')) {
              selectedSeats++;
            }
          }
        });
      });
    });

    return { totalSeats, availableSeats, selectedSeats };
  }, [plan, selectionState.selectedSeats]);

  // Handle seat selection
  const handleSeatClick = useCallback((seatNumber: string) => {
    if (!config.enableSelection) return;

    const isCurrentlySelected = selectionState.selectedSeats.includes(seatNumber);
    let newSelection: string[];

    if (isCurrentlySelected) {
      // Deselect seat
      newSelection = selectionState.selectedSeats.filter(seat => seat !== seatNumber);
      onSeatDeselect?.(seatNumber);
    } else {
      // Select seat
      if (config.selectionMode === 'single') {
        newSelection = [seatNumber];
      } else {
        // Check max seats limit
        if (selectionState.maxSeats && selectionState.selectedSeats.length >= selectionState.maxSeats) {
          return; // Don't allow more selections
        }
        newSelection = [...selectionState.selectedSeats, seatNumber];
      }
      onSeatSelect?.(seatNumber);
    }

    setInternalSelection(newSelection);
    onSelectionChange?.(newSelection);
  }, [
    config.enableSelection,
    config.selectionMode,
    selectionState.selectedSeats,
    selectionState.maxSeats,
    onSeatSelect,
    onSeatDeselect,
    onSelectionChange
  ]);

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    setOrientation(prev => prev === 'h' ? 'v' : 'h');
  }, []);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setInternalSelection([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Update config when orientation changes
  const effectiveConfig = { ...config, orientation };

  return (
    <div className="bus-plan-visualization space-y-4">
      {/* Header with controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Bus Type: {plan.busTypeId}
            </Badge>
            <Badge variant="outline">
              {plan.planType}
            </Badge>
            <Badge variant="outline">
              Version {plan.version}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Floor selector */}
            {plan.floors.length > 1 && (
              <Select value={selectedFloor.toString()} onValueChange={(value) => setSelectedFloor(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plan.floors.map((floor, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Floor {floor.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Zoom controls */}
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomReset}>
              {Math.round(zoom * 100)}%
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Orientation toggle */}
            <Button variant="outline" size="sm" onClick={handleOrientationChange}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Clear selection */}
            {selectionState.selectedSeats.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      {showStatistics && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                {statistics.totalSeats}
              </div>
              <p className="text-sm text-gray-600">Total Seats</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                {statistics.availableSeats}
              </div>
              <p className="text-sm text-gray-600">Available</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-600">
                <MapPin className="h-5 w-5" />
                {statistics.selectedSeats}
              </div>
              <p className="text-sm text-gray-600">Selected</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selection limits info */}
      {config.enableSelection && selectionState.maxSeats && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can select up to {selectionState.maxSeats} seats. 
            {selectionState.selectedSeats.length >= selectionState.maxSeats && ' Selection limit reached.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Plan visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Bus Plan
            {plan.floors.length > 1 && ` - Floor ${plan.floors[selectedFloor]?.number}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            {plan.floors.length > 0 ? (
              <FloorComponent
                floor={plan.floors[selectedFloor] || plan.floors[0]}
                selectionState={selectionState}
                config={effectiveConfig}
                onSeatClick={handleSeatClick}
                getSeatStyle={getSeatStyle}
                zoom={zoom}
              />
            ) : (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  No floor data available for this bus plan.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded"></div>
              <span className="text-sm">Blocked</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusPlanVisualization;
