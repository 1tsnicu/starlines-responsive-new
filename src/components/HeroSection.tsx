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

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-16 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,114.44-6.21,165.39,12.43,39.15,18.85,74.62,49.75,105.84,89.21,33.43,41.72,76.19,86.25,117.5,113.15,73.84,49.98,177.54,36.37,240.54,11.35C1006.79,115.6,996.69,111.07,1000,85.22V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;