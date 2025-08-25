import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Route,
  Map,
  List,
  Filter,
  Search,
  MapPin,
  Clock,
  Star,
  Users,
  Wifi,
  Zap,
  Bath,
  Coffee,
  Bus,
  Eye,
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import { useLocalization } from "@/contexts/LocalizationContext";
import { infoBusAPI, InfoBusRoute } from "@/lib/mock-data";

const TransportRoutes: React.FC = () => {
  const { t, formatPrice } = useLocalization();
  const navigate = useNavigate();
  
  // State for UI
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromCity, setFromCity] = useState("all");
  const [toCity, setToCity] = useState("all");
  const [operator, setOperator] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("departure");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State for data
  const [routes, setRoutes] = useState<InfoBusRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<InfoBusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for advanced filters dialog
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [maxStops, setMaxStops] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Load routes data on component mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await infoBusAPI.getVisibleRoutes();
        setRoutes(data);
      } catch (err) {
        setError("Failed to load routes. Please try again later.");
        console.error("Error loading routes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // Filter and sort routes
  useEffect(() => {
    let filtered = [...routes];
    
    // Text search
    if (searchTerm) {
      filtered = filtered.filter(route => 
        route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.operator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // City filters
    if (fromCity !== "all") {
      filtered = filtered.filter(route => route.from === fromCity);
    }
    
    if (toCity !== "all") {
      filtered = filtered.filter(route => route.to === toCity);
    }
    
    // Operator filter
    if (operator !== "all") {
      filtered = filtered.filter(route => route.operator === operator);
    }
    
    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      if (max) {
        filtered = filtered.filter(route => route.price.economy >= min && route.price.economy <= max);
      } else {
        filtered = filtered.filter(route => route.price.economy >= min);
      }
    }
    
    // Advanced filters
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(route => 
        selectedAmenities.every(amenity => route.amenities.includes(amenity))
      );
    }
    
    if (ratingFilter !== "all") {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(route => route.price.economy >= minRating);
    }
    
    // Sort routes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price.economy - b.price.economy;
        case "duration":
          return parseInt(a.duration) - parseInt(b.duration);
        case "rating":
          return b.price.economy - a.price.economy; // Using price as mock rating
        case "departure":
        default:
          return a.departureTime.localeCompare(b.departureTime);
      }
    });
    
    setFilteredRoutes(filtered);
  }, [routes, searchTerm, fromCity, toCity, operator, priceRange, sortBy, selectedAmenities, ratingFilter]);

  // Helper functions
  const getCities = () => {
    const cities = [...new Set([...routes.map(r => r.from), ...routes.map(r => r.to)])];
    return cities.sort();
  };

  const getOperators = () => {
    const operators = [...new Set(routes.map(r => r.operator))];
    return operators.sort();
  };

  const getAllAmenities = () => {
    const amenities = [...new Set(routes.flatMap(r => r.amenities))];
    return amenities.sort();
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="h-3 w-3" />;
      case "usb charging": return <Zap className="h-3 w-3" />;
      case "wc": return <Bath className="h-3 w-3" />;
      case "refreshments": return <Coffee className="h-3 w-3" />;
      case "entertainment": return <TrendingUp className="h-3 w-3" />;
      case "ac": return <Star className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const formatDuration = (duration: string) => duration.replace('h', 'h ');
  const formatTime = (time: string) => time;

  // Event handlers
  const handleViewDetails = (routeId: string) => {
    navigate(`/trip-details?routeId=${routeId}&date=${selectedDate}&passengers=1`);
  };

  const handleBookNow = (routeId: string) => {
    navigate(`/search-results?from=${routes.find(r => r.id === routeId)?.from}&to=${routes.find(r => r.id === routeId)?.to}&date=${selectedDate}&passengers=1`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFromCity("all");
    setToCity("all");
    setOperator("all");
    setPriceRange("all");
    setSelectedAmenities([]);
    setRatingFilter("all");
    setMaxStops("all");
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={t('transport.title')}
        description={t('transport.description')}
        breadcrumbs={[
          { label: t('transport.home'), href: "/" },
          { label: t('transport.routes'), href: "/transport-routes" }
        ]}
      />

      {/* InfoBus-like Header */}
      <div className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header Section - Better alignment */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t('transport.busRoutes')}</h1>
                <p className="text-lg text-foreground/70">{t('transport.findJourney')}</p>
              </div>
            </div>
            
            {/* View Mode Buttons - Better positioning */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("list")}
                className="px-6 h-12"
              >
                <List className="h-5 w-5 mr-2" />
                {t('transport.listView')}
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("map")}
                className="px-6 h-12"
              >
                <Map className="h-5 w-5 mr-2" />
                {t('transport.mapView')}
              </Button>
            </div>
          </div>

          {/* Search and Filters - Improved grid layout */}
          <div className="space-y-6">
            {/* Search Bar - Full width on mobile, contained on larger screens */}
            <div className="w-full">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50" />
                <Input
                  placeholder={t('transport.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base w-full"
                />
              </div>
            </div>
            
            {/* Filters Grid - Better responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* From City */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">{t('transport.fromCity')}</Label>
                <Select value={fromCity} onValueChange={setFromCity}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t('transport.allCities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('transport.allCities')}</SelectItem>
                    {getCities().map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* To City */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">{t('transport.toCity')}</Label>
                <Select value={toCity} onValueChange={setToCity}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t('transport.allCities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('transport.allCities')}</SelectItem>
                    {getCities().map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Operator */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">{t('transport.operator')}</Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t('transport.allOperators')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('transport.allOperators')}</SelectItem>
                    {getOperators().map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">{t('transport.priceInterval')}</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t('transport.selectPriceInterval')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('transport.allPrices')}</SelectItem>
                    <SelectItem value="0-80">{t('transport.below80')}</SelectItem>
                    <SelectItem value="80-100">{t('transport.80to100')}</SelectItem>
                    <SelectItem value="100-150">{t('transport.100to150')}</SelectItem>
                    <SelectItem value="150-">{t('transport.above150')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results and Sorting */}
      <div className="py-6 bg-white border-b border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-foreground/70">
                {t('transport.showingRoutes').replace('{count}', filteredRoutes.length.toString()).replace('{total}', routes.length.toString())}
              </p>
              {filteredRoutes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/70">{t('transport.sortBy')}</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departure">{t('transport.departureTime')}</SelectItem>
                      <SelectItem value="price">{t('transport.priceLowToHigh')}</SelectItem>
                      <SelectItem value="duration">{t('transport.duration')}</SelectItem>
                      <SelectItem value="rating">{t('transport.rating')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('transport.advancedFilters')}
                    {(selectedAmenities.length > 0 || ratingFilter !== "all") && (
                      <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                        {selectedAmenities.length + (ratingFilter !== "all" ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('transport.advancedFilters')}</DialogTitle>
                    <DialogDescription>
                      Filter routes by amenities and other preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Amenities Filter */}
                    <div>
                      <Label className="text-sm font-medium">Amenities</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {getAllAmenities().map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={amenity}
                              checked={selectedAmenities.includes(amenity)}
                              onChange={() => toggleAmenity(amenity)}
                              className="rounded border-border"
                            />
                            <label htmlFor={amenity} className="text-sm flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Rating Filter */}
                    <div>
                      <Label className="text-sm font-medium">Minimum Price</Label>
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Any price" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any price</SelectItem>
                                          <SelectItem value="50">Above {formatPrice(50, undefined, 'EUR')}</SelectItem>
                <SelectItem value="75">Above {formatPrice(75, undefined, 'EUR')}</SelectItem>
                <SelectItem value="100">Above {formatPrice(100, undefined, 'EUR')}</SelectItem>
                <SelectItem value="150">Above {formatPrice(150, undefined, 'EUR')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => {
                        setSelectedAmenities([]);
                        setRatingFilter("all");
                      }}
                    >
                      Clear
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setShowAdvancedFilters(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 w-auto"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Display */}
      <div className="py-8">
        <div className="container max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-foreground/70">Loading routes...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">Error Loading Routes</h3>
                <p className="text-foreground/70 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "list" ? (
            <div className="space-y-6">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <Card key={route.id} className="border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        {/* Route Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-green-600" />
                              <span className="text-lg font-semibold">{route.from}</span>
                            </div>
                            <div className="flex-1 h-px bg-border"></div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-red-600" />
                              <span className="text-lg font-semibold">{route.to}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-foreground/50" />
                              <span><strong>{route.departureTime}</strong> - {route.arrivalTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-foreground/50" />
                              <span><strong>{formatDuration(route.duration)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bus className="h-4 w-4 text-foreground/50" />
                              <span><strong>{route.frequency}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-foreground/50" />
                              <span><strong>Daily</strong> service</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price and Actions */}
                        <div className="text-right ml-8">
                          <div className="space-y-1 mb-3">
                            <div className="text-xs text-foreground/60">from</div>
                            <div className="text-3xl font-bold text-primary">
                              {formatPrice(route.price.economy, undefined, 'EUR')}
                            </div>
                            <div className="text-xs text-foreground/60">Economy</div>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-xs">
                              {route.operator}
                            </Badge>
                            {route.isCustom && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                Custom Route
                              </Badge>
                            )}
                            {route.price.economy < 80 && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {t('transport.popular')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="lg" 
                              className="px-6"
                              onClick={() => handleViewDetails(route.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t('transport.viewDetails')}
                            </Button>
                            <Button 
                              size="lg" 
                              variant="outline" 
                              className="px-6"
                              onClick={() => handleBookNow(route.id)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              {t('transport.bookNow')}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Amenities */}
                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                        {route.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-border">
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">{t('transport.noRoutesFound')}</h3>
                    <p className="text-foreground/70 mb-6">
                      {t('transport.tryAdjusting')}
                    </p>
                    <Button onClick={clearAllFilters}>
                      {t('transport.clearAllFilters')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <Map className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">{t('transport.interactiveMapView')}</h3>
                <p className="text-foreground/70 mb-6">
                  {t('transport.mapViewDescription')}
                </p>
                <Button onClick={() => setViewMode("list")}>
                  {t('transport.switchToListView')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('transport.cantFindRoute')}
          </h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            {t('transport.contactService')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="px-8 h-12"
              onClick={() => window.open('mailto:custom@starlines.com?subject=Custom Route Request', '_blank')}
            >
              <Route className="h-5 w-5 mr-2" />
              {t('transport.requestCustomRoute')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 h-12"
              onClick={() => window.open('tel:+37360123456', '_self')}
            >
              <Users className="h-5 w-5 mr-2" />
              {t('transport.contactSupport')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportRoutes;
