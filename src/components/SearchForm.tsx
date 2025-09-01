import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Users, Briefcase } from "lucide-react";
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
  const [passengers, setPassengers] = useState("1");
  const [baggage, setBaggage] = useState("1");
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
        {/* Trip Type Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsRoundTrip(false)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              !isRoundTrip
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t('search.oneWay')}
          </button>
          <button
            onClick={() => setIsRoundTrip(true)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              isRoundTrip
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t('search.roundTrip')}
          </button>
        </div>

        {/* Quick Routes Chips */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            {t('search.popularRoutes')}
          </Label>
          <div className="flex flex-wrap gap-2">
            {quickRoutes.map((route, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleQuickRoute(route)}
              >
                {route.from} → {route.to}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* From City */}
          <div className="lg:col-span-4 space-y-2">
            <Label htmlFor="from" className="text-sm font-medium">
              {t('search.from')}
            </Label>
            <BussystemAutocomplete
              placeholder={t('search.fromPlaceholder')}
              value={fromCity}
              onSelect={handleFromPointSelect}
              className="w-full"
            />
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSwapCities}
              className="h-10 w-10 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 hover:scale-110 bg-white"
              title={t('search.swapCities')}
              style={{ color: '#0B1220' }}
            >
              <ArrowLeftRight className="h-4 w-4" style={{ color: '#0B1220' }} />
            </Button>
          </div>

          {/* To City */}
          <div className="lg:col-span-4 space-y-2">
            <Label htmlFor="to" className="text-sm font-medium">
              {t('search.to')}
            </Label>
            <BussystemAutocomplete
              placeholder={t('search.toPlaceholder')}
              value={toCity}
              onSelect={handleToPointSelect}
              className="w-full"
            />
          </div>

          {/* Departure Date */}
          <div className="lg:col-span-3 space-y-2">
            <Label className="text-sm font-medium">
              {t('search.departure')}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal text-black",
                    !departureDate && "text-gray-500"
                  )}
                  style={{ color: departureDate ? '#0B1220' : '#6B7280' }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PPP") : t('search.selectDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Return Date (if round trip) */}
          {isRoundTrip && (
            <div className="lg:col-span-3 space-y-2">
              <Label className="text-sm font-medium">
                {t('search.return')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal text-black",
                      !returnDate && "text-gray-500"
                    )}
                    style={{ color: returnDate ? '#0B1220' : '#6B7280' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : t('search.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (departureDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Passengers */}
          <div className={cn("space-y-2", isRoundTrip ? "lg:col-span-2" : "lg:col-span-3")}>
            <Label className="text-sm font-medium">
              {t('search.passengers')}
            </Label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger className="h-12 text-black" style={{ color: '#0B1220' }}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? t('search.passenger') : t('search.passengers')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Baggage */}
          <div className={cn("space-y-2", isRoundTrip ? "lg:col-span-2" : "lg:col-span-3")}>
            <Label className="text-sm font-medium">
              {t('search.baggage')}
            </Label>
            <Select value={baggage} onValueChange={setBaggage}>
              <SelectTrigger className="h-12 text-black" style={{ color: '#0B1220' }}>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? t('search.bag') : t('search.bags')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className={cn("", isRoundTrip ? "lg:col-span-2" : "lg:col-span-2")}>
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
              size="lg"
              onClick={handleSearch}
            >
              {t('search.searchTickets')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;