import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, Star, Wifi, Zap, Bath, Snowflake, Users, Bus, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { routes, fareTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";

const TripDetails: React.FC = () => {
  const { formatPrice } = useLocalization();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedFare, setSelectedFare] = useState<string>("");
  const [passengers, setPassengers] = useState(1);

  // Find the route by ID
  const route = routes.find(r => r.id === id);

  useEffect(() => {
    if (route && fareTypes.length > 0) {
      setSelectedFare(fareTypes[0].id);
    }
  }, [route]);

  if (!route) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Route not found</h2>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const selectedFareData = fareTypes.find(f => f.id === selectedFare);
  const totalPrice = selectedFareData ? selectedFareData.price * passengers : 0;

  const stops = [
    { city: route.from.name, time: route.departureTime, type: "departure" },
    { city: "Bălți", time: "10:30", type: "stop", duration: "15 min" },
    { city: "Ungheni", time: "12:45", type: "stop", duration: "20 min" },
    { city: route.to.name, time: route.arrivalTime, type: "arrival" }
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
                {route.from.name} → {route.to.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {route.departureTime} - {route.arrivalTime} • {route.duration} • {route.stops} stops
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{route.operator}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="text-sm font-medium">{route.rating}</span>
                  <span className="text-sm text-muted-foreground">({route.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/search")}>
                Back to Search
              </Button>
              <Button>
                Book Now
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
                  Journey Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex items-start gap-4">
                      {/* Time */}
                      <div className="w-20 text-right">
                        <div className="font-semibold text-foreground">{stop.time}</div>
                        {stop.duration && (
                          <div className="text-xs text-muted-foreground">{stop.duration}</div>
                        )}
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
                          {stop.type === "departure" && "Departure"}
                          {stop.type === "stop" && "Stop"}
                          {stop.type === "arrival" && "Arrival"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-8 p-6 bg-muted rounded-lg text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Interactive map coming soon</p>
                </div>
              </CardContent>
            </Card>

            {/* Fare Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fare Rules & Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="baggage">
                    <AccordionTrigger>Baggage Allowance</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Hand luggage</span>
                          <Badge variant="outline">1 piece (max 10kg)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Checked baggage</span>
                          <Badge variant="outline">1 piece (max 20kg)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Oversized items</span>
                          <Badge variant="outline">{formatPrice(15)} extra</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="changes">
                    <AccordionTrigger>Changes & Cancellations</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Free changes</span>
                          <Badge variant="outline">Up to 2 hours before departure</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cancellation fee</span>
                          <Badge variant="outline">{formatPrice(10)} (24h before) / {formatPrice(25)} (same day)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>No-show</span>
                          <Badge variant="outline">100% of fare</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="refunds">
                    <AccordionTrigger>Refund Policy</AccordionTrigger>
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
                  <CardTitle className="text-xl">Select Your Fare</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fare Types */}
                  <div className="space-y-3">
                    {fareTypes.map((fare) => (
                      <div
                        key={fare.id}
                        className={cn(
                          "p-4 border-2 rounded-lg cursor-pointer transition-all",
                          selectedFare === fare.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedFare(fare.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-foreground">{fare.name}</div>
                          <div className="text-lg font-bold text-primary">
                            €{fare.price}
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
                          {fare.refundable && (
                            <Badge variant="secondary" className="text-xs">Refundable</Badge>
                          )}
                          {fare.changeable && (
                            <Badge variant="secondary" className="text-xs">Changeable</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Passengers */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Number of Passengers
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
                      <span className="text-muted-foreground">Fare per person</span>
                      <span>€{selectedFareData?.price || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Passengers</span>
                      <span>{passengers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                                              <span>{formatPrice(2.50)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">€{(totalPrice + 2.50).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full" size="lg">
                    Continue to Checkout
                  </Button>

                  {/* Security Info */}
                  <div className="text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-3 w-3" />
                      Secure Payment
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Multiple payment methods accepted
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
