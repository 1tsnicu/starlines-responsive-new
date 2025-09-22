import SearchForm from "./SearchForm";
import { Star, MapPin, Clock, Shield, Users, Zap, Heart, Award } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";
import heroBg from "@/images/Gemini_Generated_Image_ai1l7xai1l7xai1l.png";

const HeroSection = () => {
  const { t } = useLocalization();
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Background image layer */}
        <div
          className="absolute inset-0 bg-center bg-cover opacity-40 md:opacity-50 lg:opacity-60"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px] opacity-5 md:opacity-10" />
        
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
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:15px_15px]" />
      </div>

      <div className="container relative z-10 py-12 lg:py-20">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-8 lg:mb-12">
          <div className="flex justify-center mb-4 lg:mb-6">
            <div className="flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Star className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
            {t('hero.title')}{" "}
            <span className="text-accent-foreground bg-accent px-3 py-1 lg:px-4 lg:py-2 rounded-2xl inline-block transform rotate-1 text-sm sm:text-base lg:text-lg xl:text-xl">
              Starlines
            </span>
          </h1>
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

        {/* Enhanced USP Bar removed per request */}

        
        <div className="absolute bottom-20 left-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-foreground">{t('hero.fastBooking')}</span>
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