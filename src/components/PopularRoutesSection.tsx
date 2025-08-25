import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Star, ArrowRight, Bus, Users, Zap, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/contexts/LocalizationContext";

const PopularRoutesSection = () => {
  const navigate = useNavigate();
  const { formatPrice, t } = useLocalization();

const popularRoutes = [
  {
      id: "1",
    from: "Chișinău",
    to: "București",
      price: 45,
    duration: "8h 30m",
      departureTime: "08:00",
      arrivalTime: "16:30",
      operator: "Starlines Express",
      rating: 4.8,
      reviews: 1247,
      amenities: ["WiFi", "USB", "WC", "AC"],
      stops: 2,
      popularity: "Very Popular"
    },
    {
      id: "2",
    from: "Chișinău",
      to: "Istanbul",
      price: 85,
      duration: "12h 45m",
      departureTime: "20:00",
      arrivalTime: "08:45",
      operator: "Starlines Premium",
      rating: 4.9,
      reviews: 892,
      amenities: ["WiFi", "USB", "WC", "AC", "Entertainment"],
      stops: 3,
      popularity: "Premium Route"
    },
    {
      id: "3",
      from: "Chișinău",
      to: "Budapest",
    price: 65,
      duration: "14h 20m",
      departureTime: "06:30",
      arrivalTime: "20:50",
      operator: "Starlines Express",
      rating: 4.7,
      reviews: 567,
      amenities: ["WiFi", "USB", "WC", "AC"],
      stops: 4,
      popularity: "Scenic Route"
    }
  ];

  const handleViewRoutes = (routeId: string) => {
    navigate(`/trip/${routeId}`);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-surface/30 to-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Route lines pattern */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/10 to-transparent" />
        
        {/* Floating route indicators */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-accent/20 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-secondary/20 rounded-full animate-pulse" />
        
        {/* Geometric shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 border border-primary/10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border border-accent/10 rounded-full" />
        <div className="absolute top-1/3 left-0 w-16 h-16 border border-secondary/10 rounded-full" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{t('hero.popularRoutes')}</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {t('routes.title')}
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            {t('routes.subtitle')}
          </p>
        </div>
        
        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {popularRoutes.map((route, index) => (
            <Card 
              key={route.id} 
              className="group hover-lift border-border relative overflow-hidden bg-gradient-to-br from-white to-surface/50"
            >
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              
              {/* Popularity badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge 
                  variant="secondary" 
                  className="bg-white/90 backdrop-blur-sm border border-border/20"
                >
                  {route.popularity}
                </Badge>
              </div>
              
              <CardHeader className="pb-4 relative">
                {/* Route visualization */}
              <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{route.from}</p>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="relative">
                      <div className="w-full h-0.5 bg-muted relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                          <Bus className="h-3 w-3 text-foreground/70" />
                          <span className="text-xs text-foreground/70">{route.stops} stops</span>
                        </div>
                </div>
                </div>
              </div>
              
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                      <MapPin className="h-8 w-8 text-accent" />
                    </div>
                    <p className="font-semibold text-foreground">{route.to}</p>
                  </div>
                </div>

                <CardTitle className="text-center text-lg">
                  {route.from} → {route.to}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Route details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground/70" />
                    <span className="text-foreground/70">{route.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-foreground/70" />
                    <span className="text-foreground/70">{route.operator}</span>
                  </div>
                </div>

                {/* Rating and reviews */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-medium text-foreground">{route.rating}</span>
                  </div>
                  <span className="text-foreground/70">({route.reviews} reviews)</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {route.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                {/* Price and CTA */}
                <div className="text-center pt-4 border-t border-border/20">
                  <div className="mb-3">
                    <span className="text-xs text-foreground/70">{t('routes.perPerson')}</span>
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(route.price, undefined, 'EUR')}
                </div>
              </div>
              
              <Button 
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => handleViewRoutes(route.id)}
              >
                    <span>{t('routes.viewDetails')}</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-lg border border-border/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{t('routes.readyToExplore')}</h3>
                <p className="text-sm text-foreground/70">{t('routes.findPerfectRoute')}</p>
              </div>
            </div>
            
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <MapPin className="h-4 w-4 mr-2" />
              {t('routes.browseAll')}
          </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutesSection;