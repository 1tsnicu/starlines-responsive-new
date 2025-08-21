import { Smartphone, Download, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AppCTA = () => {
  const appFeatures = [
    "Real-time bus tracking",
    "Instant booking & e-tickets",
    "Push notifications for delays",
    "Offline route maps",
    "24/7 customer support",
    "Loyalty rewards program"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Mobile App
              </Badge>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Travel Smarter with Our Mobile App
            </h2>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Download the Starlines app for a seamless travel experience. Book tickets, 
              track your bus, and manage your journeys all from your smartphone.
            </p>

            {/* App Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {appFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success fill-success" />
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-warning fill-warning" />
                ))}
              </div>
              <span className="text-white/90">
                <strong>4.8</strong> from 2,500+ reviews
              </span>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
              >
                <Download className="h-5 w-5 mr-2" />
                Download for iOS
              </Button>
              
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
              >
                <Download className="h-5 w-5 mr-2" />
                Download for Android
              </Button>
            </div>

            <p className="text-sm text-white/70">
              Available on App Store and Google Play Store
            </p>
          </div>

          {/* Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Mockup */}
              <div className="relative w-64 h-96 bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[2.5rem] overflow-hidden">
                  {/* App Screen Mockup */}
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-primary text-white p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="h-6 w-6 fill-white" />
                        <span className="text-lg font-bold">Starlines</span>
                      </div>
                      <p className="text-xs opacity-90">Your Journey, Our Priority</p>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Chișinău → București</span>
                          <Badge variant="outline" className="text-xs">Today</Badge>
                        </div>
                        <div className="text-xs text-gray-500">Departure: 08:00 • Duration: 8h 30m</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Track Bus</span>
                          <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-xs text-gray-500">ETA: 16:30 • On time</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">My Tickets</span>
                          <Badge variant="secondary" className="text-xs">2 Active</Badge>
                        </div>
                        <div className="text-xs text-gray-500">Next trip: Tomorrow</div>
                      </div>
                    </div>
                    
                    {/* Bottom Navigation */}
                    <div className="bg-white border-t border-gray-200 p-3">
                      <div className="flex justify-around text-xs text-gray-600">
                        <div className="text-center">
                          <div className="w-6 h-6 bg-primary rounded-full mx-auto mb-1"></div>
                          <span>Home</span>
                        </div>
                        <div className="text-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full mx-auto mb-1"></div>
                          <span>Search</span>
                        </div>
                        <div className="text-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full mx-auto mb-1"></div>
                          <span>Tickets</span>
                        </div>
                        <div className="text-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full mx-auto mb-1"></div>
                          <span>Profile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-warning rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">🚌</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppCTA;
