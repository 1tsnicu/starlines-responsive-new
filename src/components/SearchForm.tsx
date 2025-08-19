import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SearchForm = () => {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
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
            One Way
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
            Round Trip
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* From City */}
          <div className="lg:col-span-3 space-y-2">
            <Label htmlFor="from" className="text-sm font-medium">
              From
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="from"
                placeholder="Departure city"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSwapCities}
              className="h-10 w-10 rounded-full border border-border hover:bg-muted"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          {/* To City */}
          <div className="lg:col-span-3 space-y-2">
            <Label htmlFor="to" className="text-sm font-medium">
              To
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="to"
                placeholder="Destination city"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="lg:col-span-2 space-y-2">
            <Label className="text-sm font-medium">
              Departure
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PPP") : "Select date"}
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
            <div className="lg:col-span-2 space-y-2">
              <Label className="text-sm font-medium">
                Return
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : "Select date"}
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
          <div className={cn("space-y-2", isRoundTrip ? "lg:col-span-1" : "lg:col-span-2")}>
            <Label className="text-sm font-medium">
              Passengers
            </Label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Passenger" : "Passengers"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className={cn("", isRoundTrip ? "lg:col-span-1" : "lg:col-span-1")}>
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
              size="lg"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;