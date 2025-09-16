import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, SortAsc, SortDesc, Clock, MapPin, Star, Wifi, Zap, Bath, Snowflake, X, Bus, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useRouteSearch, RouteSummary } from "@/lib/bussystem";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";
import { BaggageSelection } from "@/components/BaggageSelection";

const SearchResults = () => {
  const { t, formatPrice } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get search parameters
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = searchParams.get("passengers") || "1";
  const fromPointId = searchParams.get("fromPointId") || "";
  const toPointId = searchParams.get("toPointId") || "";

  // Check if this is a round trip search
  const isRoundTrip = !!returnDate;

  // State pentru gestionarea bagajelor
  const [selectedRoute, setSelectedRoute] = useState<RouteSummary | null>(null);
  const [showBaggageSelection, setShowBaggageSelection] = useState(false);
  
  // State pentru dus-întors (nu mai este necesar pentru selecție separată)

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
  
  // Use the real API hook for outbound routes
  const { data: routes, loading, error } = useRouteSearch({
    id_from: fromPointId,
    id_to: toPointId,
    date: date,
    trans: "bus",
    currency: "EUR",
    lang: "ru"
  });

  // Nu mai este necesar hook-ul pentru return routes separate

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

  const handleSelectRoute = (route: RouteSummary) => {
    // Pentru dus-întors, navighează direct la TripDetail cu o singură rută
    if (isRoundTrip) {
      // Pentru dus-întors, trimitem intervalIdsAll cu două intervale
      // Primul interval pentru dus, al doilea pentru întors (va fi încărcat din API)
      const intervalIdsAll = [route.interval_id, `return_${route.interval_id}`];
      
      // Navighează la TripDetail cu ruta dus-întors
      navigate('/trip-details', {
        state: {
          routeData: route,
          passengers: parseInt(passengers),
          isRoundTrip: true,
          intervalIdsAll: intervalIdsAll,
          searchContext: {
            from,
            to,
            date,
            returnDate,
            fromPointId,
            toPointId,
            currency: 'EUR',
            lang: 'ru'
          }
        }
      });
    } else {
      // Pentru călătorie simplă, gestionează bagajele dacă este necesar
    if (route.request_get_baggage === 1) {
      setSelectedRoute(route);
      setShowBaggageSelection(true);
    } else {
        // Navighează direct la detaliile călătoriei cu datele rutei în state
        navigate('/trip-details', {
          state: {
            routeData: route,
            passengers: parseInt(passengers),
            searchContext: {
              from,
              to,
              date,
              fromPointId,
              toPointId,
              currency: 'EUR',
              lang: 'ru'
            }
          }
        });
      }
    }
  };

  const handleContinueWithBaggage = (baggageData?: any) => {
    if (!selectedRoute) return;
    
    // Navighează la detaliile călătoriei cu datele rutei și bagajele în state
    navigate('/trip-details', {
      state: {
        routeData: selectedRoute,
        passengers: parseInt(passengers),
        baggageData: baggageData,
        searchContext: {
          from,
          to,
          date,
          fromPointId,
          toPointId,
          currency: 'EUR',
          lang: 'ru'
        }
      }
    });
    
    setShowBaggageSelection(false);
    setSelectedRoute(null);
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

  // Helper function to convert time string to minutes from midnight
  const timeToMinutes = (timeStr: string | undefined): number => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const [hours, minutes] = parts.map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Helper function to parse duration "HH:MM" format to minutes
  const durationToMinutes = (duration: string | undefined): number => {
    if (!duration || typeof duration !== 'string') return 0;
    const parts = duration.split(':');
    if (parts.length < 2) return 0;
    const [hours, minutes] = parts.map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Helper function to parse comfort string to amenities array
  const parseAmenities = (comfort?: string): string[] => {
    if (!comfort) return [];
    return comfort.split(',').map(item => item.trim());
  };

  const filteredResults = routes.filter(route => {
    // Skip routes with missing essential data
    if (!route || !route.time_from) {
      return false;
    }

    // Filter by departure time
    const departureMinutes = timeToMinutes(route.time_from);
    const departureHour = Math.floor(departureMinutes / 60);
    if (departureHour < filters.departureTime[0] || departureHour > filters.departureTime[1]) return false;

    // Filter by duration
    const routeDurationMinutes = durationToMinutes(route.time_in_way || "0:00");
    const routeDurationHours = routeDurationMinutes / 60;
    if (routeDurationHours < filters.duration[0] || routeDurationHours > filters.duration[1]) return false;

    // Filter by price
    const price = parseFloat(route.price_one_way || "0");
    if (price < filters.price[0] || price > filters.price[1]) return false;

    // Filter by amenities
    if (filters.amenities.length > 0) {
      const routeAmenities = parseAmenities(route.comfort);
      const hasAllAmenities = filters.amenities.every(amenity => 
        routeAmenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    // Filter by operator
    if (filters.operator !== "all" && route.carrier !== filters.operator) return false;

    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price_one_way || "0") - parseFloat(b.price_one_way || "0");
      case "price-high":
        return parseFloat(b.price_one_way || "0") - parseFloat(a.price_one_way || "0");
      case "duration":
        return durationToMinutes(a.time_in_way || "0:00") - durationToMinutes(b.time_in_way || "0:00");
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      default:
        return 0;
    }
  });

  const FilterSidebar = () => (
    <div className="space-y-6 p-6 bg-white border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t('search.filters')}</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFilters(false)}
          className="xl:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Departure Time */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">{t('search.departureTime')}</h3>
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
        <h3 className="font-semibold text-foreground mb-3">{t('search.duration')}</h3>
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
        <h3 className="font-semibold text-foreground mb-3">{t('search.price')}</h3>
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
            <span>{formatPrice(filters.price[0], undefined, 'EUR')}</span>
            <span>{formatPrice(filters.price[1], undefined, 'EUR')}</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">{t('search.amenities')}</h3>
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
        <h3 className="font-semibold text-foreground mb-3">{t('search.operator')}</h3>
        <Select value={filters.operator} onValueChange={(value) => handleFilterChange("operator", value)}>
          <SelectTrigger>
            <SelectValue placeholder={t('search.allOperators')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allOperators')}</SelectItem>
            <SelectItem value="Starlines Express">Starlines Express</SelectItem>
            <SelectItem value="Starlines Premium">Starlines Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stops */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">{t('search.stops')}</h3>
        <div className="space-y-2">
          {[
            { value: "any", label: t('search.anyStops') },
            { value: "direct", label: t('search.directOnly') },
            { value: "max1", label: t('search.max1Stop') }
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
        {t('search.resetFilters')}
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
                {date} • {passengers} {parseInt(passengers) === 1 ? t('search.passenger') : t('search.passengers')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('search.filters')}
                    {filters.amenities.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.amenities.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>{t('search.filters')}</SheetTitle>
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
                  <SelectItem value="recommended">{t('search.recommended')}</SelectItem>
                  <SelectItem value="price-low">{t('search.priceLowToHigh')}</SelectItem>
                  <SelectItem value="price-high">{t('search.priceHighToLow')}</SelectItem>
                  <SelectItem value="duration">{t('search.duration')}</SelectItem>
                  <SelectItem value="rating">{t('search.rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden xl:block">
            <FilterSidebar />
          </div>

          {/* Results */}
          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-foreground/70">
                {sortedResults.length} {sortedResults.length === 1 ? t('search.routeFound') : t('search.routesFound')}
              </p>
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="xl:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {error ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Eroare la căutarea rutelor
                </h3>
                <p className="text-foreground/70 mb-4">
                  {error}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Încearcă din nou
                </Button>
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('search.noRoutesFound')}
                </h3>
                <p className="text-foreground/70 mb-4">
                  {t('search.tryAdjusting')}
                </p>
                <Button onClick={() => setFilters({
                  departureTime: [0, 24],
                  duration: [0, 30],
                  price: [0, 200],
                  amenities: [],
                  operator: "all",
                  stops: "any"
                })}>
                  {t('search.resetFilters')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header pentru dus-întors */}
                {isRoundTrip && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-blue-900">Călătorie Dus-Întors</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      Alegeți ruta dus-întors. Locurile pentru dus și întors se vor selecta în pagina următoare.
                    </p>
                  </div>
                )}

                {/* Rutele dus-întors */}
                {sortedResults.map((route) => (
                  <Card key={route.interval_id} className="hover-lift border-border">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Route Info */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-2xl font-bold text-primary">
                              {route.time_from}
                            </div>
                            <div className="flex-1">
                              <div className="w-full h-0.5 bg-muted relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Bus className="w-4 h-4 bg-background text-primary" />
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {route.time_to}
                            </div>
                          </div>
                          <div className="text-sm text-foreground/70 text-center">
                            {route.time_in_way || 'N/A'} • {route.route_name}
                          </div>
                        </div>

                        {/* Route Details */}
                        <div className="lg:col-span-4">
                          <h3 className="font-semibold text-foreground mb-1">
                            {route.point_from} → {route.point_to}
                          </h3>
                          <div className="flex items-center gap-2 lg:gap-4 text-sm text-foreground/70 flex-wrap">
                            <span>{route.carrier || 'N/A'}</span>
                            {route.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                <span>{route.rating}</span>
                                {route.reviews && <span>({route.reviews})</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {route.trans === 'bus' ? 'Autobus' : route.trans}
                            </Badge>
                            {route.date_from !== route.date_to && (
                              <Badge variant="secondary" className="text-xs">
                                Peste noapte
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {parseAmenities(route.comfort).slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {getAmenityIcon(amenity)}
                                <span className="ml-1">{amenity}</span>
                              </Badge>
                            ))}
                            {parseAmenities(route.comfort).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{parseAmenities(route.comfort).length - 3}
                              </Badge>
                            )}
                            {route.request_get_baggage === 1 && (
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Luggage className="h-3 w-3 mr-1" />
                                Bagaje disponibile
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="lg:col-span-2 text-right">
                          <div className="mb-2">
                            <span className="text-xs text-foreground/70">de la</span>
                            <div className="text-xl lg:text-2xl font-bold text-primary">
                              {formatPrice(parseFloat(route.price_one_way || "0"), undefined, route.currency || 'EUR')}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full text-xs lg:text-sm"
                            onClick={() => handleSelectRoute(route)}
                          >
                            {isRoundTrip ? 
                              (route.request_get_baggage === 1 ? 'Selectează Dus-Întors & Bagaje' : 'Selectează Dus-Întors') :
                              (route.request_get_baggage === 1 ? 'Selectează & Bagaje' : 'Selectează')
                            }
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

      {/* Dialog pentru selecția bagajelor */}
      <Dialog open={showBaggageSelection} onOpenChange={setShowBaggageSelection}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Selectează bagajele pentru {selectedRoute?.point_from} → {selectedRoute?.point_to}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <BaggageSelection
              intervalId={selectedRoute.interval_id}
              stationFromId={selectedRoute.station_from}
              stationToId={selectedRoute.station_to}
              currency={selectedRoute.currency as any || 'EUR'}
              passengerCount={parseInt(passengers)}
              onPayloadReady={(payload) => {
                console.log('Baggage payload ready:', payload);
                handleContinueWithBaggage(payload);
              }}
            />
          )}
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBaggageSelection(false);
                setSelectedRoute(null);
              }}
            >
              Anulează
            </Button>
            <Button onClick={() => handleContinueWithBaggage()}>
              Continuă fără bagaje
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchResults;
