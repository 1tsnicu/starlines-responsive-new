import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const promos = [
    {
      id: 1,
      title: "Early Bird Special",
      description: "Book 30 days in advance and save up to 25% on all routes",
      discount: "25% OFF",
      validUntil: "Dec 31, 2024",
      bgColor: "from-blue-500 to-purple-600",
      icon: "🚌"
    },
    {
      id: 2,
      title: "Student Discount",
      description: "Students get 15% off with valid student ID",
      discount: "15% OFF",
      validUntil: "Always",
      bgColor: "from-green-500 to-teal-600",
      icon: "🎓"
    },
    {
      id: 3,
      title: "Family Package",
      description: "Travel with family and get 20% off for groups of 4+",
      discount: "20% OFF",
      validUntil: "Dec 31, 2024",
      bgColor: "from-orange-500 to-red-600",
      icon: "👨‍👩‍👧‍👦"
    },
    {
      id: 4,
      title: "Weekend Getaway",
      description: "Special rates for Friday-Sunday travel",
      discount: "30% OFF",
      validUntil: "Ongoing",
      bgColor: "from-pink-500 to-rose-600",
      icon: "🌅"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [promos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Special Offers & Promotions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take advantage of our exclusive deals and save on your next journey
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {promos.map((promo) => (
                <div key={promo.id} className="w-full flex-shrink-0">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-r ${promo.bgColor} text-white p-8 md:p-12`}>
                        <div className="flex items-start justify-between mb-6">
                          <div className="text-6xl">{promo.icon}</div>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {promo.discount}
                          </Badge>
                        </div>
                        
                        <div className="max-w-md">
                          <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            {promo.title}
                          </h3>
                          <p className="text-lg text-white/90 mb-4 leading-relaxed">
                            {promo.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-white/80 mb-6">
                            <Star className="h-4 w-4 fill-white" />
                            <span className="text-sm">Valid until {promo.validUntil}</span>
                          </div>
                          
                          <Button 
                            size="lg" 
                            variant="secondary"
                            className="bg-white text-gray-900 hover:bg-white/90"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {promos.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-primary w-8' 
                    : 'bg-muted hover:bg-muted-foreground/50'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoCarousel;
