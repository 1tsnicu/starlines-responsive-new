import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calculator,
  Euro,
  CreditCard,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { infoBusAPI, InfoBusRoute, PricingFactors } from "@/lib/mock-data";
import { useLocalization } from "@/contexts/LocalizationContext";

interface RouteFormData {
  from: string;
  to: string;
  operator: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  frequency: string;
  amenities: string[];
  price: {
    economy: number;
    premium: number;
    business: number;
  };
  isHidden: boolean;
}

const RouteManagement: React.FC = () => {
  const { formatPrice } = useLocalization();
  const [routes, setRoutes] = useState<InfoBusRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<InfoBusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<InfoBusRoute | null>(null);
  const [formData, setFormData] = useState<RouteFormData>({
    from: "",
    to: "",
    operator: "Starlines Custom",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    frequency: "Daily",
    amenities: [],
    price: {
      economy: 0,
      premium: 0,
      business: 0,
    },
    isHidden: false,
  });

  const availableAmenities = [
    "WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", 
    "Reclining Seats", "Premium Service", "AC", "Priority Boarding", "Extra Legroom"
  ];

  const frequencyOptions = ["Daily", "Multiple daily", "2x weekly", "3x weekly", "Weekly"];

  // Helper functions
  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatTime = (time: string) => {
    return time;
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    filterRoutes();
  }, [routes, searchTerm, operatorFilter]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const allRoutes = await infoBusAPI.getAllRoutes();
      setRoutes(allRoutes);
    } catch (error) {
      console.error("Error loading routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = () => {
    let filtered = routes;

    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.operator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (operatorFilter !== "all") {
      filtered = filtered.filter(route => route.operator === operatorFilter);
    }

    setFilteredRoutes(filtered);
  };

  const toggleRouteVisibility = async (routeId: string) => {
    try {
      const route = routes.find(r => r.id === routeId);
      if (route) {
        const success = await infoBusAPI.toggleRouteVisibility(routeId, !route.isHidden);
        if (success) {
          await loadRoutes();
        }
      }
    } catch (error) {
      console.error("Error toggling route visibility:", error);
    }
  };

  const handleAddRoute = async () => {
    try {
      const newRoute = await infoBusAPI.addCustomRoute(formData);
      if (newRoute) {
        setIsFormOpen(false);
        resetForm();
        await loadRoutes();
      }
    } catch (error) {
      console.error("Error adding route:", error);
    }
  };

  const handleEditRoute = async () => {
    if (!editingRoute) return;

    try {
      const success = await infoBusAPI.updateCustomRoute(editingRoute.id, formData);
      if (success) {
        setIsFormOpen(false);
        setEditingRoute(null);
        resetForm();
        await loadRoutes();
      }
    } catch (error) {
      console.error("Error updating route:", error);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const success = await infoBusAPI.deleteCustomRoute(routeId);
        if (success) {
          await loadRoutes();
        }
      } catch (error) {
        console.error("Error deleting route:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      from: "",
      to: "",
      operator: "Starlines Custom",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      frequency: "Daily",
      amenities: [],
      price: {
        economy: 0,
        premium: 0,
        business: 0,
      },
      isHidden: false,
    });
  };

  const openEditForm = (route: InfoBusRoute) => {
    setEditingRoute(route);
    setFormData({
      from: route.from,
      to: route.to,
      operator: route.operator,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      duration: route.duration,
      frequency: route.frequency,
      amenities: [...route.amenities],
      price: route.price,
      isHidden: route.isHidden,
    });
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingRoute(null);
    resetForm();
    setIsFormOpen(true);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const RouteCard: React.FC<{ route: InfoBusRoute }> = ({ route }) => {
    const [showPricingBreakdown, setShowPricingBreakdown] = useState(false);

    return (
      <Card className="border-border hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {route.from} → {route.to}
                </span>
                {route.isCustom && (
                  <Badge variant="secondary" className="text-xs">
                    Custom Route
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-foreground/70">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {route.departureTime} - {route.arrivalTime}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {route.frequency}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {route.operator}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingBreakdown(!showPricingBreakdown)}
                className="h-8 px-2"
              >
                <Calculator className="h-3 w-3 mr-1" />
                Pricing
              </Button>
              
              <Button
                variant={route.isHidden ? "outline" : "default"}
                size="sm"
                onClick={() => toggleRouteVisibility(route.id)}
                className="h-8 px-2"
              >
                {route.isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              
              {route.isCustom && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(route)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRoute(route.id)}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Pricing Display */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">Pricing</h4>
              <Badge 
                variant={route.paymentDestination === 'starlines' ? 'default' : 'secondary'}
                className="text-xs"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                {route.paymentDestination === 'starlines' ? 'Starlines Account' : 'InfoBus Account'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-muted/50 rounded p-2 text-center">
                <div className="font-medium text-foreground">Economy</div>
                <div className="text-primary font-bold">{formatPrice(route.price.economy)}</div>
              </div>
              <div className="bg-muted/50 rounded p-2 text-center">
                <div className="font-medium text-foreground">Premium</div>
                <div className="text-primary font-bold">{formatPrice(route.price.premium)}</div>
              </div>
              <div className="bg-muted/50 rounded p-2 text-center">
                <div className="font-medium text-foreground">Business</div>
                <div className="text-primary font-bold">{formatPrice(route.price.business)}</div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown for Custom Routes */}
          {route.isCustom && route.pricingBreakdown && showPricingBreakdown && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Automatic Price Calculation
              </h5>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Base Price:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Distance Cost:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.distanceCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Fuel Surcharge:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.fuelSurcharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Market Adjustment:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.marketAdjustment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Seasonality:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.seasonalityAdjustment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Competition:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.competitionAdjustment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Amenities:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.amenitiesCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Operator Fee:</span>
                  <span className="font-medium">{formatPrice(route.pricingBreakdown.operatorFee)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-primary">
                  <span>Total:</span>
                  <span>{formatPrice(route.pricingBreakdown.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div className="flex flex-wrap gap-1">
            {route.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
          
          <div className="text-xs text-foreground/50 mt-2">
            Last updated: {route.lastUpdated}
          </div>
        </CardContent>
      </Card>
    );
  };

  const RouteForm: React.FC = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from">From City</Label>
          <Input
            id="from"
            value={formData.from}
            onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
            placeholder="e.g., Chișinău"
          />
        </div>
        <div>
          <Label htmlFor="to">To City</Label>
          <Input
            id="to"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            placeholder="e.g., Berlin"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departureTime">Departure Time</Label>
          <Input
            id="departureTime"
            type="time"
            value={formData.departureTime}
            onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="arrivalTime">Arrival Time</Label>
          <Input
            id="arrivalTime"
            type="time"
            value={formData.arrivalTime}
            onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="e.g., 14h"
          />
        </div>
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((freq) => (
                <SelectItem key={freq} value={freq}>{freq}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availableAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="rounded"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setIsFormOpen(false)}>
          Cancel
        </Button>
        <Button onClick={editingRoute ? handleEditRoute : handleAddRoute}>
          {editingRoute ? "Update Route" : "Add Route"}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Route Management</h2>
          <p className="text-foreground/70">
            Manage custom routes and InfoBus integration. Custom routes automatically calculate pricing and direct payments to Starlines account.
          </p>
        </div>
        
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Route
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={operatorFilter} onValueChange={setOperatorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Operators</SelectItem>
            <SelectItem value="InfoBus">InfoBus</SelectItem>
            <SelectItem value="Starlines Custom">Starlines Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Routes Grid */}
      <div className="grid gap-4">
        {filteredRoutes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-8 text-foreground/50">
          No routes found matching your criteria.
        </div>
      )}

      {/* Add/Edit Route Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRoute ? "Edit Custom Route" : "Add Custom Route"}
            </DialogTitle>
          </DialogHeader>
          <RouteForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteManagement;
