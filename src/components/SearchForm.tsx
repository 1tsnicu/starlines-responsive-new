import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/contexts/LocalizationContext";
import { BussystemAutocomplete } from "@/components/BussystemAutocomplete";
import { BussPoint } from "@/lib/bussystem";

// Define the search params interface
export interface SearchFormParams {
  fromPointId?: string;
  toPointId?: string;
  date?: string;
  passengers?: string;
  baggage?: string;
  returnDate?: string;
}

// Define props interface
interface SearchFormProps {
  onSearch?: (params: SearchFormParams) => void;
  showResults?: boolean;
}

const SearchForm = ({ onSearch, showResults }: SearchFormProps = {}) => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromPoint, setFromPoint] = useState<BussPoint | null>(null);
  const [toPoint, setToPoint] = useState<BussPoint | null>(null);
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  // Removed passenger and baggage state - using defaults
  const passengers = "1";
  const baggage = "1";
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const handleSwapCities = () => {
    const tempCity = fromCity;
    const tempPoint = fromPoint;
    setFromCity(toCity);
    setFromPoint(toPoint);
    setToCity(tempCity);
    setToPoint(tempPoint);
  };

  const handleFromPointSelect = (point: BussPoint) => {
    setFromPoint(point);
    setFromCity(point.point_ru_name || point.point_latin_name || point.point_name || '');
  };

  const handleToPointSelect = (point: BussPoint) => {
    setToPoint(point);
    setToCity(point.point_ru_name || point.point_latin_name || point.point_name || '');
  };

  const handleSearch = () => {
    if (!fromCity.trim() || !toCity.trim() || !departureDate) {
      return; // Could add validation feedback here
    }

    const searchParams = {
      fromPointId: fromPoint?.point_id,
      toPointId: toPoint?.point_id,
      date: format(departureDate, "yyyy-MM-dd"),
      passengers: passengers,
      baggage: baggage,
      ...(isRoundTrip && returnDate && { returnDate: format(returnDate, "yyyy-MM-dd") })
    };

    // If onSearch callback is provided, use it
    if (onSearch) {
      onSearch(searchParams);
      return;
    }

    // Otherwise use default navigation behavior
    const urlSearchParams = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date: format(departureDate, "yyyy-MM-dd"),
      passengers: passengers,
      baggage: baggage
    });

    // Add point IDs if available for integration with Bussystem API
    if (fromPoint?.point_id) {
      urlSearchParams.append("fromPointId", fromPoint.point_id);
    }
    if (toPoint?.point_id) {
      urlSearchParams.append("toPointId", toPoint.point_id);
    }

    if (isRoundTrip && returnDate) {
      urlSearchParams.append("returnDate", format(returnDate, "yyyy-MM-dd"));
    }

    navigate(`/search?${urlSearchParams.toString()}`);
  };

  const quickRoutes = [
    { from: "Chișinău", to: "București" },
    { from: "Chișinău", to: "Istanbul" },
    { from: "Chișinău", to: "Moscow" },
    { from: "Chișinău", to: "Kiev" },
  ];

  const handleQuickRoute = (route: { from: string; to: string }) => {
    setFromCity(route.from);
    setToCity(route.to);
    // Reset the selected points when using quick routes
    setFromPoint(null);
    setToPoint(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-8 md:p-10 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16 overflow-hidden"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-y-12 -translate-x-12 overflow-hidden"></div>
        
        {/* Content with relative positioning */}
        <div className="relative z-10">
        {/* Trip Type Toggle */}
        <div className="flex items-center gap-1 mb-6 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-lg w-fit">
          <button
            onClick={() => setIsRoundTrip(false)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
              !isRoundTrip
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            Dus
          </button>
          <button
            onClick={() => setIsRoundTrip(true)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
              isRoundTrip
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            Dus-întors
          </button>
        </div>

        {/* Quick Routes Chips */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white text-sm font-medium">Rute Populare</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickRoutes.map((route, index) => (
              <button
                key={index}
                className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105"
                onClick={() => handleQuickRoute(route)}
              >
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Location Selection Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* From City */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm font-medium">De unde</span>
              </div>
              <div className="relative z-[100]">
                <BussystemAutocomplete
                  placeholder="Orașul de plecare"
                  value={fromCity}
                  onSelect={handleFromPointSelect}
                  lang="ru"
                  trans="bus"
                  showCountry={true}
                  showDetails={false}
                  minLength={1}
                  className="w-full h-12 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-2 flex justify-center order-first lg:order-none">
              <button
                type="button"
                onClick={handleSwapCities}
                className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110 group flex items-center justify-center"
                title="Schimbă orașele"
              >
                <ArrowLeftRight className="h-4 w-4 lg:h-5 lg:w-5 text-white group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* To City */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-white text-sm font-medium">Unde</span>
              </div>
              <div className="relative z-[100]">
                <BussystemAutocomplete
                  placeholder="Orașul de destinație"
                  value={toCity}
                  onSelect={handleToPointSelect}
                  lang="ru"
                  trans="bus"
                  showCountry={true}
                  showDetails={false}
                  minLength={1}
                  className="w-full h-12 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>

          {/* Date and Search Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Departure Date */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white text-sm font-medium">Data plecării</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start text-left font-medium bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700"
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-blue-500" />
                    <span>
                      {departureDate ? format(departureDate, "dd MMM yyyy", { locale: undefined }) : "Selectează data"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl z-[9998]" align="start" style={{ zIndex: 9998 }}>
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date (if round trip) */}
            {isRoundTrip && (
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-sm font-medium">Data întoarcerii</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-medium bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700"
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-purple-500" />
                      <span>
                        {returnDate ? format(returnDate, "dd MMM yyyy", { locale: undefined }) : "Selectează data"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl z-[9998]" align="start" style={{ zIndex: 9998 }}>
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      disabled={(date) => date < (departureDate || new Date())}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Search Button */}
            <div className={cn("lg:col-span-4", isRoundTrip ? "" : "lg:col-start-9")}>
              <Button 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                size="lg"
                onClick={handleSearch}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Caută Bilete
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </span>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;