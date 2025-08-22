import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, Star, Wifi, Zap, Bath, Snowflake, Users, Bus, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { infoBusAPI, InfoBusRoute } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";

const TripDetails: React.FC = () => {
  const { formatPrice, t } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedFare, setSelectedFare] = useState<string>("economy");
  const [passengers, setPassengers] = useState(1);
  const [route, setRoute] = useState<InfoBusRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get route ID from query parameters
  const routeId = searchParams.get("routeId");
  const selectedDate = searchParams.get("date") || new Date().toISOString().split('T')[0];
  const initialPassengers = parseInt(searchParams.get("passengers") || "1");

  useEffect(() => {
    setPassengers(initialPassengers);
  }, [initialPassengers]);

  // Load route data
  useEffect(() => {
    const loadRoute = async () => {
      if (!routeId) {
        setError("No route ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const allRoutes = await infoBusAPI.getAllRoutes();
        const foundRoute = allRoutes.find(r => r.id === routeId);
        
        if (foundRoute) {
          setRoute(foundRoute);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {error || t('tripDetails.error.routeNotFound')}
          </h2>
          <Button onClick={() => navigate("/transport-routes")}>
            {t('tripDetails.backToRoutes')}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total price based on selected fare type
  const totalPrice = route.price[selectedFare as keyof typeof route.price] * passengers;

  // Handle checkout navigation
  const handleContinueToCheckout = () => {
    if (!route) return;

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
      operator: route.operator
    });

    navigate(`/checkout?${checkoutParams.toString()}`);
  };

  const stops = [
    { city: route.from, time: route.departureTime, type: "departure" },
    { city: route.to, time: route.arrivalTime, type: "arrival" }
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
                          <Badge variant="outline">{formatPrice(15)} {t('tripDetails.extra')}</Badge>
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
                          <Badge variant="outline">{formatPrice(10)} ({t('tripDetails.before24h')}) / {formatPrice(25)} ({t('tripDetails.sameDay')})</Badge>
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
                  {route.amenities.map((amenity) => (
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
                  About {route.operator}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {route.operator} is a premium bus operator known for comfortable travel experiences 
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
                            {formatPrice(fare.price)}
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

                  {/* Total */}
                                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tripDetails.farePerPerson')}</span>
                      <span>{formatPrice(route.price[selectedFare as keyof typeof route.price])}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tripDetails.numberOfPassengers')}</span>
                      <span>{passengers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tripDetails.serviceFee')}</span>
                      <span>{formatPrice(2.50)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>{t('tripDetails.total')}</span>
                      <span className="text-primary">€{(totalPrice + 2.50).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full" size="lg" onClick={handleContinueToCheckout}>
                    {t('tripDetails.continueToCheckout')}
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
