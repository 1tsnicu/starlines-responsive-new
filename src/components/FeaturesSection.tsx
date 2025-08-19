import { Shield, Clock, CreditCard, HeadphonesIcon, MapPin, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your payments and data are protected with bank-level security"
  },
  {
    icon: Clock,
    title: "24/7 Booking",
    description: "Book your tickets anytime, anywhere with our online platform"
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Multiple payment options including cards, PayPal, and bank transfers"
  },
  {
    icon: HeadphonesIcon,
    title: "Support",
    description: "Round-the-clock customer support in multiple languages"
  },
  {
    icon: MapPin,
    title: "300+ Routes",
    description: "Extensive network covering major cities across Europe"
  },
  {
    icon: Star,
    title: "Quality Service",
    description: "Premium buses with comfortable seats and modern amenities"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Starlines?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to making your bus travel experience comfortable, convenient, and reliable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group hover:scale-105"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;