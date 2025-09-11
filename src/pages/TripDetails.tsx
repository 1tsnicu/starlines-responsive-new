import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, Star, Wifi, Zap, Bath, Snowflake, Users, Bus, Shield, CreditCard, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoutes, getFreeSeats, RouteSummary } from "@/lib/bussystem";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";

// Interfața pentru locuri
interface Seat {
  seat_number: string | number;
  seat_free: number;
  seat_price?: number;
  seat_curency?: string;
}

// Componenta pentru selectia unui loc individual
const SeatButton: React.FC<{
  seat: Seat | string | number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ seat, isSelected, onSelect }) => {
  // Standardizăm formatul pentru a gestiona și șiruri simple, și obiecte seat
  const seatNumber = typeof seat === 'object' ? seat.seat_number : seat;
  const isFree = typeof seat === 'object' ? seat.seat_free !== 0 : true;
  const price = typeof seat === 'object' ? seat.seat_price : undefined;
  const currency = typeof seat === 'object' ? seat.seat_curency : 'EUR';
  
  // Definim culorile pentru diferite stări ale locurilor - similar cu imaginea partajată
  let bgColor, textColor, borderColor;
  
  if (isSelected) {
    bgColor = "bg-red-600";
    textColor = "text-white";
    borderColor = "border-red-700";
  } else if (isFree) {
    bgColor = "bg-blue-600";
    textColor = "text-white";
    borderColor = "border-blue-700";
  } else {
    bgColor = "bg-gray-400";
    textColor = "text-white";
    borderColor = "border-gray-500";
  }
  
  return (
    <button
      className={`h-10 w-10 ${bgColor} ${textColor} ${borderColor} flex items-center justify-center font-medium text-sm border rounded-sm transition-colors`}
      disabled={!isFree}
      onClick={onSelect}
      title={`Loc ${seatNumber}${price ? ` (${price} ${currency})` : ''}${isFree ? ' - Disponibil' : ' - Ocupat'}${isSelected ? ' - Selectat' : ''}`}
    >
      {seatNumber}
      {price && (
        <div className="absolute -bottom-5 text-xs text-foreground whitespace-nowrap">
          {price} {currency}
        </div>
      )}
    </button>
  );
};

// Componenta pentru planul autobuzului - nu mai este folosită, dar păstrată pentru compatibilitate
const BusPlan: React.FC<{
  seats: Seat[];
  selectedSeats: (string | number)[];
  onSeatSelect: (seat: string | number) => void;
  hasPlan: boolean;
}> = ({ seats, selectedSeats, onSeatSelect, hasPlan }) => {
  // Definim layout-ul autobuzului pentru afișare vizuală similară cu imaginea
  // În acest caz vom folosi un layout specific de 4 scaune pe rând (2+2)
  // Cu excepția ultimului rând care poate avea doar 3 scaune
  
  // Pregătim datele pentru afișare
  // Pentru a crea o mapare vizuală corectă, vom folosi un array predefinit cu poziții pentru locuri
  const busLayout = [
    // Șofer și loc ghid în față
    { row: 0, seats: ["driver", null, "guide"] },
    
    // Rândurile cu scaune pentru pasageri (4 scaune per rând: 2 pe stânga, 2 pe dreapta)
    { row: 1, seats: [1, 2, null, 3, 4] },
    { row: 2, seats: [5, 6, null, 7, 8] },
    { row: 3, seats: [9, 10, null, 11, 12] },
    { row: 4, seats: [13, 14, null, 15, 16] },
    { row: 5, seats: [17, 18, null, 19, 20] }
  ];
  
  // Funcție pentru a obține informații despre un scaun după număr
  const getSeatInfo = (seatNumber: string | number) => {
    if (seatNumber === "driver" || seatNumber === "guide") {
      return { seat_number: seatNumber, seat_free: 0 }; // Șofer și ghid nu sunt disponibili
    }
    
    const seat = seats.find(s => {
      const num = typeof s === 'object' ? s.seat_number : s;
      return num == seatNumber; // Folosim == în loc de === pentru a compara și string cu number
    });
    
    return seat || { seat_number: seatNumber, seat_free: 1 }; // Default la liber dacă nu avem informații
  };
  
  // Legendă pentru statele scaunelor
  const SeatLegend = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white text-sm">
          L
        </div>
        <span className="text-sm">Liber</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center bg-red-600 text-white text-sm">
          S
        </div>
        <span className="text-sm">Selectat</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center bg-gray-400 text-white text-sm">
          I
        </div>
        <span className="text-sm">Indisponibil</span>
      </div>
    </div>
  );

  // Componenta pentru un scaun în layout-ul autobuzului
  const BusSeat: React.FC<{
    seatNumber: string | number;
    onSelect?: () => void;
  }> = ({ seatNumber, onSelect }) => {
    if (seatNumber === null) {
      // Spațiu gol (culoar)
      return <div className="w-8 h-8"></div>;
    }
    
    if (seatNumber === "driver") {
      // Scaunul șoferului
      return (
        <div className="w-10 h-10 bg-gray-300 border border-gray-400 flex items-center justify-center text-xs rounded-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="6" r="4"/>
            <path d="M12 10v14"/>
            <line x1="8" y1="18" x2="16" y2="18"/>
          </svg>
        </div>
      );
    }
    
    if (seatNumber === "guide") {
      // Scaunul ghidului
      return (
        <div className="w-10 h-10 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs rounded-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
          </svg>
        </div>
      );
    }
    
    // Scaun normal
    const seatInfo = getSeatInfo(seatNumber);
    const isFree = typeof seatInfo === 'object' ? seatInfo.seat_free !== 0 : true;
    const isSelected = selectedSeats.includes(seatNumber);
    
    // Determinăm clasa CSS în funcție de starea scaunului
    let bgColorClass = "bg-gray-400"; // Indisponibil (default)
    
    if (isFree) {
      bgColorClass = isSelected ? "bg-red-600" : "bg-blue-600";
    }
    
    return (
      <button
        className={`w-8 h-8 ${bgColorClass} text-white text-sm font-medium flex items-center justify-center cursor-pointer`}
        onClick={isFree ? onSelect : undefined}
        disabled={!isFree}
        title={`Loc ${seatNumber} ${isFree ? (isSelected ? '- Selectat' : '- Liber') : '- Ocupat'}`}
      >
        {seatNumber}
      </button>
    );
  };

  if (!hasPlan) {
    // Afișare simplificată pentru autobuze fără plan specific
    return (
      <div>
        <SeatLegend />
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 my-4">
          {seats.map(seat => {
            const seatNumber = typeof seat === 'object' ? seat.seat_number : seat;
            return (
              <BusSeat
                key={seatNumber}
                seatNumber={seatNumber}
                onSelect={() => onSeatSelect(seatNumber)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 my-4">
      <SeatLegend />
      
      <div className="flex justify-center mb-2">
        <div className="bg-gray-200 w-1/2 h-12 flex items-center justify-center rounded-t-lg border border-gray-300">
          Față Autobuz
        </div>
      </div>
      
      <div className="mx-auto max-w-xs">
        {/* Afișăm layout-ul de scaune conform schemei predefinite */}
        {busLayout.map((row) => (
          <div key={`row-${row.row}`} className="flex justify-center items-center mb-1 gap-1">
            {row.seats.map((seatNumber, idx) => (
              <div key={`seat-${row.row}-${idx}`}>
                <BusSeat 
                  seatNumber={seatNumber} 
                  onSelect={seatNumber !== null && seatNumber !== "driver" && seatNumber !== "guide" 
                    ? () => onSeatSelect(seatNumber) 
                    : undefined}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Legenda la partea de jos a autobuzului */}
      <div className="flex justify-center mt-4">
        <div className="bg-gray-200 w-1/2 h-8 flex items-center justify-center rounded-b-lg border border-gray-300">
          Spate Autobuz
        </div>
      </div>
    </div>
  );
};

// Componenta principală pentru selecția locurilor
const SeatSelection: React.FC<{
  freeSeats: (Seat | string | number)[];
  passengerCount: number; 
  onSelectionChange: (seats: (string | number)[]) => void;
  hasPlan: boolean;
}> = ({ freeSeats, passengerCount, onSelectionChange, hasPlan }) => {
  const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
  
  // Standardizăm formatul pentru toate locurile
  const normalizedSeats = freeSeats.map(seat => {
    if (typeof seat === 'object') return seat;
    return { seat_number: seat, seat_free: 1 };
  });

  // Calculăm statistici despre locuri
  const totalSeats = normalizedSeats.length;
  const occupiedSeats = normalizedSeats.filter(seat => seat.seat_free === 0).length;
  const availableSeats = totalSeats - occupiedSeats;

  const handleSelect = (seat: string | number) => {
    let newSelection = selectedSeats.includes(seat)
      ? selectedSeats.filter(s => s !== seat)
      : selectedSeats.length < passengerCount
        ? [...selectedSeats, seat]
        : selectedSeats;
    
    setSelectedSeats(newSelection);
    onSelectionChange(newSelection);
  };

  // Functie pentru a șterge toate locurile selectate
  const handleClearSelection = () => {
    setSelectedSeats([]);
    onSelectionChange([]);
  };

  // Functie pentru a selecta automat locuri
  const handleAutoSelect = () => {
    if (passengerCount <= availableSeats) {
      // Filtram locurile libere și luăm primele `passengerCount`
      const freeSeatsArray = normalizedSeats
        .filter(seat => seat.seat_free !== 0)
        .slice(0, passengerCount)
        .map(seat => seat.seat_number);
        
      setSelectedSeats(freeSeatsArray);
      onSelectionChange(freeSeatsArray);
    }
  };

  // Definim planul autobuzului similar cu imaginea de referință
  const renderBusLayout = () => {
    // Utilizăm o structură fixă pentru a asigura o reprezentare vizuală similară cu imaginea
    const rows = [
      [null, null, 20, null, 3, 6, 9, 12, 15, 18],
      [null, null, null, null, null, null, null, null, null, null],  // Rând gol pentru spațiere
      ["driver", null, null, null, 2, 5, 8, 11, 14, 17],
      [null, null, null, null, 1, 4, 7, 10, 13, 16],
    ];
    
    // Verificăm dacă un loc este disponibil
    const isSeatFree = (seatNumber: number | string) => {
      if (typeof seatNumber !== 'number') return false;
      
      const seat = normalizedSeats.find(s => {
        const num = typeof s === 'object' ? s.seat_number : s;
        return String(num) === String(seatNumber);
      });
      
      return seat ? (typeof seat === 'object' ? seat.seat_free !== 0 : true) : true;
    };
    
    // Verificăm dacă un loc este selectat
    const isSeatSelected = (seatNumber: number | string) => {
      return selectedSeats.some(s => String(s) === String(seatNumber));
    };
    
    return (
      <div className="mx-auto max-w-2xl bg-white p-6 border rounded-lg">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">Chișinău → București</div>
          <div className="text-sm font-medium">12.09.2025</div>
        </div>
        
        {/* Partea frontală a autobuzului */}
        <div className="bg-gray-100 border-b border-gray-300 h-12 flex items-center justify-center rounded-t-lg mb-6">
          <div className="text-sm text-gray-600 font-medium">Față</div>
        </div>
        
        {/* Planul de locuri */}
        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-between space-x-2">
              {row.map((seat, seatIndex) => {
                // Spații goale sau alee
                if (seat === null) {
                  return <div key={`empty-${rowIndex}-${seatIndex}`} className="w-8 h-8"></div>;
                }
                
                // Loc șofer
                if (seat === "driver") {
                  return (
                    <div 
                      key={`driver-${rowIndex}-${seatIndex}`}
                      className="w-8 h-8 bg-gray-300 flex items-center justify-center text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="6" r="4"/>
                        <path d="M12 10v14"/>
                        <line x1="8" y1="18" x2="16" y2="18"/>
                      </svg>
                    </div>
                  );
                }
                
                // Locuri normale
                const free = isSeatFree(seat);
                const selected = isSeatSelected(seat);
                
                let bgColor = "bg-gray-400"; // Indisponibil
                let displayText = "I"; // Implicit indisponibil
                
                if (free) {
                  if (selected) {
                    bgColor = "bg-red-600";
                    displayText = "S";
                  } else {
                    bgColor = "bg-blue-600";
                    displayText = "L";
                  }
                }
                
                return (
                  <button
                    key={`seat-${rowIndex}-${seatIndex}`}
                    className={`w-8 h-8 ${bgColor} text-white flex items-center justify-center font-medium text-sm`}
                    onClick={() => free ? handleSelect(seat) : null}
                    disabled={!free}
                    title={`Loc ${seat}`}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Partea din spate a autobuzului */}
        <div className="bg-gray-100 border-t border-gray-300 h-12 flex items-center justify-center rounded-b-lg mt-6">
          <div className="text-sm text-gray-600 font-medium">Spate</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header cu titlu și statistici */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-medium mb-1">Selectează locurile pentru {passengerCount} pasageri</h3>
          <div className="text-sm text-muted-foreground">
            {availableSeats} locuri disponibile din {totalSeats} total
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAutoSelect}
            disabled={availableSeats < passengerCount || selectedSeats.length === passengerCount}
          >
            Selectare automată
          </Button>
          
          {selectedSeats.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearSelection}
            >
              Resetare selecție
            </Button>
          )}
        </div>
      </div>

      {/* Legendă cu explicarea culorilor */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-6">
        <div className="text-sm font-medium mb-3">Legendă:</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center mr-2">
              L
            </div>
            <span>Liber</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center mr-2">
              S
            </div>
            <span>Selectat</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-400 text-white flex items-center justify-center mr-2">
              I
            </div>
            <span>Indisponibil</span>
          </div>
        </div>
      </div>

      {/* Layout personalizat pentru autobus - similar cu imaginea de referință */}
      {renderBusLayout()}

      {/* Afișarea locurilor selectate */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-medium mb-2">
              Locuri selectate: {selectedSeats.length} din {passengerCount} necesare
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.length > 0 ? (
                selectedSeats.map(seat => (
                  <div key={seat} className="inline-flex items-center bg-gray-100 border border-gray-300 px-3 py-1 rounded text-sm">
                    Loc {seat}
                    <button 
                      className="ml-2 text-gray-500 hover:text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(seat);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Niciun loc selectat</div>
              )}
            </div>
          </div>
          
          <div className="shrink-0">
            <div className="text-sm text-gray-600 mb-1">Progres selecție:</div>
            <div className="h-4 w-36 bg-gray-200 rounded overflow-hidden border">
              <div 
                className={
                  selectedSeats.length === passengerCount ? "h-full bg-green-600" : "h-full bg-blue-600"
                }
                style={{ width: `${(selectedSeats.length / passengerCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerte și notificări */}
      {selectedSeats.length > 0 && selectedSeats.length < passengerCount && (
        <Alert className="mt-4" variant="default">
          <AlertTitle>Încă {passengerCount - selectedSeats.length} {passengerCount - selectedSeats.length === 1 ? 'loc necesar' : 'locuri necesare'}</AlertTitle>
          <AlertDescription>
            Te rugăm să selectezi toate locurile pentru a continua cu rezervarea.
          </AlertDescription>
        </Alert>
      )}
      
      {selectedSeats.length === passengerCount && (
        <Alert className="mt-4 bg-success/20 border-success text-success">
          <AlertTitle>Selecție completă!</AlertTitle>
          <AlertDescription>
            Ai selectat toate locurile necesare. Poți continua cu rezervarea.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

interface InfoBusRoute {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  operator: string;
  price: {
    economy: number;
    premium: number;
    business: number;
  };
  amenities: string[];
  free_seats?: any[];
  request_get_free_seats: number;
  interval_id?: string;
  has_seat_plan?: boolean;
}

const TripDetails: React.FC = () => {
  const { formatPrice, t } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedFare, setSelectedFare] = useState<string>("economy");
  const [passengers, setPassengers] = useState(1);
  const [route, setRoute] = useState<InfoBusRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [freeSeats, setFreeSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  // Get parameters from query parameters - acceptăm multiple formate
  const routeId = searchParams.get("routeId") || searchParams.get("route_id") || searchParams.get("id"); // Acceptăm mai multe variante
  const selectedDate = searchParams.get("date") || searchParams.get("departure_date") || new Date().toISOString().split('T')[0];
  const initialPassengers = parseInt(searchParams.get("passengers") || searchParams.get("passenger_count") || "1");
  
  // Parametrii suplimentari direct din URL
  const fromId = searchParams.get("fromId") || searchParams.get("from_id") || searchParams.get("from");
  const toId = searchParams.get("toId") || searchParams.get("to_id") || searchParams.get("to");

  useEffect(() => {
    setPassengers(initialPassengers);
  }, [initialPassengers]);

  // Load route data
  useEffect(() => {
    const loadRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determinăm parametrii de căutare pentru rută
        let searchFromId, searchToId;
        
        // Cazul 1: Avem direct fromId și toId în URL
        if (fromId && toId) {
          searchFromId = fromId;
          searchToId = toId;
        }
        // Cazul 2: routeId conține informații în format fromId-toId-intervalId
        else if (routeId && routeId.includes('-')) {
          const parts = routeId.split('-');
          if (parts.length >= 2) {
            searchFromId = parts[0];
            searchToId = parts[1];
          }
        }
        // Cazul 3: routeId conține doar un ID (ar putea fi un interval_id)
        else if (routeId) {
          // Încercăm să determinăm dacă avem din alte surse fromId și toId
          const urlPath = window.location.pathname;
          const pathParts = urlPath.split('/');
          
          // Verificăm dacă ruta URL conține informații de tip /route/fromId/toId
          if (pathParts.length >= 4) {
            const potentialFromId = pathParts[pathParts.length - 2];
            const potentialToId = pathParts[pathParts.length - 1];
            
            // Verificăm dacă par a fi ID-uri valide (numere)
            if (!isNaN(Number(potentialFromId)) && !isNaN(Number(potentialToId))) {
              searchFromId = potentialFromId;
              searchToId = potentialToId;
            }
          }
        }
        
        // Verificăm dacă avem parametrii minimi necesari pentru a face căutarea
        if (!searchFromId || !searchToId) {
          console.log("Missing route parameters:", { routeId, fromId, toId, urlPath: window.location.pathname });
          setError("No route parameters provided");
          setLoading(false);
          return;
        }
        
        console.log(`Loading route with fromId=${searchFromId}, toId=${searchToId}, date=${selectedDate}`);
        
        // Folosim getRoutes din API pentru a obține detaliile rutei
        const routesData = await getRoutes({
          id_from: searchFromId,
          id_to: searchToId,
          date: selectedDate
        });
        
        if (routesData && routesData.length > 0) {
          // Încercăm să găsim ruta specifică dacă avem interval_id
          let foundRoute = null;
          
          // Cazul 1: routeId este direct interval_id sau conține prefix interval_
          if (routeId) {
            const intervalIdToFind = routeId.includes("interval_") 
              ? routeId.replace("interval_", "") 
              : routeId;
            
            foundRoute = routesData.find(r => r.interval_id === intervalIdToFind);
          }
          
          // Cazul 2: routeId conține informații în format fromId-toId-intervalId
          if (!foundRoute && routeId && routeId.includes('-')) {
            const parts = routeId.split('-');
            if (parts.length >= 3) {
              const intervalIdFromUrl = parts[2];
              foundRoute = routesData.find(r => r.interval_id === intervalIdFromUrl);
            }
          }
          
          // Cazul 3: Dacă tot nu am găsit, folosim prima rută disponibilă
          if (!foundRoute) {
            foundRoute = routesData[0];
          }
            
          if (foundRoute) {
            console.log("Found route:", foundRoute);
            // Convertim RouteSummary în InfoBusRoute
            const mappedRoute: InfoBusRoute = {
              id: foundRoute.interval_id || '',
              from: foundRoute.point_from || '',
              to: foundRoute.point_to || '',
              departureTime: foundRoute.time_from || '',
              arrivalTime: foundRoute.time_to || '',
              duration: foundRoute.time_in_way || '',
              operator: foundRoute.carrier || 'Unknown Operator',
              price: {
                economy: parseFloat(foundRoute.price_one_way || '0'),
                premium: parseFloat(foundRoute.price_one_way || '0') * 1.3,
                business: parseFloat(foundRoute.price_one_way || '0') * 1.6,
              },
              amenities: foundRoute.comfort ? foundRoute.comfort.split(',') : [],
              free_seats: foundRoute.free_seats || [],
              request_get_free_seats: foundRoute.request_get_free_seats || 0,
              interval_id: foundRoute.interval_id,
              has_seat_plan: foundRoute.has_plan === 1
            };
            
            setRoute(mappedRoute);
          } else {
            setError("Route not found");
          }
        } else {
          setError("Route not found");
        }
      } catch (err) {
        setError("Failed to load route details");
        console.error("Error loading route:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [routeId]);

  // Load free seats data
  useEffect(() => {
    if (!route) return;

    if (route.request_get_free_seats === 0) {
      // Folosim free_seats direct din rută
      console.log("Using seats directly from route:", route.free_seats);
      setFreeSeats((route.free_seats || []).map(seat => typeof seat === 'object' ? seat : { seat_number: seat, seat_free: 1 }));
    } else if (route.request_get_free_seats === 1) {
      // Fetchuim de la API folosind funcția getFreeSeats
      setLoadingSeats(true);
      
      getFreeSeats({
        interval_id: route.interval_id || '',
        currency: 'EUR',
        lang: 'ru'
      })
        .then(data => {
          if (data && data.trips) {
            // Extragem locurile din răspuns
            let allSeats: Seat[] = [];
            data.trips.forEach((trip: any) => {
              if (Array.isArray(trip.free_seat)) {
                allSeats = [...allSeats, ...trip.free_seat];
              }
            });
            console.log("Fetched seats from API:", allSeats);
            setFreeSeats(allSeats);
          } else {
            console.error("Invalid response format from getFreeSeats:", data);
            setFreeSeats([]);
          }
        })
        .catch(error => {
          console.error("Error fetching free seats:", error);
          setFreeSeats([]);
        })
        .finally(() => setLoadingSeats(false));
    }
  }, [route]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">{t('tripDetails.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !route) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {error || t('tripDetails.error.routeNotFound')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Pentru a vizualiza detaliile unei rute, trebuie să specificați parametrii necesari în URL.
              <br className="hidden sm:block" />
              Format corect: <code className="bg-muted px-2 py-1 rounded text-sm">?fromId=123&toId=456&date=2025-09-11</code>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
                <Bus className="mr-2 h-4 w-4" />
                Pagina principală
              </Button>
              <Button variant="outline" onClick={() => navigate("/transport-routes")} className="w-full sm:w-auto">
                <MapPin className="mr-2 h-4 w-4" />
                {t('tripDetails.backToRoutes')}
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-foreground mb-2">Exemple de URL valide:</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="bg-muted p-2 rounded">
                  <code className="text-xs sm:text-sm break-all">/trip-details?fromId=123&toId=456&date=2025-09-11</code>
                </div>
                <div className="bg-muted p-2 rounded">
                  <code className="text-xs sm:text-sm break-all">/trip-details?routeId=123-456&date=2025-09-11</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total price based on selected fare type
  const { convertCurrency } = useLocalization();
  const totalPrice = route.price[selectedFare as keyof typeof route.price] * passengers;

  // Handle checkout navigation
  const handleContinueToCheckout = () => {
    if (!route) return;

    // Verificăm dacă toate locurile au fost selectate
    if (selectedSeats.length < passengers) {
      alert(t('tripDetails.pleaseSelectAllSeats'));
      setActiveTab("seats"); // Switch to the seats tab
      return;
    }

    // Create checkout URL with all necessary parameters
    const checkoutParams = new URLSearchParams({
      routeId: route.id,
      from: route.from,
      to: route.to,
      date: selectedDate,
      passengers: passengers.toString(),
      fareType: selectedFare,
      price: route.price[selectedFare as keyof typeof route.price].toString(),
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      duration: route.duration,
      operator: route.operator,
      seats: selectedSeats.join(',')
    });

    navigate(`/checkout?${checkoutParams.toString()}`);
  };

  // Callback când utilizatorul selectează locuri
  const handleSeatSelection = (seats: (string | number)[]) => {
    setSelectedSeats(seats);
  };

  const stops = [
    { city: route?.from, time: route?.departureTime, type: "departure" },
    { city: route?.to, time: route?.arrivalTime, type: "arrival" }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "usb": return <Zap className="h-4 w-4" />;
      case "wc": return <Bath className="h-4 w-4" />;
      case "ac": return <Snowflake className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {route.from} → {route.to}
              </h1>
              <p className="text-lg text-muted-foreground">
                {route.departureTime} - {route.arrivalTime} • {route.duration} • {t('tripDetails.dailyService')}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{route.operator}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-muted-foreground">(150+ {t('tripDetails.reviews')})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/search")}>
                {t('tripDetails.backToSearch')}
              </Button>
              <Button>
                {t('tripDetails.bookNow')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details" className="text-base">
                  {t('tripDetails.tripDetails')}
                </TabsTrigger>
                <TabsTrigger value="seats" className="text-base">
                  {t('tripDetails.seatSelection')}
                </TabsTrigger>
              </TabsList>

              {/* Trip Details Tab */}
              <TabsContent value="details" className="space-y-8">
                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t('tripDetails.journeyTimeline')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {stops.map((stop, index) => (
                        <div key={index} className="flex items-start gap-4">
                          {/* Time */}
                          <div className="w-20 text-right">
                            <div className="font-semibold text-foreground">{stop.time}</div>
                          </div>

                          {/* Timeline Line */}
                          <div className="relative">
                            <div className={cn(
                              "w-3 h-3 rounded-full border-2",
                              stop.type === "departure" && "bg-primary border-primary",
                              stop.type === "stop" && "bg-muted border-muted",
                              stop.type === "arrival" && "bg-success border-success"
                            )} />
                            {index < stops.length - 1 && (
                              <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-muted" />
                            )}
                          </div>

                          {/* Stop Info */}
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{stop.city}</div>
                            <div className="text-sm text-muted-foreground">
                              {stop.type === "departure" && t('tripDetails.departure')}
                              {stop.type === "stop" && "Stop"}
                              {stop.type === "arrival" && t('tripDetails.arrival')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Map Placeholder */}
                    <div className="mt-8 p-6 bg-muted rounded-lg text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t('tripDetails.interactiveMapComingSoon')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Fare Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {t('tripDetails.fareRulesPolicies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="baggage">
                        <AccordionTrigger>{t('tripDetails.baggageAllowance')}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>{t('tripDetails.handLuggage')}</span>
                              <Badge variant="outline">1 piece (max 10kg)</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{t('tripDetails.checkedBaggage')}</span>
                              <Badge variant="outline">1 piece (max 20kg)</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{t('tripDetails.oversizedItems')}</span>
                              <Badge variant="outline">{formatPrice(15, undefined, 'EUR')} {t('tripDetails.extra')}</Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="changes">
                        <AccordionTrigger>{t('tripDetails.changesCancellations')}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>{t('tripDetails.freeChanges')}</span>
                              <Badge variant="outline">{t('tripDetails.upTo2HoursBefore')}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{t('tripDetails.cancellationFee')}</span>
                              <Badge variant="outline">{formatPrice(10, undefined, 'EUR')} ({t('tripDetails.before24h')}) / {formatPrice(25, undefined, 'EUR')} ({t('tripDetails.sameDay')})</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{t('tripDetails.noShow')}</span>
                              <Badge variant="outline">100% {t('tripDetails.ofFare')}</Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="refunds">
                        <AccordionTrigger>{t('tripDetails.refundPolicy')}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Full refund</span>
                              <Badge variant="outline">48h before departure</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Partial refund</span>
                              <Badge variant="outline">24h before departure</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Processing time</span>
                              <Badge variant="outline">5-7 business days</Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Onboard Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {route?.amenities?.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          {getAmenityIcon(amenity)}
                          <span className="font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Operator Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="h-5 w-5" />
                      About {route?.operator}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {route?.operator} is a premium bus operator known for comfortable travel experiences 
                        and excellent customer service. All our buses are equipped with modern amenities 
                        and maintained to the highest safety standards.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">4.8</div>
                          <div className="text-sm text-muted-foreground">Customer Rating</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">98%</div>
                          <div className="text-sm text-muted-foreground">On-time Performance</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Seat Selection Tab */}
              <TabsContent value="seats" className="space-y-8">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t('tripDetails.seatSelection')}
                      </CardTitle>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="py-1">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {route.departureTime}
                        </Badge>
                        <Badge variant="outline" className="py-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {route.from} → {route.to}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {t('tripDetails.selectYourPreferredSeats')}. {route.request_get_free_seats === 1 
                        ? t('tripDetails.seatPricesMayVary') 
                        : t('tripDetails.standardPricing')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSeats ? (
                      <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-lg text-muted-foreground mb-2">{t('tripDetails.loadingSeats')}</p>
                        <p className="text-sm text-muted-foreground">{t('tripDetails.thisWillTakeAMoment')}</p>
                      </div>
                    ) : freeSeats.length > 0 ? (
                      <SeatSelection 
                        freeSeats={freeSeats}
                        passengerCount={passengers}
                        onSelectionChange={handleSeatSelection}
                        hasPlan={route?.has_seat_plan || false}
                      />
                    ) : (
                      <div className="py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t('tripDetails.noSeatsAvailable.title')}</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                          {t('tripDetails.noSeatsAvailable.description')}
                        </p>
                        <Button variant="outline" onClick={() => navigate('/search')}>
                          {t('tripDetails.searchAlternativeRoutes')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {freeSeats.length > 0 && (
                    <div className="px-6 pb-6 pt-2">
                      <Separator className="mb-6" />
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-1">{t('tripDetails.seatSelectionInfo')}</p>
                          <p>{t('tripDetails.minMaxSeats')}</p>
                        </div>
                        <Button 
                          onClick={() => selectedSeats.length === passengers 
                            ? handleContinueToCheckout() 
                            : setActiveTab('details')}
                          variant={selectedSeats.length === passengers ? "default" : "outline"}
                        >
                          {selectedSeats.length === passengers 
                            ? t('tripDetails.continueToCheckout')
                            : t('tripDetails.backToDetails')}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Fare Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{t('tripDetails.selectYourFare')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fare Types */}
                  <div className="space-y-3">
                    {[
                      { key: 'economy', name: 'Economy', price: route.price.economy, features: [t('tripDetails.standardSeat'), t('tripDetails.handLuggage'), t('tripDetails.basicAmenities')] },
                      { key: 'premium', name: 'Premium', price: route.price.premium, features: [t('tripDetails.premiumSeat'), t('tripDetails.extraLegroom'), t('tripDetails.priorityBoarding'), t('tripDetails.refreshments')] },
                      { key: 'business', name: 'Business', price: route.price.business, features: [t('tripDetails.businessSeat'), t('tripDetails.maximumComfort'), t('tripDetails.premiumAmenities'), t('tripDetails.flexibleChanges')] }
                    ].map((fare) => (
                      <div
                        key={fare.key}
                        className={cn(
                          "p-4 border-2 rounded-lg cursor-pointer transition-all",
                          selectedFare === fare.key
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedFare(fare.key)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-foreground">{fare.name}</div>
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(fare.price, undefined, 'EUR')}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {fare.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{t('tripDetails.flexible')}</Badge>
                          <Badge variant="secondary" className="text-xs">{t('tripDetails.changeable')}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Passengers */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('tripDetails.numberOfPassengers')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        disabled={passengers <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">{passengers}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPassengers(passengers + 1)}
                        disabled={passengers >= 9}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Seats Selected */}
                  {selectedSeats.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="font-medium text-foreground">{t('tripDetails.seatsSelected')}</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSeats.map(seat => (
                            <Badge key={seat} variant="secondary">{seat}</Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Total */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tripDetails.farePerPerson')}</span>
                      <span>{formatPrice(route?.price[selectedFare as keyof typeof route.price] || 0, undefined, 'EUR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tripDetails.numberOfPassengers')}</span>
                      <span>{passengers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tripDetails.serviceFee')}</span>
                      <span>{formatPrice(2.50, undefined, 'EUR')}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>{t('tripDetails.total')}</span>
                      <span className="text-primary">{formatPrice((route?.price[selectedFare as keyof typeof route.price] || 0) * passengers + 2.50, undefined, 'EUR')}</span>
                    </div>
                  </div>

                  {/* Seat Selection Status */}
                  {selectedSeats.length < passengers && route?.request_get_free_seats !== undefined && (
                    <Alert className="mb-4">
                      <AlertTitle>{t('tripDetails.seatSelectionRequired')}</AlertTitle>
                      <AlertDescription>
                        {t('tripDetails.pleaseSelect')} {passengers} {t('tripDetails.seatsToBook')}. {t('tripDetails.youSelected')} {selectedSeats.length}.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* CTA */}
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleContinueToCheckout}
                    disabled={selectedSeats.length < passengers && route?.request_get_free_seats !== undefined}
                  >
                    {selectedSeats.length < passengers && route?.request_get_free_seats !== undefined
                      ? `${t('tripDetails.selectSeats')} (${selectedSeats.length}/${passengers})`
                      : t('tripDetails.continueToCheckout')
                    }
                  </Button>

                  {/* Security Info */}
                  <div className="text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-3 w-3" />
                      {t('tripDetails.securePayment')}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {t('tripDetails.multiplePaymentMethods')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
