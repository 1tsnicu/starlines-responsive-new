import { useState, useEffect } from "react";
import { 
  Shield, 
  Settings, 
  BarChart3, 
  Eye, 
  EyeOff, 
  Plus,
  Route,
  Users,
  Calendar,
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
  Map,
  List,
  Filter,
  Search,
  MapPin,
  Clock,
  Euro,
  Bus,
  Edit,
  Activity,
  Zap,
  CreditCard,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { useLocalization } from "@/contexts/LocalizationContext";

// Mock routes data for InfoBus-like display
const mockRoutes = [
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
    isHidden: false
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
    isHidden: false
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
    isHidden: false
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
    isHidden: false
  }
];

const AdminRoutes = () => {
  const { formatPrice } = useLocalization();
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    custom: 0,
    countries: 0,
    operators: 0
  });
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState("Initializing...");
  
  // Routes display state
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromCity, setFromCity] = useState("all");
  const [toCity, setToCity] = useState("all");
  const [operator, setOperator] = useState("all");
  const [filteredRoutes, setFilteredRoutes] = useState(mockRoutes);

  useEffect(() => {
    setDebug("useEffect triggered");
    
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        total: mockRoutes.length,
        visible: mockRoutes.filter(r => !r.isHidden).length,
        hidden: mockRoutes.filter(r => r.isHidden).length,
        custom: mockRoutes.filter(r => r.operator === "Starlines Custom").length,
        countries: [...new Set(mockRoutes.map(r => r.to))].length,
        operators: [...new Set(mockRoutes.map(r => r.operator))].length
      });
      setLoading(false);
      setDebug("Stats loaded successfully");
    }, 1000);
  }, []);

  // Filter routes
  useEffect(() => {
    let filtered = mockRoutes;
    
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
    
    setFilteredRoutes(filtered);
  }, [searchTerm, fromCity, toCity, operator]);

  const getCities = () => {
    const cities = [...new Set([...mockRoutes.map(r => r.from), ...mockRoutes.map(r => r.to)])];
    return cities.sort();
  };

  const getOperators = () => {
    const operators = [...new Set(mockRoutes.map(r => r.operator))];
    return operators.sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground/70">Loading admin panel...</p>
              <p className="text-xs text-foreground/50 mt-2">Debug: {debug}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
        <strong>Debug Info:</strong> {debug}
      </div>

      <PageHeader
        title="Route Administration"
        description="Manage InfoBus routes, custom routes, and route visibility for Starlines"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Route Management", href: "/admin/routes" }
        ]}
      />

      {/* Admin Header */}
      <div className="py-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Administrator Panel</h2>
                <p className="text-sm text-foreground/70">Route Management & Configuration</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Settings className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="py-8">
        <div className="container">
          <h3 className="text-lg font-semibold text-foreground mb-4">Route Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="border-border bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Route className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-foreground/70">Total Routes</div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stats.visible}</div>
                <div className="text-xs text-foreground/70">Visible</div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <EyeOff className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stats.hidden}</div>
                <div className="text-xs text-foreground/70">Hidden</div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Plus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stats.custom}</div>
                <div className="text-xs text-foreground/70">Custom</div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stats.countries}</div>
                <div className="text-xs text-foreground/70">Countries</div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stats.operators}</div>
                <div className="text-xs text-foreground/70">Operators</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="container">
          <Tabs defaultValue="routes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="routes" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Routes Display
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments & Revenue
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="routes" className="space-y-6">
              {/* InfoBus-like Header */}
              <Card className="border-border bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Bus className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Bus Routes</h3>
                        <p className="text-sm text-foreground/70">Find and book your perfect journey</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4 mr-2" />
                        List
                      </Button>
                      <Button
                        variant={viewMode === "map" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("map")}
                      >
                        <Map className="h-4 w-4 mr-2" />
                        Map
                      </Button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                      <Input
                        placeholder="Search routes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={fromCity} onValueChange={setFromCity}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Operators</SelectItem>
                        {getOperators().map(op => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/70">
                  Showing {filteredRoutes.length} of {mockRoutes.length} routes
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/70">Sort by:</span>
                  <Select defaultValue="departure">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departure">Departure</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Routes Display */}
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {filteredRoutes.map((route) => (
                    <Card key={route.id} className="border-border hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          {/* Route Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <span className="font-medium">{route.from}</span>
                              </div>
                              <div className="flex-1 h-px bg-border"></div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="font-medium">{route.to}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-foreground/50" />
                                <span>{route.departure} - {route.arrival}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-foreground/50" />
                                <span>{route.duration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Bus className="h-4 w-4 text-foreground/50" />
                                <span>{route.frequency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Euro className="h-4 w-4 text-foreground/50" />
                                <span className="font-semibold">{formatPrice(route.price, undefined, 'EUR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Price and Actions */}
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-primary mb-2">
                              {formatPrice(route.price, undefined, 'EUR')}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {route.operator}
                              </Badge>
                              {route.operator === "Starlines Custom" && (
                                <Badge variant="secondary" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                          {route.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Map className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Interactive Map View</h3>
                      <p className="text-foreground/70 mb-4">
                        Map view will be implemented here showing route visualization
                      </p>
                      <Button onClick={() => setViewMode("list")}>
                        Switch to List View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Bus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">{stats.total}</div>
                    <div className="text-xs text-foreground/70">Total Routes</div>
                  </CardContent>
                </Card>
                
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">{stats.visible}</div>
                    <div className="text-xs text-foreground/70">Visible</div>
                  </CardContent>
                </Card>
                
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <EyeOff className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">{stats.hidden}</div>
                    <div className="text-xs text-foreground/70">Hidden</div>
                  </CardContent>
                </Card>
                
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Plus className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">{stats.custom}</div>
                    <div className="text-xs text-foreground/70">Custom Routes</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock recent activity */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground/70">Admin panel loaded successfully</span>
                      <span className="text-xs text-foreground/50 ml-auto">Just now</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-foreground/70">Statistics updated</span>
                      <span className="text-xs text-foreground/50 ml-auto">1 minute ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setDebug("Refreshing data...")} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                    <Button onClick={() => alert("Export functionality not implemented yet.")} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Routes
                    </Button>
                                         <Button onClick={() => alert("Sync functionality not implemented yet.")} variant="outline" size="sm">
                       <RefreshCw className="h-4 w-4 mr-2" />
                       Sync Now
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <PaymentsAndRevenueTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Version</h4>
                      <p className="text-sm text-foreground/70">Route Manager v2.1.0</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Last Updated</h4>
                      <p className="text-sm text-foreground/70">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Status</h4>
                      <Badge variant="secondary">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Admin Panel Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-4">
                    This is the admin panel with InfoBus-like route display. 
                    Routes are shown in a familiar interface similar to InfoBus.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Current Status:</h4>
                    <ul className="text-sm text-foreground/70 space-y-1">
                      <li>✅ Basic structure working</li>
                      <li>✅ Stats display functional</li>
                      <li>✅ Tabs navigation working</li>
                      <li>✅ InfoBus-like route display</li>
                      <li>✅ Search and filtering</li>
                      <li>✅ List and Map view modes</li>
                      <li>✅ Debug information visible</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;

const PaymentsAndRevenueTab: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<{ total: number; currency: string }>({ total: 0, currency: "EUR" });
  const [revenueBreakdown, setRevenueBreakdown] = useState<{
    infobusRoutes: number;
    customRoutes: number;
    total: number;
    currency: string;
  }>({ infobusRoutes: 0, customRoutes: 0, total: 0, currency: "EUR" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - now ALL payments go to Starlines
      const mockPayments = [
        { id: 1, transactionId: "PAY-001", routeId: "md-de-1", amount: 120, currency: "EUR", timestamp: "2023-10-27T10:00:00Z", status: "Completed", destinationAccount: "starlines", routeType: "infobus" },
        { id: 2, transactionId: "PAY-002", routeId: "md-de-2", amount: 85, currency: "EUR", timestamp: "2023-10-27T11:00:00Z", status: "Completed", destinationAccount: "starlines", routeType: "infobus" },
        { id: 3, transactionId: "PAY-003", routeId: "custom-1", amount: 100, currency: "EUR", timestamp: "2023-10-27T12:00:00Z", status: "Completed", destinationAccount: "starlines", routeType: "custom" },
        { id: 4, transactionId: "PAY-004", routeId: "md-it-1", amount: 90, currency: "EUR", timestamp: "2023-10-27T13:00:00Z", status: "Completed", destinationAccount: "starlines", routeType: "infobus" },
        { id: 5, transactionId: "PAY-005", routeId: "md-fr-1", amount: 150, currency: "EUR", timestamp: "2023-10-27T14:00:00Z", status: "Completed", destinationAccount: "starlines", routeType: "infobus" },
        { id: 6, transactionId: "PAY-006", routeId: "custom-2", amount: 75, currency: "EUR", timestamp: "2023-10-27T15:00:00Z", status: "Completed", destinationAccount: "starlines", routeType: "custom" }
      ];
      
      const mockRevenue = { total: 620, currency: "EUR" }; // Total of all payments
      const mockBreakdown = { 
        infobusRoutes: 445, // Sum of InfoBus route payments
        customRoutes: 175,  // Sum of custom route payments
        total: 620, 
        currency: "EUR" 
      };
      
      setPayments(mockPayments);
      setRevenue(mockRevenue);
      setRevenueBreakdown(mockBreakdown);
    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              {revenue.total.toFixed(2)} {revenue.currency}
            </h3>
            <p className="text-green-700 font-medium">Total Starlines Revenue</p>
            <p className="text-green-600 text-sm mt-1">From ALL Routes</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              {revenueBreakdown.infobusRoutes.toFixed(2)} {revenueBreakdown.currency}
            </h3>
            <p className="text-blue-700 font-medium">InfoBus Routes Revenue</p>
            <p className="text-blue-600 text-sm mt-1">Processed by Starlines</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-r from-purple-50 to-violet-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Euro className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-800 mb-2">
              {revenueBreakdown.customRoutes.toFixed(2)} {revenueBreakdown.currency}
            </h3>
            <p className="text-purple-700 font-medium">Custom Routes Revenue</p>
            <p className="text-purple-600 text-sm mt-1">100% Starlines Profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Breakdown
          </CardTitle>
          <p className="text-sm text-foreground/70">
            All payments are processed by Starlines and go directly to your account.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-800">InfoBus Routes</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-800">{revenueBreakdown.infobusRoutes.toFixed(2)} {revenueBreakdown.currency}</div>
                <div className="text-sm text-blue-600">
                  {((revenueBreakdown.infobusRoutes / revenueBreakdown.total) * 100).toFixed(1)}% of total revenue
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-800">Custom Routes</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-800">{revenueBreakdown.customRoutes.toFixed(2)} {revenueBreakdown.currency}</div>
                <div className="text-sm text-purple-600">
                  {((revenueBreakdown.customRoutes / revenueBreakdown.total) * 100).toFixed(1)}% of total revenue
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <p className="text-sm text-foreground/70">
            All payments are processed by Starlines and go directly to your account.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-foreground/50">
                No payment history available.
              </div>
            ) : (
              payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      payment.routeType === 'custom' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium text-foreground">
                        {payment.transactionId}
                      </div>
                      <div className="text-sm text-foreground/70">
                        Route ID: {payment.routeId}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {payment.routeType === 'custom' ? 'Custom' : 'InfoBus'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-foreground">
                      {payment.amount.toFixed(2)} {payment.currency}
                    </div>
                    <div className="text-sm text-foreground/70">
                      {new Date(payment.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Starlines Account
                    </Badge>
                    <div className="text-xs text-foreground/50 mt-1">
                      {payment.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Processing Information */}
      <Card className="border-border bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="h-5 w-5" />
            Payment Processing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">All Payments Go to Starlines</h4>
                <p className="text-sm text-green-600">
                  Whether it's an InfoBus route or a custom route, ALL payments are processed by Starlines 
                  and go directly to your account. You keep 100% of the revenue.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">InfoBus Routes (Starlines Processing)</h4>
                <p className="text-sm text-green-600">
                  Routes from InfoBus integration are now processed by your Starlines system. 
                  You handle all payments and keep all revenue, not InfoBus.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Custom Routes (100% Starlines Profit)</h4>
                <p className="text-sm text-green-600">
                  Routes created by you generate maximum profit since you control pricing, 
                  amenities, and have no external commissions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Unified Payment System</h4>
                <p className="text-sm text-green-600">
                  All customers pay through your Starlines payment system, ensuring consistent 
                  user experience and centralized financial control.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
