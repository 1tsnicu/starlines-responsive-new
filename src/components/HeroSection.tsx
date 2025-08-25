import SearchForm from "./SearchForm";
import { Star, MapPin, Clock, Shield, Users, Zap, Heart, Award } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

const HeroSection = () => {
  const { t } = useLocalization();
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Floating icons */}
        <div className="absolute top-20 left-20 text-white/10">
          <Star className="h-16 w-16" />
        </div>
        <div className="absolute top-40 right-32 text-white/10">
          <MapPin className="h-12 w-12" />
        </div>
        <div className="absolute bottom-20 left-32 text-white/10">
          <Clock className="h-14 w-14" />
        </div>
        
        {/* Subtle dots */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:15px_15px]" />
      </div>

      <div className="container relative z-10 py-20">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Star className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {t('hero.title')}{" "}
            <span className="text-accent-foreground bg-accent px-4 py-2 rounded-2xl inline-block transform rotate-1">
              Starlines
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: MapPin, value: "300+", label: t('hero.routes') },
              { icon: Users, value: "2M+", label: t('hero.passengers') },
              { icon: Clock, value: "24/7", label: t('hero.support') },
              { icon: Shield, value: "100%", label: t('hero.secure') }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Form with enhanced styling */}
        <div className="relative max-w-4xl mx-auto">
          <SearchForm />
          
          {/* Decorative elements around search form */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-accent-foreground/30 rounded-tl-lg" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-accent-foreground/30 rounded-tr-lg" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-accent-foreground/30 rounded-bl-lg" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-accent-foreground/30 rounded-br-lg" />
        </div>

        {/* Enhanced USP Bar */}
        <div className="mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Secure Payment",
                  description: "SSL encrypted transactions"
                },
                {
                  icon: Clock,
                  title: "Flexible Return",
                  description: "Easy cancellation policy"
                },
                {
                  icon: Users,
                  title: "24/7 Support",
                  description: "Always here to help"
                },
                {
                  icon: MapPin,
                  title: "300+ Destinations",
                  description: "Coverage across Europe"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                      <feature.icon className="h-6 w-6 text-accent-foreground" />
                    </div>
            </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/80">{feature.description}</p>
              </div>
              ))}
            </div>
              </div>
            </div>

        {/* Floating trust badges */}
        <div className="absolute top-10 right-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium text-foreground">Trusted by 2M+ travelers</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-20 left-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-foreground">Lightning-fast booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave - redesigned */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          className="w-full h-20 text-background" 
          viewBox="0 0 1200 160" 
          preserveAspectRatio="none"
          style={{ filter: 'drop-shadow(0 -4px 8px rgba(0,0,0,0.1))' }}
        >
          {/* Main wave - smooth curve */}
          <path 
            d="M0,160 L0,80 Q300,40 600,80 T1200,80 L1200,160 Z" 
            fill="currentColor"
            opacity="0.95"
          />
          
          {/* Secondary wave - subtle overlay */}
          <path 
            d="M0,160 L0,90 Q200,60 400,90 T800,90 T1200,90 L1200,160 Z" 
            fill="currentColor"
            opacity="0.7"
          />
          
          {/* Accent wave - thin line */}
          <path 
            d="M0,160 L0,100 Q150,80 300,100 T600,100 T900,100 T1200,100 L1200,160 Z" 
            fill="currentColor"
            opacity="0.4"
          />
          
          {/* Bottom edge - smooth finish */}
          <path 
            d="M0,160 L1200,160 Z" 
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;