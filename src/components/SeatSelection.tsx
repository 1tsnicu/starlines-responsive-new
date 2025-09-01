/**
 * SEAT SELECTION COMPONENT
 * 
import type {
  FreeSeat,
  NormalizedSeatsResponse,
  VagonInfo,
  TrainInfo,
  BusInfo,
  SeatSelection as SelectedSeat,
  GetFreeSeatsRequest,
} from '@/types/getFreeSeats';entă React pentru selectarea locurilor cu vizualizare interactivă
 * Suportă trenuri cu vagoane și autobuze
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Train, 
  Bus, 
  MapPin, 
  User, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  Info
} from 'lucide-react';

import type {
  FreeSeat,
  NormalizedSeatsResponse,
  VagonInfo,
  TrainInfo,
  BusInfo,
  SeatSelection as SelectedSeat,
  GetFreeSeatsRequest
} from '@/types/getFreeSeats';

import { 
  getFreeSeatsByInterval,
  extractFreeSeats,
  groupSeatsByVagon,
  calculateSeatsStatistics,
  findBestAvailableSeats,
  type FreeSeatsApiConfig
} from '@/lib/freeSeatsApi';

// ===============================
// Component Props
// ===============================

export interface SeatSelectionProps {
  // Required
  intervalId: string;
  login: string;
  password: string;
  
  // Optional configuration
  trainId?: string;
  vagonId?: string;
  currency?: string;
  lang?: string;
  session?: string;
  
  // Selection options
  maxSeats?: number;
  allowMultipleSelection?: boolean;
  requireSeatSelection?: boolean;
  
  // Filtering
  maxPrice?: number;
  preferredClass?: string;
  showOnlyFreeSeats?: boolean;
  
  // UI options
  showPrices?: boolean;
  showSeatNumbers?: boolean;
  showLegend?: boolean;
  showStatistics?: boolean;
  compactView?: boolean;
  
  // Callbacks
  onSeatSelect?: (seats: SelectedSeat[]) => void;
  onError?: (error: Error) => void;
  onLoadingChange?: (loading: boolean) => void;
  
  // API configuration
  apiConfig?: FreeSeatsApiConfig;
  
  // Styling
  className?: string;
}

// ===============================
// Seat Component
// ===============================

interface SeatProps {
  seat: FreeSeat;
  isSelected: boolean;
  onClick: (seat: FreeSeat) => void;
  showPrice: boolean;
  showNumber: boolean;
  disabled?: boolean;
}

const SeatComponent: React.FC<SeatProps> = ({
  seat,
  isSelected,
  onClick,
  showPrice,
  showNumber,
  disabled = false
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && seat.is_free) {
      onClick(seat);
    }
  }, [seat, onClick, disabled]);
  
  const seatClass = useMemo(() => {
    const baseClass = "relative w-10 h-10 border-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium";
    
    if (!seat.is_free) {
      return `${baseClass} bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-60`;
    }
    
    if (isSelected) {
      return `${baseClass} bg-blue-500 border-blue-600 text-white shadow-lg transform scale-110`;
    }
    
    if (disabled) {
      return `${baseClass} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseClass} bg-green-100 border-green-300 text-green-700 hover:bg-green-200 hover:border-green-400 hover:transform hover:scale-105`;
  }, [seat.is_free, isSelected, disabled]);
  
  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        className={seatClass}
        onClick={handleClick}
        disabled={disabled || !seat.is_free}
        title={`Seat ${seat.seat_number} - ${seat.is_free ? `€${seat.price}` : 'Occupied'}`}
      >
        {showNumber ? seat.seat_number : <User size={16} />}
      </button>
      {showPrice && seat.is_free && (
        <span className="text-xs text-gray-600">€{seat.price}</span>
      )}
    </div>
  );
};

// ===============================
// Vagon Component
// ===============================

interface VagonProps {
  vagon: VagonInfo;
  selectedSeats: string[];
  onSeatSelect: (seat: FreeSeat) => void;
  showPrices: boolean;
  showNumbers: boolean;
  maxSeats: number;
}

const VagonComponent: React.FC<VagonProps> = ({
  vagon,
  selectedSeats,
  onSeatSelect,
  showPrices,
  showNumbers,
  maxSeats
}) => {
  const seatRows = useMemo(() => {
    // Group seats by row (assuming 4-seat rows)
    const rows: FreeSeat[][] = [];
    const seatsPerRow = 4;
    
    for (let i = 0; i < vagon.seats.length; i += seatsPerRow) {
      rows.push(vagon.seats.slice(i, i + seatsPerRow));
    }
    
    return rows;
  }, [vagon.seats]);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Train size={16} />
            <span>Vagon {vagon.vagon_id}</span>
            {vagon.class && (
              <Badge variant="outline" className="text-xs">
                {vagon.class}
              </Badge>
            )}
          </CardTitle>
          <div className="text-xs text-gray-600">
            {vagon.free_seats}/{vagon.total_seats} free
          </div>
        </div>
        {vagon.name && (
          <p className="text-xs text-gray-600">{vagon.name}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {seatRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-2">
              {row.map((seat, seatIndex) => (
                <div key={seat.seat_number} className="flex">
                  <SeatComponent
                    seat={seat}
                    isSelected={selectedSeats.includes(seat.seat_number)}
                    onClick={onSeatSelect}
                    showPrice={showPrices}
                    showNumber={showNumbers}
                    disabled={selectedSeats.length >= maxSeats && !selectedSeats.includes(seat.seat_number)}
                  />
                  {seatIndex === 1 && <div className="w-4" />} {/* Aisle space */}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {vagon.services && vagon.services.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1">
              {vagon.services.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===============================
// Bus Component
// ===============================

interface BusProps {
  bus: BusInfo;
  selectedSeats: string[];
  onSeatSelect: (seat: FreeSeat) => void;
  showPrices: boolean;
  showNumbers: boolean;
  maxSeats: number;
}

const BusComponent: React.FC<BusProps> = ({
  bus,
  selectedSeats,
  onSeatSelect,
  showPrices,
  showNumbers,
  maxSeats
}) => {
  const seatLayout = useMemo(() => {
    // Typical bus layout: 2+2 seats
    const rows: FreeSeat[][] = [];
    const seatsPerRow = 4;
    
    for (let i = 0; i < bus.seats.length; i += seatsPerRow) {
      rows.push(bus.seats.slice(i, i + seatsPerRow));
    }
    
    return rows;
  }, [bus.seats]);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Bus size={16} />
            <span>Bus {bus.bus_number}</span>
          </div>
          <div className="text-xs text-gray-600">
            {bus.free_seats}/{bus.total_seats} free
          </div>
        </CardTitle>
        {bus.name && (
          <p className="text-xs text-gray-600">{bus.name}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-3">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center items-center space-x-1">
                {/* Front of bus indicator */}
                {rowIndex === 0 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs text-gray-500">
                    Front
                  </div>
                )}
                
                {/* Left seats */}
                <div className="flex space-x-1">
                  {row.slice(0, 2).map(seat => (
                    <SeatComponent
                      key={seat.seat_number}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat.seat_number)}
                      onClick={onSeatSelect}
                      showPrice={showPrices}
                      showNumber={showNumbers}
                      disabled={selectedSeats.length >= maxSeats && !selectedSeats.includes(seat.seat_number)}
                    />
                  ))}
                </div>
                
                {/* Aisle */}
                <div className="w-6 h-10 flex items-center justify-center">
                  <div className="w-1 h-6 bg-gray-300 rounded"></div>
                </div>
                
                {/* Right seats */}
                <div className="flex space-x-1">
                  {row.slice(2, 4).map(seat => seat ? (
                    <SeatComponent
                      key={seat.seat_number}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat.seat_number)}
                      onClick={onSeatSelect}
                      showPrice={showPrices}
                      showNumber={showNumbers}
                      disabled={selectedSeats.length >= maxSeats && !selectedSeats.includes(seat.seat_number)}
                    />
                  ) : (
                    <div key={`empty-${rowIndex}`} className="w-10 h-10"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===============================
// Main Component
// ===============================

export const SeatSelection: React.FC<SeatSelectionProps> = ({
  intervalId,
  login,
  password,
  trainId,
  vagonId,
  currency = 'EUR',
  lang = 'en',
  session,
  maxSeats = 4,
  allowMultipleSelection = true,
  requireSeatSelection = false,
  maxPrice,
  preferredClass,
  showOnlyFreeSeats = false,
  showPrices = true,
  showSeatNumbers = true,
  showLegend = true,
  showStatistics = true,
  compactView = false,
  onSeatSelect,
  onError,
  onLoadingChange,
  apiConfig,
  className = ''
}) => {
  // ===============================
  // State Management
  // ===============================
  
  const [seatsData, setSeatsData] = useState<NormalizedSeatsResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter state
  const [filters, setFilters] = useState({
    maxPrice: maxPrice || 999,
    preferredClass: preferredClass || 'all',
    showOnlyFree: showOnlyFreeSeats
  });
  
  // ===============================
  // Data Loading
  // ===============================
  
  const loadSeatsData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      onLoadingChange?.(true);
      
      const request: GetFreeSeatsRequest = {
        interval_id: intervalId,
        train_id: trainId,
        vagon_id: vagonId,
        login,
        password,
        currency,
        lang,
        session
      };
      
      const response = await getFreeSeatsByInterval(request, {
        ...apiConfig,
        force_refresh: forceRefresh
      });
      
      setSeatsData(response);
      
      // Set initial active tab
      if (response.vehicle_type === 'train' && response.trains.length > 0) {
        setActiveTab(response.trains[0].train_id);
      } else if (response.buses.length > 0) {
        setActiveTab(response.buses[0].bus_id);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load seats data';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [intervalId, trainId, vagonId, login, password, currency, lang, session, apiConfig, onError, onLoadingChange]);
  
  useEffect(() => {
    loadSeatsData();
  }, [loadSeatsData]);
  
  // ===============================
  // Seat Selection Logic
  // ===============================
  
  const handleSeatClick = useCallback((seat: FreeSeat) => {
    if (!seat.is_free) return;
    
    setSelectedSeats(prev => {
      const seatIndex = prev.findIndex(s => s.seat_number === seat.seat_number);
      let newSelection: SelectedSeat[];
      
      if (seatIndex >= 0) {
        // Deselect seat
        newSelection = prev.filter((_, index) => index !== seatIndex);
      } else {
        // Select seat
        if (!allowMultipleSelection) {
          // Single selection mode
          newSelection = [{
            seat_number: seat.seat_number,
            price: seat.price,
            vagon_id: seat.vagon_id,
            class: seat.class,
            seat_type: seat.seat_type
          }];
        } else {
          // Multiple selection mode
          if (prev.length >= maxSeats) {
            return prev; // Don't exceed max seats
          }
          
          newSelection = [...prev, {
            seat_number: seat.seat_number,
            price: seat.price,
            vagon_id: seat.vagon_id,
            class: seat.class,
            seat_type: seat.seat_type
          }];
        }
      }
      
      onSeatSelect?.(newSelection);
      return newSelection;
    });
  }, [allowMultipleSelection, maxSeats, onSeatSelect]);
  
  // ===============================
  // Filtered Data
  // ===============================
  
  const filteredSeatsData = useMemo(() => {
    if (!seatsData) return null;
    
    const filterSeat = (seat: FreeSeat): boolean => {
      if (filters.showOnlyFree && !seat.is_free) return false;
      if (seat.price > filters.maxPrice) return false;
      if (filters.preferredClass !== 'all' && seat.class !== filters.preferredClass) return false;
      return true;
    };
    
    const filteredData = { ...seatsData };
    
    // Filter trains and vagons
    filteredData.trains = seatsData.trains.map(train => ({
      ...train,
      vagons: train.vagons.map(vagon => ({
        ...vagon,
        seats: vagon.seats.filter(filterSeat)
      }))
    }));
    
    // Filter buses
    filteredData.buses = seatsData.buses.map(bus => ({
      ...bus,
      seats: bus.seats.filter(filterSeat)
    }));
    
    // Update all_seats
    filteredData.all_seats = seatsData.all_seats.filter(filterSeat);
    filteredData.free_seats = filteredData.all_seats.filter(seat => seat.is_free).length;
    filteredData.total_seats = filteredData.all_seats.length;
    
    return filteredData;
  }, [seatsData, filters]);
  
  // ===============================
  // Statistics
  // ===============================
  
  const statistics = useMemo(() => {
    if (!filteredSeatsData) return null;
    return calculateSeatsStatistics(filteredSeatsData);
  }, [filteredSeatsData]);
  
  // ===============================
  // Best Seats Recommendations
  // ===============================
  
  const bestSeats = useMemo(() => {
    if (!filteredSeatsData) return [];
    
    return findBestAvailableSeats(filteredSeatsData, {
      max_results: 6,
      prefer_window: true,
      max_price: filters.maxPrice,
      preferred_class: filters.preferredClass !== 'all' ? filters.preferredClass : undefined
    });
  }, [filteredSeatsData, filters]);
  
  // ===============================
  // Render Functions
  // ===============================
  
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert className={`border-red-200 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSeatsData(true)}
              className="ml-2"
            >
              <RefreshCw size={14} className="mr-1" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!filteredSeatsData || filteredSeatsData.all_seats.length === 0) {
    return (
      <Alert className={className}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No seats available for the selected criteria.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Statistics */}
      {showStatistics && statistics && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.free_seats}
                </div>
                <div className="text-sm text-gray-600">Free Seats</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {statistics.total_seats}
                </div>
                <div className="text-sm text-gray-600">Total Seats</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.occupancy_rate}%
                </div>
                <div className="text-sm text-gray-600">Occupancy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  €{statistics.pricing.min_price}-{statistics.pricing.max_price}
                </div>
                <div className="text-sm text-gray-600">Price Range</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter size={18} />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxPrice">Max Price (€)</Label>
              <Select
                value={filters.maxPrice.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">€50</SelectItem>
                  <SelectItem value="100">€100</SelectItem>
                  <SelectItem value="200">€200</SelectItem>
                  <SelectItem value="999">No limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="class">Preferred Class</Label>
              <Select
                value={filters.preferredClass}
                onValueChange={(value) => setFilters(prev => ({ ...prev, preferredClass: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="1">First Class</SelectItem>
                  <SelectItem value="2">Second Class</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnlyFree"
                checked={filters.showOnlyFree}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showOnlyFree: checked as boolean }))
                }
              />
              <Label htmlFor="showOnlyFree">Show only free seats</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Best Seats Recommendations */}
      {bestSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle size={18} className="text-green-600" />
              <span>Recommended Seats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {bestSeats.map(seat => (
                <Button
                  key={seat.seat_number}
                  variant={selectedSeats.some(s => s.seat_number === seat.seat_number) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSeatClick(seat)}
                  className="h-auto p-2 flex flex-col"
                >
                  <span className="font-medium">{seat.seat_number}</span>
                  <span className="text-xs">€{seat.price}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Seat Selection */}
      {filteredSeatsData.vehicle_type === 'train' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            {filteredSeatsData.trains.map(train => (
              <TabsTrigger key={train.train_id} value={train.train_id} className="flex items-center space-x-2">
                <Train size={16} />
                <span>Train {train.train_number}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {filteredSeatsData.trains.map(train => (
            <TabsContent key={train.train_id} value={train.train_id}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {train.vagons.map(vagon => (
                  <VagonComponent
                    key={vagon.vagon_id}
                    vagon={vagon}
                    selectedSeats={selectedSeats.map(s => s.seat_number)}
                    onSeatSelect={handleSeatClick}
                    showPrices={showPrices}
                    showNumbers={showSeatNumbers}
                    maxSeats={maxSeats}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSeatsData.buses.map(bus => (
            <BusComponent
              key={bus.bus_id}
              bus={bus}
              selectedSeats={selectedSeats.map(s => s.seat_number)}
              onSeatSelect={handleSeatClick}
              showPrices={showPrices}
              showNumbers={showSeatNumbers}
              maxSeats={maxSeats}
            />
          ))}
        </div>
      )}
      
      {/* Legend */}
      {showLegend && (
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded opacity-60"></div>
                <span className="text-sm">Occupied</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Selected Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedSeats.map(seat => (
                <div key={seat.seat_number} className="flex justify-between items-center">
                  <span className="font-medium">Seat {seat.seat_number}</span>
                  <div className="flex items-center space-x-2">
                    {seat.vagon_id && (
                      <Badge variant="outline">Vagon {seat.vagon_id}</Badge>
                    )}
                    {seat.class && (
                      <Badge variant="outline">{seat.class}</Badge>
                    )}
                    <span className="font-medium">€{seat.price}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-blue-200">
                <div className="flex justify-between items-center font-bold text-blue-800">
                  <span>Total ({selectedSeats.length} seats)</span>
                  <span>€{selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeatSelection;
