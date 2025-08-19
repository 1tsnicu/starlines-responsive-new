import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Euro } from "lucide-react";

const popularRoutes = [
  {
    from: "Chișinău",
    to: "București",
    duration: "8h 30m",
    price: 35,
    currency: "EUR",
    frequency: "Daily",
    popular: true
  },
  {
    from: "Chișinău",
    to: "Paris",
    duration: "28h 15m",
    price: 89,
    currency: "EUR",
    frequency: "3x/week",
    popular: true
  },
  {
    from: "București",
    to: "Vienna",
    duration: "14h 45m",
    price: 65,
    currency: "EUR",
    frequency: "Daily",
    popular: false
  },
  {
    from: "Chișinău",
    to: "Prague",
    duration: "22h 30m",
    price: 75,
    currency: "EUR",
    frequency: "2x/week",
    popular: false
  },
  {
    from: "București",
    to: "Berlin",
    duration: "18h 20m",
    price: 78,
    currency: "EUR",
    frequency: "Daily",
    popular: true
  },
  {
    from: "Chișinău",
    to: "Milan",
    duration: "26h 45m",
    price: 95,
    currency: "EUR",
    frequency: "2x/week",
    popular: false
  }
];

const PopularRoutesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Routes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most traveled destinations with competitive prices and comfortable journeys.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRoutes.map((route, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group"
            >
              {route.popular && (
                <Badge className="mb-4 bg-accent text-accent-foreground">
                  Popular
                </Badge>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{route.frequency}</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-bold text-primary">
                  <Euro className="h-4 w-4" />
                  <span>{route.price}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-lg font-semibold text-foreground mb-1">
                  {route.from} → {route.to}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{route.duration}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground group-hover:scale-105 transition-transform"
                variant="default"
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            View All Routes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutesSection;