// Mock data service for Starlines UI
// This provides fake data for development without backend

export interface City {
  id: string;
  name: string;
  country: string;
  code: string;
}

export interface Route {
  id: string;
  from: City;
  to: City;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  operator: string;
  rating: number;
  reviews: number;
  amenities: string[];
  frequency: string;
  stops: number;
}

export interface Trip {
  id: string;
  route: Route;
  date: string;
  availableSeats: number;
  fareTypes: FareType[];
}

export interface FareType {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  refundable: boolean;
  changeable: boolean;
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
}

// Pricing System Interfaces
export interface PricingFactors {
  basePrice: number;
  distanceMultiplier: number;
  fuelCost: number;
  marketDemand: number;
  seasonality: number;
  competition: number;
  amenities: number;
  operator: number;
}

export interface PriceBreakdown {
  basePrice: number;
  distanceCost: number;
  fuelSurcharge: number;
  marketAdjustment: number;
  seasonalityAdjustment: number;
  competitionAdjustment: number;
  amenitiesCost: number;
  operatorFee: number;
  total: number;
  currency: string;
}

export interface PaymentInfo {
  routeId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  destinationAccount: 'starlines' | 'infobus';
}

// Mock cities data
export const cities: City[] = [
  { id: "1", name: "Chișinău", country: "Moldova", code: "KIV" },
  { id: "2", name: "București", country: "Romania", code: "BUH" },
  { id: "3", name: "Istanbul", country: "Turkey", code: "IST" },
  { id: "4", name: "Moscow", country: "Russia", code: "MOW" },
  { id: "5", name: "Kiev", country: "Ukraine", code: "KIE" },
  { id: "6", name: "Warsaw", country: "Poland", code: "WAW" },
  { id: "7", name: "Budapest", country: "Hungary", code: "BUD" },
  { id: "8", name: "Prague", country: "Czech Republic", code: "PRG" },
  { id: "9", name: "Vienna", country: "Austria", code: "VIE" },
  { id: "10", name: "Berlin", country: "Germany", code: "BER" },
];

// Mock routes data
export const routes: Route[] = [
  {
    id: "1",
    from: cities[0],
    to: cities[1],
    departureTime: "08:00",
    arrivalTime: "16:30",
    duration: "8h 30m",
    price: 45,
    currency: "EUR",
    operator: "Starlines Express",
    rating: 4.8,
    reviews: 1247,
    amenities: ["WiFi", "USB", "WC", "AC"],
    frequency: "Daily",
    stops: 2
  },
  {
    id: "2",
    from: cities[0],
    to: cities[2],
    departureTime: "20:00",
    arrivalTime: "18:15",
    duration: "22h 15m",
    price: 89,
    currency: "EUR",
    operator: "Starlines Premium",
    rating: 4.7,
    reviews: 892,
    amenities: ["WiFi", "USB", "WC", "AC", "Entertainment"],
    frequency: "Daily",
    stops: 3
  },
  {
    id: "3",
    from: cities[0],
    to: cities[9],
    departureTime: "06:00",
    arrivalTime: "20:00",
    duration: "14h",
    price: 75,
    currency: "EUR",
    operator: "Starlines Express",
    rating: 4.9,
    reviews: 1567,
    amenities: ["WiFi", "USB", "WC", "AC", "Refreshments"],
    frequency: "Daily",
    stops: 2
  }
];

// Mock fare types
export const fareTypes: FareType[] = [
  {
    id: "1",
    name: "Economy",
    price: 45,
    currency: "EUR",
    features: ["Standard seat", "Hand luggage", "Basic amenities"],
    refundable: false,
    changeable: true
  },
  {
    id: "2",
    name: "Premium",
    price: 65,
    currency: "EUR",
    features: ["Premium seat", "Extra legroom", "Priority boarding", "Refreshments"],
    refundable: true,
    changeable: true
  },
  {
    id: "3",
    name: "Business",
    price: 95,
    currency: "EUR",
    features: ["Business seat", "Maximum comfort", "Premium amenities", "Flexible changes"],
    refundable: true,
    changeable: true
  }
];

// Mock passengers
export const passengers: Passenger[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1990-05-15",
    nationality: "Moldova",
    documentType: "Passport",
    documentNumber: "MD1234567"
  }
];

// Mock search results
export const searchRoutes = async (from: string, to: string, date: string, passengers: number): Promise<Route[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter routes based on search criteria
  const filteredRoutes = routes.filter(route => {
    const fromMatch = route.from.name.toLowerCase().includes(from.toLowerCase()) ||
                     route.from.country.toLowerCase().includes(from.toLowerCase());
    const toMatch = route.to.name.toLowerCase().includes(to.toLowerCase()) ||
                   route.to.country.toLowerCase().includes(to.toLowerCase());
    
    return fromMatch && toMatch;
  });
  
  // If no exact matches, return demo routes for demonstration
  if (filteredRoutes.length === 0) {
    return routes.slice(0, 3); // Return first 3 routes for demo
  }
  
  return filteredRoutes;
};

// Mock OTP verification
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OTP verification (always returns true for demo)
  return otp === "123456";
};

// Mock payment status
export const getPaymentStatus = async (orderId: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock payment statuses
  const statuses = ["pending", "processing", "completed", "failed"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Mock ticket lookup
export const lookupTicket = async (orderNumber: string, securityCode: string): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock ticket data
  return {
    orderNumber,
    status: "confirmed",
    route: routes[0],
    passengers: [
      { firstName: "John", lastName: "Doe", seat: "12A" }
    ],
    departureDate: "2024-01-20",
    totalPrice: 45,
    currency: "EUR"
  };
};

// Mock promo codes
export const validatePromoCode = async (code: string): Promise<{ valid: boolean; discount: number; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const validCodes: Record<string, { discount: number; message: string }> = {
    "WELCOME20": { discount: 20, message: "Welcome discount applied!" },
    "SAVE15": { discount: 15, message: "Save 15% on your journey!" },
    "FIRST10": { discount: 10, message: "First time booking discount!" }
  };
  
  const promo = validCodes[code.toUpperCase()];
  
  if (promo) {
    return { valid: true, ...promo };
  }
  
  return { valid: false, discount: 0, message: "Invalid promo code" };
};

// InfoBus Route Interface
export interface InfoBusRoute {
  id: string;
  from: string;
  to: string;
  operator: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: {
    economy: number;
    premium: number;
    business: number;
  };
  frequency: string;
  amenities: string[];
  isHidden: boolean;
  isCustom: boolean;
  lastUpdated: string;
  paymentDestination: 'starlines' | 'infobus';
  pricingBreakdown?: PriceBreakdown;
}

// Pricing System Implementation
export class PricingEngine {
  private static instance: PricingEngine;
  
  // Base pricing factors
  private basePricingFactors: Record<string, PricingFactors> = {
    "Chișinău-Berlin": {
      basePrice: 25,
      distanceMultiplier: 1.2,
      fuelCost: 0.15,
      marketDemand: 1.1,
      seasonality: 1.0,
      competition: 0.95,
      amenities: 1.05,
      operator: 1.0
    },
    "Chișinău-Munich": {
      basePrice: 28,
      distanceMultiplier: 1.25,
      fuelCost: 0.16,
      marketDemand: 1.15,
      seasonality: 1.05,
      competition: 0.92,
      amenities: 1.08,
      operator: 1.0
    },
    "Chișinău-Frankfurt": {
      basePrice: 30,
      distanceMultiplier: 1.3,
      fuelCost: 0.17,
      marketDemand: 1.2,
      seasonality: 1.1,
      competition: 0.90,
      amenities: 1.1,
      operator: 1.0
    },
    "Chișinău-Viena": {
      basePrice: 22,
      distanceMultiplier: 1.15,
      fuelCost: 0.14,
      marketDemand: 1.05,
      seasonality: 1.0,
      competition: 0.98,
      amenities: 1.03,
      operator: 1.0
    },
    "Chișinău-Warsaw": {
      basePrice: 20,
      distanceMultiplier: 1.1,
      fuelCost: 0.13,
      marketDemand: 1.0,
      seasonality: 0.95,
      competition: 1.0,
      amenities: 1.0,
      operator: 1.0
    }
  };

  // Distance matrix (approximate km)
  private distanceMatrix: Record<string, number> = {
    "Chișinău-Berlin": 1200,
    "Chișinău-Munich": 1350,
    "Chișinău-Frankfurt": 1400,
    "Chișinău-Viena": 1100,
    "Chișinău-Warsaw": 800,
    "Chișinău-Prague": 1000,
    "Chișinău-București": 400,
    "Chișinău-Istanbul": 800,
    "Chișinău-Roma": 1800,
    "Chișinău-Milan": 1700,
    "Chișinău-Paris": 2000,
    "Chișinău-London": 2200
  };

  // Fuel price per km (EUR)
  private fuelPricePerKm = 0.12;

  // Amenities cost mapping
  private amenitiesCost: Record<string, number> = {
    "WiFi": 2,
    "USB Charging": 1,
    "WC": 0,
    "Refreshments": 3,
    "Entertainment": 5,
    "Reclining Seats": 8,
    "Premium Service": 10,
    "AC": 1,
    "Priority Boarding": 3,
    "Extra Legroom": 5
  };

  private constructor() {}

  public static getInstance(): PricingEngine {
    if (!PricingEngine.instance) {
      PricingEngine.instance = new PricingEngine();
    }
    return PricingEngine.instance;
  }

  // Calculate price for a custom route
  public calculatePrice(from: string, to: string, amenities: string[], operator: string = "Starlines Custom"): PriceBreakdown {
    const routeKey = `${from}-${to}`;
    const distance = this.distanceMatrix[routeKey] || this.estimateDistance(from, to);
    
    // Get base pricing factors or use defaults
    const factors = this.basePricingFactors[routeKey] || {
      basePrice: 25,
      distanceMultiplier: 1.2,
      fuelCost: 0.15,
      marketDemand: 1.0,
      seasonality: 1.0,
      competition: 0.95,
      amenities: 1.0,
      operator: 1.0
    };

    // Calculate base price
    const basePrice = factors.basePrice;
    
    // Distance cost
    const distanceCost = (distance / 100) * factors.distanceMultiplier;
    
    // Fuel surcharge
    const fuelSurcharge = distance * this.fuelPricePerKm * factors.fuelCost;
    
    // Market demand adjustment
    const marketAdjustment = basePrice * (factors.marketDemand - 1);
    
    // Seasonality adjustment (higher in summer, lower in winter)
    const currentMonth = new Date().getMonth();
    const seasonalityMultiplier = currentMonth >= 5 && currentMonth <= 8 ? 1.15 : 0.95;
    const seasonalityAdjustment = basePrice * (seasonalityMultiplier - 1) * factors.seasonality;
    
    // Competition adjustment
    const competitionAdjustment = basePrice * (factors.competition - 1);
    
    // Amenities cost
    const amenitiesCost = amenities.reduce((total, amenity) => {
      return total + (this.amenitiesCost[amenity] || 0);
    }, 0) * factors.amenities;
    
    // Operator fee (Starlines gets higher margin for custom routes)
    const operatorFee = operator === "Starlines Custom" ? basePrice * 0.3 : basePrice * 0.1;
    
    // Calculate total
    const total = basePrice + distanceCost + fuelSurcharge + marketAdjustment + 
                  seasonalityAdjustment + competitionAdjustment + amenitiesCost + operatorFee;

    return {
      basePrice: Math.round(basePrice * 100) / 100,
      distanceCost: Math.round(distanceCost * 100) / 100,
      fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
      marketAdjustment: Math.round(marketAdjustment * 100) / 100,
      seasonalityAdjustment: Math.round(seasonalityAdjustment * 100) / 100,
      competitionAdjustment: Math.round(competitionAdjustment * 100) / 100,
      amenitiesCost: Math.round(amenitiesCost * 100) / 100,
      operatorFee: Math.round(operatorFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency: "EUR"
    };
  }

  // Estimate distance for unknown routes
  private estimateDistance(from: string, to: string): number {
    // Simple estimation based on country/region
    const fromCountry = this.getCountry(from);
    const toCountry = this.getCountry(to);
    
    if (fromCountry === "Moldova" && toCountry === "Germany") return 1300;
    if (fromCountry === "Moldova" && toCountry === "Austria") return 1100;
    if (fromCountry === "Moldova" && toCountry === "Poland") return 800;
    if (fromCountry === "Moldova" && toCountry === "Romania") return 400;
    if (fromCountry === "Moldova" && toCountry === "Italy") return 1800;
    if (fromCountry === "Moldova" && toCountry === "France") return 2000;
    if (fromCountry === "Moldova" && toCountry === "UK") return 2200;
    
    // Default estimation
    return 1000;
  }

  private getCountry(city: string): string {
    const cityData = cities.find(c => c.name === city);
    return cityData?.country || "Unknown";
  }

  // Get pricing factors for a route
  public getPricingFactors(from: string, to: string): PricingFactors | null {
    const routeKey = `${from}-${to}`;
    return this.basePricingFactors[routeKey] || null;
  }

  // Update pricing factors (for admin use)
  public updatePricingFactors(from: string, to: string, factors: Partial<PricingFactors>): void {
    const routeKey = `${from}-${to}`;
    if (this.basePricingFactors[routeKey]) {
      this.basePricingFactors[routeKey] = { ...this.basePricingFactors[routeKey], ...factors };
    } else {
      this.basePricingFactors[routeKey] = {
        basePrice: 25,
        distanceMultiplier: 1.2,
        fuelCost: 0.15,
        marketDemand: 1.0,
        seasonality: 1.0,
        competition: 0.95,
        amenities: 1.0,
        operator: 1.0,
        ...factors
      };
    }
  }
}

// Payment Processing System
export class PaymentProcessor {
  private static instance: PaymentProcessor;
  private payments: PaymentInfo[] = [];

  private constructor() {}

  public static getInstance(): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor();
    }
    return PaymentProcessor.instance;
  }

  // Process payment for a route
  public async processPayment(
    routeId: string, 
    amount: number, 
    currency: string, 
    paymentMethod: string
  ): Promise<PaymentInfo> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

    const payment: PaymentInfo = {
      routeId,
      amount,
      currency,
      paymentMethod,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      destinationAccount: 'starlines' // ALL payments now go to Starlines account
    };

    this.payments.push(payment);
    return payment;
  }

  // Get payment history
  public getPaymentHistory(): PaymentInfo[] {
    return [...this.payments];
  }

  // Get payments by route
  public getPaymentsByRoute(routeId: string): PaymentInfo[] {
    return this.payments.filter(p => p.routeId === routeId);
  }

  // Get total revenue for Starlines (now includes ALL routes)
  public getStarlinesRevenue(): { total: number; currency: string } {
    // Since all payments now go to Starlines, return total of all payments
    const total = this.payments.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      total: Math.round(total * 100) / 100,
      currency: "EUR"
    };
  }

  // Get revenue breakdown by route type
  public getRevenueBreakdown(): {
    infobusRoutes: number;
    customRoutes: number;
    total: number;
    currency: string;
  } {
    const infobusPayments = this.payments.filter(p => {
      const route = [...infoBusRoutes, ...customRoutes].find(r => r.id === p.routeId);
      return route && !route.isCustom;
    });
    
    const customPayments = this.payments.filter(p => {
      const route = [...infoBusRoutes, ...customRoutes].find(r => r.id === p.routeId);
      return route && route.isCustom;
    });

    return {
      infobusRoutes: Math.round(infobusPayments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      customRoutes: Math.round(customPayments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      total: Math.round(this.payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      currency: "EUR"
    };
  }
}

// Initialize pricing engine and payment processor
export const pricingEngine = PricingEngine.getInstance();
export const paymentProcessor = PaymentProcessor.getInstance();

// InfoBus Mock Data
export const infoBusRoutes: InfoBusRoute[] = [
  // Moldova - Germania
  {
    id: "md-de-1",
    from: "Chișinău",
    to: "Berlin",
    operator: "InfoBus",
    departureTime: "08:00",
    arrivalTime: "22:00",
    duration: "14h",
    price: { economy: 85, premium: 120, business: 180 },
    frequency: "Daily",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Berlin", ["WiFi", "USB Charging", "WC", "Refreshments"], "InfoBus")
  },
  {
    id: "md-de-2",
    from: "Chișinău",
    to: "Munich",
    operator: "InfoBus",
    departureTime: "10:30",
    arrivalTime: "01:30",
    duration: "15h",
    price: { economy: 90, premium: 130, business: 190 },
    frequency: "Daily",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Munich", ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment"], "InfoBus")
  },
  {
    id: "md-de-3",
    from: "Chișinău",
    to: "Frankfurt",
    operator: "InfoBus",
    departureTime: "12:00",
    arrivalTime: "03:00",
    duration: "15h",
    price: { economy: 95, premium: 135, business: 195 },
    frequency: "Daily",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Frankfurt", ["WiFi", "USB Charging", "WC", "Refreshments"], "InfoBus")
  },
  // Moldova - România
  {
    id: "md-ro-1",
    from: "Chișinău",
    to: "București",
    operator: "InfoBus",
    departureTime: "06:00",
    arrivalTime: "14:00",
    duration: "8h",
    price: { economy: 25, premium: 35, business: 50 },
    frequency: "Multiple daily",
    amenities: ["WiFi", "USB Charging", "WC"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "București", ["WiFi", "USB Charging", "WC"], "InfoBus")
  },
  {
    id: "md-ro-2",
    from: "Chișinău",
    to: "Cluj-Napoca",
    operator: "InfoBus",
    departureTime: "07:30",
    arrivalTime: "18:30",
    duration: "11h",
    price: { economy: 30, premium: 40, business: 55 },
    frequency: "Daily",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Cluj-Napoca", ["WiFi", "USB Charging", "WC", "Refreshments"], "InfoBus")
  },
  // Moldova - Italia
  {
    id: "md-it-1",
    from: "Chișinău",
    to: "Roma",
    operator: "InfoBus",
    departureTime: "09:00",
    arrivalTime: "06:00",
    duration: "21h",
    price: { economy: 110, premium: 150, business: 220 },
    frequency: "3x weekly",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", "Reclining Seats"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Roma", ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", "Reclining Seats"], "InfoBus")
  },
  {
    id: "md-it-2",
    from: "Chișinău",
    to: "Milan",
    operator: "InfoBus",
    departureTime: "11:00",
    arrivalTime: "08:00",
    duration: "21h",
    price: { economy: 105, premium: 145, business: 210 },
    frequency: "2x weekly",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Milan", ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment"], "InfoBus")
  },
  // Moldova - Franța
  {
    id: "md-fr-1",
    from: "Chișinău",
    to: "Paris",
    operator: "InfoBus",
    departureTime: "13:00",
    arrivalTime: "12:00",
    duration: "23h",
    price: { economy: 120, premium: 165, business: 240 },
    frequency: "Weekly",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", "Reclining Seats", "Premium Service"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Paris", ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", "Reclining Seats", "Premium Service"], "InfoBus")
  },
  // Moldova - UK
  {
    id: "md-uk-1",
    from: "Chișinău",
    to: "London",
    operator: "InfoBus",
    departureTime: "15:00",
    arrivalTime: "14:00",
    duration: "23h",
    price: { economy: 130, premium: 180, business: 260 },
    frequency: "Weekly",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", "Reclining Seats", "Premium Service"],
    isHidden: false,
    isCustom: false,
    lastUpdated: "2024-01-15",
    paymentDestination: "starlines", // Changed: All routes now go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "London", ["WiFi", "USB Charging", "WC", "Refreshments", "Entertainment", "Reclining Seats", "Premium Service"], "InfoBus")
  }
];

// Custom Routes (added by admin)
export const customRoutes: InfoBusRoute[] = [
  {
    id: "custom-1",
    from: "Chișinău",
    to: "Viena",
    operator: "Starlines Custom",
    departureTime: "14:00",
    arrivalTime: "04:00",
    duration: "14h",
    price: { economy: 100, premium: 140, business: 200 },
    frequency: "2x weekly",
    amenities: ["WiFi", "USB Charging", "WC", "Refreshments", "Premium Service"],
    isHidden: false,
    isCustom: true,
    lastUpdated: "2024-01-20",
    paymentDestination: "starlines", // All custom routes go to Starlines
    pricingBreakdown: pricingEngine.calculatePrice("Chișinău", "Viena", ["WiFi", "USB Charging", "WC", "Refreshments", "Premium Service"])
  }
];

// InfoBus API Mock Functions
export const infoBusAPI = {
  // Get all routes (including hidden ones for admin)
  getAllRoutes: async (): Promise<InfoBusRoute[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...infoBusRoutes, ...customRoutes];
  },

  // Get visible routes only (for public display)
  getVisibleRoutes: async (): Promise<InfoBusRoute[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...infoBusRoutes, ...customRoutes].filter(route => !route.isHidden);
  },

  // Get routes by country
  getRoutesByCountry: async (country: string): Promise<InfoBusRoute[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const allRoutes = [...infoBusRoutes, ...customRoutes];
    return allRoutes.filter(route => 
      route.to.toLowerCase().includes(country.toLowerCase()) && !route.isHidden
    );
  },

  // Hide/Show route
  toggleRouteVisibility: async (routeId: string, isHidden: boolean): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find route in InfoBus routes
    const infoBusRoute = infoBusRoutes.find(r => r.id === routeId);
    if (infoBusRoute) {
      infoBusRoute.isHidden = isHidden;
      infoBusRoute.lastUpdated = new Date().toISOString().split('T')[0];
      return true;
    }
    
    // Find route in custom routes
    const customRoute = customRoutes.find(r => r.id === routeId);
    if (customRoute) {
      customRoute.isHidden = isHidden;
      customRoute.lastUpdated = new Date().toISOString().split('T')[0];
      return true;
    }
    
    return false;
  },

  // Add custom route with automatic pricing
  addCustomRoute: async (route: Omit<InfoBusRoute, 'id' | 'isCustom' | 'lastUpdated' | 'paymentDestination' | 'pricingBreakdown'>): Promise<InfoBusRoute> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Calculate automatic pricing
    const pricingBreakdown = pricingEngine.calculatePrice(route.from, route.to, route.amenities, route.operator);
    
    const newRoute: InfoBusRoute = {
      ...route,
      id: `custom-${Date.now()}`,
      isCustom: true,
      lastUpdated: new Date().toISOString().split('T')[0],
      paymentDestination: 'starlines', // All custom routes go to Starlines
      pricingBreakdown
    };
    
    // Update prices based on calculated breakdown
    newRoute.price = {
      economy: Math.round(pricingBreakdown.total * 0.8),
      premium: Math.round(pricingBreakdown.total * 1.1),
      business: Math.round(pricingBreakdown.total * 1.4)
    };
    
    customRoutes.push(newRoute);
    return newRoute;
  },

  // Update custom route
  updateCustomRoute: async (routeId: string, updates: Partial<InfoBusRoute>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const route = customRoutes.find(r => r.id === routeId);
    if (route) {
      // If route details changed, recalculate pricing
      if (updates.from || updates.to || updates.amenities || updates.operator) {
        const newPricingBreakdown = pricingEngine.calculatePrice(
          updates.from || route.from,
          updates.to || route.to,
          updates.amenities || route.amenities,
          updates.operator || route.operator
        );
        
        updates.pricingBreakdown = newPricingBreakdown;
        updates.price = {
          economy: Math.round(newPricingBreakdown.total * 0.8),
          premium: Math.round(newPricingBreakdown.total * 1.1),
          business: Math.round(newPricingBreakdown.total * 1.4)
        };
      }
      
      Object.assign(route, updates);
      route.lastUpdated = new Date().toISOString().split('T')[0];
      return true;
    }
    
    return false;
  },

  // Delete custom route
  deleteCustomRoute: async (routeId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = customRoutes.findIndex(r => r.id === routeId);
    if (index !== -1) {
      customRoutes.splice(index, 1);
      return true;
    }
    
    return false;
  },

  // Get route statistics
  getRouteStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allRoutes = [...infoBusRoutes, ...customRoutes];
    const visibleRoutes = allRoutes.filter(r => !r.isHidden);
    
    return {
      total: allRoutes.length,
      visible: visibleRoutes.length,
      hidden: allRoutes.length - visibleRoutes.length,
      custom: customRoutes.length,
      countries: [...new Set(allRoutes.map(r => r.to))].length,
      operators: [...new Set(allRoutes.map(r => r.operator))].length
    };
  },

  // Get pricing breakdown for a route
  getPricingBreakdown: async (routeId: string): Promise<PriceBreakdown | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const route = [...infoBusRoutes, ...customRoutes].find(r => r.id === routeId);
    return route?.pricingBreakdown || null;
  },

  // Get pricing factors for a route
  getPricingFactors: async (from: string, to: string): Promise<PricingFactors | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return pricingEngine.getPricingFactors(from, to);
  },

  // Update pricing factors
  updatePricingFactors: async (from: string, to: string, factors: Partial<PricingFactors>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      pricingEngine.updatePricingFactors(from, to, factors);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Process payment for a route
  processPayment: async (routeId: string, amount: number, currency: string, paymentMethod: string): Promise<PaymentInfo> => {
    return await paymentProcessor.processPayment(routeId, amount, currency, paymentMethod);
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentInfo[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return paymentProcessor.getPaymentHistory();
  },

  // Get Starlines revenue
  getStarlinesRevenue: async (): Promise<{ total: number; currency: string }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return paymentProcessor.getStarlinesRevenue();
  },

  // Get revenue breakdown by route type
  getRevenueBreakdown: async (): Promise<{
    infobusRoutes: number;
    customRoutes: number;
    total: number;
    currency: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return paymentProcessor.getRevenueBreakdown();
  }
};
