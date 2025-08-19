import SearchForm from "./SearchForm";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Travel Smarter,
            <br />
            <span className="text-accent">Journey Better</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Book comfortable bus tickets to 300+ destinations across Europe. 
            Safe payments, instant booking, and 24/7 support.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">300+ Routes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">Instant Booking</span>
            </div>
          </div>
        </div>
        
        <div className="animate-slide-up">
          <SearchForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;