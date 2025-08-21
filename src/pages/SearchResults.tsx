import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, SortAsc, SortDesc, Clock, MapPin, Star, Wifi, Zap, Bath, Snowflake, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { searchRoutes, Route } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departureTime: [0, 24],
    duration: [0, 30],
    price: [0, 200],
    amenities: [] as string[],
    operator: "all",
    stops: "any"
  });
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchRoutes(from, to, date, parseInt(passengers));
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [from, to, date, passengers]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSelectRoute = (route: Route) => {
    const searchParams = new URLSearchParams({
      routeId: route.id,
      fareId: "1", // Default to first fare type
      passengers: passengers
    });
    navigate(`/checkout?${searchParams.toString()}`);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "usb": return <Zap className="h-4 w-4" />;
      case "wc": return <Bath className="h-4 w-4" />;
      case "ac": return <Snowflake className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  // Helper function to convert duration string to minutes
  const durationToMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)h\s*(\d+)?m?/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  const filteredResults = results.filter(route => {
    // Filter by amenities
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        route.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    // Filter by operator
    if (filters.operator !== "all" && route.operator !== filters.operator) return false;

    // Filter by stops
    if (filters.stops === "direct" && route.stops > 0) return false;
    if (filters.stops === "max1" && route.stops > 1) return false;

    // Filter by price
    if (route.price < filters.price[0] || route.price > filters.price[1]) return false;

    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "duration":
        return durationToMinutes(a.duration) - durationToMinutes(b.duration);
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const FilterSidebar = () => (
    <div className="space-y-6 p-6 bg-white border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFilters(false)}
          className="md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Departure Time */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Departure Time</h3>
        <div className="px-2">
          <Slider
            value={filters.departureTime}
            onValueChange={(value) => handleFilterChange("departureTime", value)}
            max={24}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-foreground mt-2">
            <span>{filters.departureTime[0]}:00</span>
            <span>{filters.departureTime[1]}:00</span>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Duration (hours)</h3>
        <div className="px-2">
          <Slider
            value={filters.duration}
            onValueChange={(value) => handleFilterChange("duration", value)}
            max={30}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-foreground mt-2">
            <span>{filters.duration[0]}h</span>
            <span>{filters.duration[1]}h</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Price (€)</h3>
        <div className="px-2">
          <Slider
            value={filters.price}
            onValueChange={(value) => handleFilterChange("price", value)}
            max={200}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-foreground mt-2">
            <span>€{filters.price[0]}</span>
            <span>€{filters.price[1]}</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Amenities</h3>
        <div className="space-y-2">
          {["WiFi", "USB", "WC", "AC", "Entertainment"].map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => handleAmenityToggle(amenity)}
              />
              <label htmlFor={amenity} className="text-sm text-foreground cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Operator */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Operator</h3>
        <Select value={filters.operator} onValueChange={(value) => handleFilterChange("operator", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All operators" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All operators</SelectItem>
            <SelectItem value="Starlines Express">Starlines Express</SelectItem>
            <SelectItem value="Starlines Premium">Starlines Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stops */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Stops</h3>
        <div className="space-y-2">
          {[
            { value: "any", label: "Any number of stops" },
            { value: "direct", label: "Direct routes only" },
            { value: "max1", label: "Max 1 stop" }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.stops === option.value}
                onCheckedChange={() => handleFilterChange("stops", option.value)}
              />
              <label htmlFor={option.value} className="text-sm text-foreground cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Filters */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setFilters({
          departureTime: [0, 24],
          duration: [0, 30],
          price: [0, 200],
          amenities: [],
          operator: "all",
          stops: "any"
        })}
      >
        Reset Filters
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {from} → {to}
              </h1>
              <p className="text-foreground/70">
                {date} • {passengers} {parseInt(passengers) === 1 ? "passenger" : "passengers"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {filters.amenities.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.amenities.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-foreground/70">
                {sortedResults.length} {sortedResults.length === 1 ? "route" : "routes"} found
              </p>
            </div>

            {sortedResults.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No routes found
                </h3>
                <p className="text-foreground/70 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={() => setFilters({
                  departureTime: [0, 24],
                  duration: [0, 30],
                  price: [0, 200],
                  amenities: [],
                  operator: "all",
                  stops: "any"
                })}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedResults.map((route) => (
                  <Card key={route.id} className="hover-lift border-border">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Route Info */}
                        <div className="md:col-span-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-2xl font-bold text-primary">
                              {route.departureTime}
                            </div>
                            <div className="flex-1">
                              <div className="w-full h-0.5 bg-muted relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {route.arrivalTime}
                            </div>
                          </div>
                          <div className="text-sm text-foreground/70 text-center">
                            {route.duration} • {route.stops} {route.stops === 1 ? "stop" : "stops"}
                          </div>
                        </div>

                        {/* Route Details */}
                        <div className="md:col-span-4">
                          <h3 className="font-semibold text-foreground mb-1">
                            {route.from.name} → {route.to.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-foreground/70">
                            <span>{route.operator}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-warning fill-warning" />
                              <span>{route.rating}</span>
                              <span>({route.reviews})</span>
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="md:col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {route.amenities.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {getAmenityIcon(amenity)}
                                <span className="ml-1">{amenity}</span>
                              </Badge>
                            ))}
                            {route.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{route.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="md:col-span-2 text-right">
                          <div className="mb-2">
                            <span className="text-xs text-foreground/70">From</span>
                            <div className="text-2xl font-bold text-primary">
                              €{route.price}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleSelectRoute(route)}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
