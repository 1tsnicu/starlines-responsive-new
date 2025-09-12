/**
 * SEAT MAP COMPONENT
 * 
 * Visualizes bus seat layout with interactive seat selection
 * Supports both plan-based and free-seats-only modes
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { SeatMapProps, SeatInfo, SeatStatus, SeatStyle } from '@/types/tripDetail';
import { normalizeSeatNumber, isSeatAvailable, getSeatPrice } from '@/lib/tripDetailApi';

// ===============================
// Seat Status Styles
// ===============================

const getSeatStyle = (status: SeatStatus, isSelected: boolean): SeatStyle => {
  const baseStyle: SeatStyle = {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    textColor: '#374151',
    cursor: 'pointer',
    opacity: 1,
  };

  switch (status) {
    case 'available':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#3b82f6' : '#ffffff',
        borderColor: isSelected ? '#2563eb' : '#d1d5db',
        textColor: isSelected ? '#ffffff' : '#374151',
      };
    case 'occupied':
      return {
        ...baseStyle,
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
        textColor: '#9ca3af',
        cursor: 'not-allowed',
        opacity: 0.5,
      };
    case 'selected':
      return {
        ...baseStyle,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        cursor: 'pointer',
      };
    case 'disabled':
      return {
        ...baseStyle,
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
        textColor: '#9ca3af',
        cursor: 'not-allowed',
        opacity: 0.5,
      };
    case 'empty':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: 'transparent',
        cursor: 'default',
        opacity: 0,
      };
    default:
      return baseStyle;
  }
};

// ===============================
// Individual Seat Component
// ===============================

interface SeatButtonProps {
  seat: SeatInfo;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  disabled?: boolean;
}

const SeatButton: React.FC<SeatButtonProps> = ({
  seat,
  isSelected,
  onSelect,
  onDeselect,
  disabled = false,
}) => {
  const getSeatStatus = (): SeatStatus => {
    if (seat.isEmpty) return 'empty';
    if (disabled) return 'disabled';
    if (isSelected) return 'selected';
    if (!seat.isSelectable) return 'occupied';
    return 'available';
  };

  const status = getSeatStatus();
  const style = getSeatStyle(status, isSelected);

  const handleClick = () => {
    if (disabled || seat.isEmpty || !seat.isSelectable) return;
    
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  };

  if (seat.isEmpty) {
    return <div className="w-8 h-8" />; // Empty space
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !seat.isSelectable}
      className={cn(
        "w-8 h-8 rounded border-2 text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        disabled && "cursor-not-allowed",
        !seat.isSelectable && "cursor-not-allowed"
      )}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.textColor,
        cursor: style.cursor,
        opacity: style.opacity,
      }}
      aria-label={`Seat ${seat.number} - ${status}`}
      title={`Seat ${seat.number}${seat.price ? ` - ${seat.price}€` : ''}`}
    >
      {seat.number}
    </button>
  );
};

// ===============================
// Seat Row Component
// ===============================

interface SeatRowProps {
  seats: SeatInfo[];
  rowIndex: number;
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  onSeatDeselect: (seatNumber: string) => void;
  disabled?: boolean;
}

const SeatRow: React.FC<SeatRowProps> = ({
  seats,
  rowIndex,
  selectedSeats,
  onSeatSelect,
  onSeatDeselect,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-1 mb-1">
      <span className="text-xs text-gray-500 w-4 text-center">{rowIndex + 1}</span>
      {seats.map((seat, index) => (
        <SeatButton
          key={`${rowIndex}-${index}`}
          seat={seat}
          isSelected={seat.number ? selectedSeats.includes(seat.number) : false}
          onSelect={() => seat.number && onSeatSelect(seat.number)}
          onDeselect={() => seat.number && onSeatDeselect(seat.number)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

// ===============================
// Main Seat Map Component
// ===============================

const SeatMap: React.FC<SeatMapProps> = ({
  seatMapData,
  selectedSeats,
  maxSeats,
  onSeatSelect,
  onSeatDeselect,
  loading = false,
}) => {
  if (!seatMapData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No seat map data available
      </div>
    );
  }

  const { plan, freeSeats, hasPlan } = seatMapData;

  // Convert plan data to seat info if available
  const getSeatInfo = (seatNumber: string | null, rowIndex: number, seatIndex: number): SeatInfo => {
    if (!seatNumber || seatNumber === '') {
      return {
        number: null,
        isEmpty: true,
        isSelectable: false,
      };
    }

    const normalizedSeat = normalizeSeatNumber(seatNumber);
    const isAvailable = isSeatAvailable(normalizedSeat, freeSeats);
    const price = getSeatPrice(normalizedSeat, freeSeats);

    return {
      number: seatNumber,
      isEmpty: false,
      isSelectable: isAvailable,
      isOccupied: !isAvailable,
      price,
      currency: 'EUR', // Default currency
    };
  };

  // Generate seat rows from plan or create simple grid
  const generateSeatRows = (): SeatInfo[][] => {
    if (plan && hasPlan === 1) {
      // Use plan data
      const floor = plan.floors[0]; // Use first floor
      if (floor && floor.rows && floor.rows.row) {
        return floor.rows.row.map((row, rowIndex) =>
          row.seat.map((seatNumber, seatIndex) =>
            getSeatInfo(seatNumber, rowIndex, seatIndex)
          )
        );
      }
    }

    // Fallback: create dynamic seat layout based on available seats only
    const availableSeats = freeSeats.filter(seat => seat.seat_free === 1);
    
    if (availableSeats.length === 0) {
      return [];
    }
    
    // Create dynamic seat layout based on actual available seats
    const rows: SeatInfo[][] = [];
    const seatsPerRow = 4; // 2 seats + aisle + 2 seats
    const totalRows = Math.ceil(availableSeats.length / 4); // Only show rows needed for available seats
    
    let seatIndex = 0;
    
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowSeats: SeatInfo[] = [];
      
      // Left side (2 seats)
      for (let col = 0; col < 2; col++) {
        if (seatIndex < availableSeats.length) {
          const seat = availableSeats[seatIndex];
          rowSeats.push({
            number: String(seat.seat_number),
            isEmpty: false,
            isSelectable: true,
            isOccupied: false,
            price: seat.seat_price || 0,
            currency: seat.seat_curency || 'EUR',
          });
          seatIndex++;
        } else {
          // Empty space if no more seats
          rowSeats.push({
            number: null,
            isEmpty: true,
            isSelectable: false,
          });
        }
      }
      
      // Aisle (empty space)
      rowSeats.push({
        number: null,
        isEmpty: true,
        isSelectable: false,
      });
      
      // Right side (2 seats)
      for (let col = 0; col < 2; col++) {
        if (seatIndex < availableSeats.length) {
          const seat = availableSeats[seatIndex];
          rowSeats.push({
            number: String(seat.seat_number),
            isEmpty: false,
            isSelectable: true,
            isOccupied: false,
            price: seat.seat_price || 0,
            currency: seat.seat_curency || 'EUR',
          });
          seatIndex++;
        } else {
          // Empty space if no more seats
          rowSeats.push({
            number: null,
            isEmpty: true,
            isSelectable: false,
          });
        }
      }
      
      rows.push(rowSeats);
    }

    return rows;
  };

  const seatRows = generateSeatRows();
  const canSelectMore = selectedSeats.length < maxSeats;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading seat map...</span>
      </div>
    );
  }

  if (seatRows.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No seats available</p>
        <p className="text-sm mt-2">All seats are currently occupied</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Select Seats</h3>
          <p className="text-sm text-gray-600">
            {freeSeats.filter(seat => seat.seat_free === 1).length} seats available
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {selectedSeats.length} / {maxSeats} selected
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-gray-50 p-4 rounded-lg">
        {/* Driver area indicator */}
        <div className="text-center mb-4">
          <div className="text-xs text-gray-500 mb-2">Driver</div>
          <div className="w-16 h-2 bg-gray-300 mx-auto rounded"></div>
        </div>

        {/* Dynamic seat rows - only show rows with actual seats */}
        <div className="space-y-2">
          {seatRows
            .filter(row => row.some(seat => seat.number && !seat.isEmpty)) // Only show rows with actual seats
            .map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              {/* Row number */}
              <div className="w-6 text-xs text-gray-500 text-center">
                {rowIndex + 1}
              </div>
              
              {/* Left side seats (2 seats) */}
              <div className="flex gap-1">
                {row.slice(0, 2).map((seat, seatIndex) => (
                  <SeatButton
                    key={`left-${seatIndex}`}
                    seat={seat}
                    isSelected={seat.number ? selectedSeats.includes(seat.number) : false}
                    onSelect={() => seat.number && onSeatSelect(seat.number)}
                    onDeselect={() => seat.number && onSeatDeselect(seat.number)}
                    disabled={false}
                  />
                ))}
              </div>
              
              {/* Aisle */}
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-1 h-6 bg-gray-300 rounded"></div>
              </div>
              
              {/* Right side seats (2 seats) */}
              <div className="flex gap-1">
                {row.slice(3, 5).map((seat, seatIndex) => (
                  <SeatButton
                    key={`right-${seatIndex}`}
                    seat={seat}
                    isSelected={seat.number ? selectedSeats.includes(seat.number) : false}
                    onSelect={() => seat.number && onSeatSelect(seat.number)}
                    onDeselect={() => seat.number && onSeatDeselect(seat.number)}
                    disabled={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Aisle indicator */}
        <div className="text-center mt-4">
          <div className="w-16 h-2 bg-gray-300 mx-auto rounded"></div>
          <div className="text-xs text-gray-500 mt-2">Aisle</div>
        </div>
      </div>

      {/* Selection info */}
      {selectedSeats.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Selected seats: {selectedSeats.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
