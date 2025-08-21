import React, { useState, useEffect, useMemo } from "react";
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
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import { useLocalization } from "@/contexts/LocalizationContext";

// Mock routes data for public display
const publicRoutes = [
  {
    id: "1",
    from: "Chișinău",
    to: "Berlin",
    operator: "InfoBus",
    departure: "08:00",
    arrival: "22:00",
    duration: "14h",
    price: 85,
    frequency: "Daily",
    amenities: ["WiFi", "USB", "WC", "Refreshments"],
    rating: 4.8,
    reviews: 127,
    isPopular: true
  },
  {
    id: "2",
    from: "Chișinău",
    to: "Munich",
    operator: "InfoBus",
    departure: "10:30",
    arrival: "01:30",
    duration: "15h",
    price: 90,
    frequency: "Daily",
    amenities: ["WiFi", "USB", "WC", "Entertainment"],
    rating: 4.7,
    reviews: 89,
    isPopular: true
  },
  {
    id: "3",
    from: "Chișinău",
    to: "Frankfurt",
    operator: "InfoBus",
    departure: "12:00",
    arrival: "03:00",
    duration: "15h",
    price: 88,
    frequency: "Daily",
    amenities: ["WiFi", "USB", "WC"],
    rating: 4.6,
    reviews: 156,
    isPopular: false
  },
  {
    id: "4",
    from: "Chișinău",
    to: "Viena",
    operator: "Starlines Custom",
    departure: "14:00",
    arrival: "04:00",
    duration: "14h",
    price: 100,
    frequency: "2x weekly",
    amenities: ["WiFi", "USB", "WC", "Premium Service"],
    rating: 4.9,
    reviews: 43,
    isPopular: true
  },
  {
    id: "5",
    from: "Chișinău",
    to: "Warsaw",
    operator: "InfoBus",
    departure: "16:00",
    arrival: "06:00",
    duration: "14h",
    price: 75,
    frequency: "Daily",
    amenities: ["WiFi", "USB", "WC"],
    rating: 4.5,
    reviews: 78,
    isPopular: false
  },
  {
    id: "6",
    from: "Chișinău",
    to: "Prague",
    operator: "InfoBus",
    departure: "18:00",
    arrival: "08:00",
    duration: "14h",
    price: 82,
    frequency: "Daily",
    amenities: ["WiFi", "USB", "WC", "Refreshments"],
    rating: 4.7,
    reviews: 94,
    isPopular: false
  }
];

const TransportRoutes: React.FC = () => {
  const { t, formatPrice } = useLocalization();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromCity, setFromCity] = useState("all");
  const [toCity, setToCity] = useState("all");
  const [operator, setOperator] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("departure");
  const [filteredRoutes, setFilteredRoutes] = useState(publicRoutes);

  // Filter and sort routes
  useEffect(() => {
    let filtered = publicRoutes;
    
    if (searchTerm) {
      filtered = filtered.filter(route => 
        route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.operator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (fromCity !== "all") {
      filtered = filtered.filter(route => route.from === fromCity);
    }
    
    if (toCity !== "all") {
      filtered = filtered.filter(route => route.to === toCity);
    }
    
    if (operator !== "all") {
      filtered = filtered.filter(route => route.operator === operator);
    }
    
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      if (max) {
        filtered = filtered.filter(route => route.price >= min && route.price <= max);
      } else {
        filtered = filtered.filter(route => route.price >= min);
      }
    }
    
    // Sort routes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          return parseInt(a.duration) - parseInt(b.duration);
        case "rating":
          return b.rating - a.rating;
        case "departure":
        default:
          return a.departure.localeCompare(b.departure);
      }
    });
    
    setFilteredRoutes(filtered);
  }, [searchTerm, fromCity, toCity, operator, priceRange, sortBy]);

  const getCities = () => {
    const cities = [...new Set([...publicRoutes.map(r => r.from), ...publicRoutes.map(r => r.to)])];
    return cities.sort();
  };

  const getOperators = () => {
    const operators = [...new Set(publicRoutes.map(r => r.operator))];
    return operators.sort();
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="h-3 w-3" />;
      case "usb": return <Zap className="h-3 w-3" />;
      case "wc": return <Bath className="h-3 w-3" />;
      case "refreshments": return <Coffee className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const formatDuration = (duration: string) => duration.replace('h', 'h ');
  const formatTime = (time: string) => time;

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
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Bus Routes</h1>
                <p className="text-lg text-foreground/70">Find and book your perfect journey across Europe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("list")}
                className="px-6"
              >
                <List className="h-5 w-5 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("map")}
                className="px-6"
              >
                <Map className="h-5 w-5 mr-2" />
                Map View
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50" />
              <Input
                placeholder="Search routes, cities, or operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            
            <Select value={fromCity} onValueChange={setFromCity}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="From City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {getCities().map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={toCity} onValueChange={setToCity}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="To City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {getCities().map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operators</SelectItem>
                {getOperators().map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label htmlFor="price-range" className="text-sm font-medium">Interval Preț</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează intervalul de preț" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate prețurile</SelectItem>
                  <SelectItem value="0-80">Sub {formatPrice(80)}</SelectItem>
                  <SelectItem value="80-100">{formatPrice(80)} - {formatPrice(100)}</SelectItem>
                  <SelectItem value="100-150">{formatPrice(100)} - {formatPrice(150)}</SelectItem>
                  <SelectItem value="150-">Peste {formatPrice(150)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results and Sorting */}
      <div className="py-6 bg-white border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-foreground/70">
                Showing <span className="font-semibold text-foreground">{filteredRoutes.length}</span> of {publicRoutes.length} routes
              </p>
              {filteredRoutes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/70">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departure">Departure Time</SelectItem>
                      <SelectItem value="price">Price (Low to High)</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Picker
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Display */}
      <div className="py-8">
        <div className="container">
          {viewMode === "list" ? (
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
                              <span><strong>{route.departure}</strong> - {route.arrival}</span>
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
                              <span><strong>{route.reviews}</strong> reviews</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price and Actions */}
                        <div className="text-right ml-8">
                          <div className="text-3xl font-bold text-primary mb-3">
                            {formatPrice(route.price)}
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{route.rating}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {route.operator}
                            </Badge>
                            {route.isPopular && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="lg" className="px-6">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="lg" variant="outline" className="px-6">
                              <Calendar className="h-4 w-4 mr-2" />
                              Book Now
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
                    <h3 className="text-xl font-medium text-foreground mb-2">No routes found</h3>
                    <p className="text-foreground/70 mb-6">
                      Try adjusting your search criteria or filters to find available routes.
                    </p>
                    <Button onClick={() => {
                      setSearchTerm("");
                      setFromCity("all");
                      setToCity("all");
                      setOperator("all");
                      setPriceRange("all");
                    }}>
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <Map className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">Interactive Map View</h3>
                <p className="text-foreground/70 mb-6">
                  Map view will be implemented here showing route visualization across Europe.
                </p>
                <Button onClick={() => setViewMode("list")}>
                  Switch to List View
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Can't find the route you're looking for?
          </h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Contact our customer service team to request custom routes or get assistance with your travel plans.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="px-8">
              <Route className="h-5 w-5 mr-2" />
              Request Custom Route
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              <Users className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportRoutes;
