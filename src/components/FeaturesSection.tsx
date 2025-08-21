import { Shield, Clock, Users, MapPin, Wifi, CreditCard, Smartphone, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/contexts/LocalizationContext";

const FeaturesSection = () => {
  const { t } = useLocalization();
const features = [
  {
    icon: Shield,
      title: t('features.securePayments'),
      description: t('features.securePaymentsDesc'),
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
  },
  {
    icon: Clock,
      title: t('features.flexibleReturns'),
      description: t('features.flexibleReturnsDesc'),
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: Users,
      title: t('features.support'),
      description: t('features.supportDesc'),
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: MapPin,
      title: t('features.destinations'),
      description: t('features.destinationsDesc'),
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: Wifi,
      title: t('features.modernAmenities'),
      description: t('features.modernAmenitiesDesc'),
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
  },
  {
    icon: CreditCard,
      title: t('features.paymentOptions'),
      description: t('features.paymentOptionsDesc'),
      color: "from-teal-500 to-green-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
    },
    {
      icon: Smartphone,
      title: t('features.mobileApp'),
      description: t('features.mobileAppDesc'),
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      icon: Globe,
      title: t('features.multilingual'),
      description: t('features.multilingualDesc'),
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-surface/50 via-background to-surface/50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-secondary/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-primary/10 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-accent/10 rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 border border-secondary/10 rounded-full" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">{t('features.title')}</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`${feature.bgColor} ${feature.borderColor} border-2 hover-lift group relative overflow-hidden`}
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-accent/20 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-secondary/20 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />
              
              <CardContent className="p-6 text-center relative z-10">
                {/* Icon with gradient background */}
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
              </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
                
                <p className="text-foreground/70 text-sm leading-relaxed">
                {feature.description}
              </p>
                
                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom decorative section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">15+ Years Experience</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">2M+ Happy Customers</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;