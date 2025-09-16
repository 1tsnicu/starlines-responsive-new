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
export interface TicketLookupResult {
  orderNumber: string;
  status: string;
  route: Route;
  passengers: Array<{
    firstName: string;
    lastName: string;
    seat: string;
  }>;
  departureDate: string;
  totalPrice: number;
  currency: string;
}

export const lookupTicket = async (orderNumber: string, securityCode: string): Promise<TicketLookupResult> => {
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

// Bussystem API Mock Functions
// These provide compatibility with the real Bussystem API

// Types for compatibility with bussystem.ts
export interface BussystemPassenger {
  first_name: string;
  last_name: string;
  seat_number: string;
  seat_no?: string;
  price: number;
  phone?: string;
  document_type?: string;
  document_number?: string;
  birth_date?: string;
  gender?: string;
}

export interface BussystemOrderInfo {
  order_id: string;
  security?: string;
  lock_min?: number;
  status?: string;
  price?: number;
  currency?: string;
  passengers?: BussystemPassenger[];
}

export interface BussystemTicketInfo {
  ticket_id?: string;
  order_id?: string;
  status?: string;
  price?: number;
  currency?: string;
  passenger_info?: BussystemPassenger;
}

export interface BussystemPoint {
  point_id: string;
  point_ru_name: string | null;
  point_ua_name: string | null;
  point_latin_name: string | null;
  point_name: string | null;
  country_name: string | null;
  country_kod: string | null;
  country_id: string | null;
  point_name_detail: string | null;
  priority: string | null;
}

export interface BussystemRoute {
  trans: "bus" | "train" | string;
  interval_id: string;
  route_name: string;
  has_plan: 0 | 1;
  carrier?: string;
  comfort?: string;
  rating?: string;
  reviews?: string;
  logo?: string;
  timetable_id?: string;
  request_get_free_seats?: 0 | 1;
  request_get_discount?: 0 | 1;
  request_get_baggage?: 0 | 1;
  day_open?: string;
  need_orderdata?: 0 | 1;
  can_cyrillic_orderdata?: 0 | 1;
  need_birth?: 0 | 1;
  need_doc?: 0 | 1;
  need_doc_expire_date?: 0 | 1;
  need_citizenship?: 0 | 1;
  need_gender?: 0 | 1;
  need_middlename?: 0 | 1;
  lock_order?: "0" | "1";
  lock_min?: string;
  reserve_min?: string;
  max_seats?: string;
  start_sale_day?: string;
  stop_sale_hours?: number;
  cancel_free_min?: string;
  date_from: string;
  time_from: string;
  point_from: string;
  station_from?: string;
  station_from_lat?: string;
  station_from_lon?: string;
  platform_from?: string;
  date_to: string;
  time_to: string;
  point_to: string;
  station_to?: string;
  station_to_lat?: string;
  station_to_lon?: string;
  platform_to?: string;
  time_in_way?: string;
  price_one_way?: string;
  price_one_way_max?: string;
  price_two_way?: string;
  currency?: string;
  bonus_eur?: string;
  discounts?: Array<{
    discount_id: string;
    discount_name: string;
    discount_price: number;
  }>;
  free_seats?: Array<number | string>;
  luggage?: string;
  route_info?: string;
  cancel_hours_info?: Array<{
    hours_after_depar: string;
    hours_before_depar: string;
    cancel_rate: string;
    money_back: string;
  }>;
  trips?: Array<{
    interval_id: string;
    route_name: string;
    carrier?: string;
  }>;
}

// Mock Bussystem API implementation
export const mockBussystemAPI = {
  // Get points for autocomplete
  getPoints: async (params: {
    autocomplete?: string;
    lang?: string;
    session?: string;
  }): Promise<BussystemPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockPoints: BussystemPoint[] = [
      {
        point_id: "1",
        point_name: "Chișinău",
        point_ru_name: "Кишинев",
        point_ua_name: "Кишинів",
        point_latin_name: "Chisinau",
        country_name: "Moldova",
        country_kod: "MDA",
        country_id: "1",
        point_name_detail: "Central Bus Station",
        priority: "1"
      },
      {
        point_id: "4",
        point_name: "Chișinău Aeroportul",
        point_ru_name: "Кишинев аэропорт",
        point_ua_name: "Кишинів аеропорт",
        point_latin_name: "Chisinau Airport",
        country_name: "Moldova",
        country_kod: "MDA",
        country_id: "1",
        point_name_detail: "International Airport",
        priority: "2"
      },
      {
        point_id: "5",
        point_name: "Chișineu-Criș",
        point_ru_name: "Кишинеу-Криш",
        point_ua_name: "Кишинеу-Криш",
        point_latin_name: "Chisineu-Cris",
        country_name: "România",
        country_kod: "ROU",
        country_id: "2",
        point_name_detail: "Bus Station",
        priority: "3"
      },
      {
        point_id: "2",
        point_name: "București",
        point_ru_name: "Бухарест",
        point_ua_name: "Бухарест",
        point_latin_name: "Bucharest",
        country_name: "Romania",
        country_kod: "RO",
        country_id: "2",
        point_name_detail: "Gara de Nord",
        priority: "2"
      },
      {
        point_id: "6",
        point_name: "Chita",
        point_ru_name: "Чита",
        point_ua_name: "Чита",
        point_latin_name: "Chita",
        country_name: "Россия",
        country_kod: "RUS",
        country_id: "3",
        point_name_detail: "Central Station",
        priority: "4"
      },
      {
        point_id: "3",
        point_name: "Berlin",
        point_ru_name: "Берлин",
        point_ua_name: "Берлін",
        point_latin_name: "Berlin",
        country_name: "Germany",
        country_kod: "DE",
        country_id: "3",
        point_name_detail: "ZOB",
        priority: "3"
      }
    ];

    if (params.autocomplete) {
      const query = params.autocomplete.toLowerCase();
      // Only filter if query has at least 1 character
      if (query.length >= 1) {
        return mockPoints.filter(point => 
          point.point_name?.toLowerCase().startsWith(query) ||
          point.point_ru_name?.toLowerCase().startsWith(query) ||
          point.point_latin_name?.toLowerCase().startsWith(query) ||
          point.point_name?.toLowerCase().includes(query) ||
          point.point_ru_name?.toLowerCase().includes(query) ||
          point.point_latin_name?.toLowerCase().includes(query)
        );
      }
      // Return empty array for empty query
      return [];
    }

    return mockPoints;
  },

  // Get routes between points
  getRoutes: async (params: {
    date: string;
    id_from: string;
    id_to: string;
    station_id_from?: string;
    trans?: "bus" | "train";
    change?: "auto" | "no";
    currency?: string;
    lang?: string;
    v?: string;
    session?: string;
  }): Promise<BussystemRoute[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockRoutes: BussystemRoute[] = [
      {
        trans: "bus",
        interval_id: "12345",
        route_name: "Chișinău - Berlin",
        has_plan: 1,
        carrier: "MoldovaExpress",
        comfort: "wifi,220v,conditioner,music,tv",
        rating: "4.6",
        reviews: "93",
        logo: "333.png",
        request_get_free_seats: 1,
        request_get_discount: 0, // Use discounts from this response
        request_get_baggage: 1,
        need_orderdata: 1,
        can_cyrillic_orderdata: 1,
        need_birth: 1,
        need_doc: 1,
        need_doc_expire_date: 1,
        need_citizenship: 1,
        need_gender: 1,
        need_middlename: 0,
        lock_order: "1",
        lock_min: "30",
        reserve_min: "0",
        max_seats: "10",
        start_sale_day: "180",
        stop_sale_hours: 0,
        cancel_free_min: "5",
        date_from: params.date,
        time_from: "08:00:00",
        point_from: "Chișinău",
        date_to: params.date.replace(/(\d{4}-\d{2}-\d{2})/, (match) => {
          const date = new Date(match);
          date.setDate(date.getDate() + 1);
          return date.toISOString().split('T')[0];
        }),
        time_to: "22:00:00",
        point_to: "Berlin",
        time_in_way: "14:00",
        price_one_way: "75",
        price_one_way_max: "95",
        currency: "EUR",
        free_seats: [1, 2, 3, 5, 7, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30],
        luggage: "1 bag up to 20kg included",
        route_info: "Direct route with one stop in Budapest",
        // Include discounts directly in get_routes response when request_get_discount = 0
        discounts: [
          {
            discount_id: "3100",
            discount_name: "Reducere studenți",
            discount_price: 64
          },
          {
            discount_id: "3101", 
            discount_name: "Reducere pensionari",
            discount_price: 67
          }
        ]
      }
    ];

    return mockRoutes;
  },

  // Get free seats for a route
  getFreeSeats: async (params: {
    interval_id: string;
    date?: string;
    currency?: string;
    lang?: string;
    v?: string;
    session?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      trips: [
        {
          bustype_id: "bus_type_123",
          has_plan: 1 as 0 | 1,
          free_seat: [
            { seat_number: 1, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 2, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 3, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 4, seat_free: 0 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 5, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 6, seat_free: 0 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 7, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 8, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 9, seat_free: 0 as 0 | 1, seat_price: 75, seat_curency: "EUR" },
            { seat_number: 10, seat_free: 1 as 0 | 1, seat_price: 75, seat_curency: "EUR" }
          ],
          trip_name: "Chișinău → Berlin"
        }
      ]
    };
  },

  // Create new order
  // Create new order with complete payload support
  newOrder: async (payload: {
    login: string;
    password: string;
    promocode_name?: string;
    date: string[];           // pe trips
    interval_id: string[];    // pe trips
    seat: string[][];         // pe trips (array de stringuri per pasager)
    name?: string[];          // pe pasageri
    surname?: string[];       // pe pasageri
    birth_date?: string[];    // pe pasageri (YYYY-MM-DD)
    discount_id?: Array<Record<string, string>>; // pe trips
    baggage?: Record<string, string[]>; // tripIndex (string) -> array per pasager
    phone?: string;
    email?: string;
    currency?: string;
    lang?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Calculate prices based on trips and passengers
    const passengerCount = payload.seat[0]?.length || 0;
    const tripCount = payload.date.length;
    const basePrice = 75; // EUR per passenger per trip
    
    let totalPrice = passengerCount * tripCount * basePrice;
    
    // Apply discounts
    if (payload.discount_id) {
      payload.discount_id.forEach((tripDiscounts) => {
        Object.keys(tripDiscounts).forEach(() => {
          totalPrice -= 10; // Mock discount of 10 EUR per discounted passenger
        });
      });
    }
    
    // Add baggage costs
    if (payload.baggage) {
      Object.values(payload.baggage).forEach(tripBaggage => {
        tripBaggage.forEach(passengerBaggage => {
          if (passengerBaggage) {
            const baggageItems = passengerBaggage.split(',');
            totalPrice += baggageItems.length * 15; // Mock 15 EUR per baggage item
          }
        });
      });
    }
    
    // Apply promocode discount
    let promocodeDiscount = 0;
    if (payload.promocode_name === "PROMO77ENDLESS") {
      promocodeDiscount = Math.round(totalPrice * 0.15); // 15% discount
      totalPrice -= promocodeDiscount;
    }

    const response = {
      order_id: Date.now(),
      reservation_until: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      reservation_until_min: "30",
      security: `SEC_${Math.random().toString(36).substr(2, 9)}`,
      status: "reserve_ok",
      price_total: totalPrice,
      currency: payload.currency || "EUR",
      ...(payload.promocode_name ? {
        promocode_info: {
          promocode_valid: 1 as 0 | 1,
          promocode_name: payload.promocode_name,
          price_promocode: promocodeDiscount
        }
      } : {})
    };

    // Add trip details (mock structure for "0", "1" trip objects)
    payload.interval_id.forEach((intervalId, tripIndex) => {
      (response as Record<string, unknown>)[String(tripIndex)] = {
        interval_id: intervalId,
        date: payload.date[tripIndex],
        passengers: payload.seat[tripIndex].map((seat, passengerIndex) => ({
          name: payload.name?.[passengerIndex] || `Passenger${passengerIndex + 1}`,
          surname: payload.surname?.[passengerIndex] || `Surname${passengerIndex + 1}`,
          seat: seat,
          price: basePrice,
          discount_id: payload.discount_id?.[tripIndex]?.[String(passengerIndex)] || null,
          baggage: payload.baggage?.[String(tripIndex)]?.[passengerIndex] || null
        }))
      };
    });

    return response;
  },

  // Buy ticket - Complete buy_ticket endpoint with realistic response
  buyTicket: async (params: { order_id: number; lang?: string; v?: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment processing

    // Simulate occasional payment failures for testing
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Payment failed - insufficient funds');
    }

    // Generate realistic response based on order_id
    const basePrice = 75; // EUR per passenger
    const numPassengers = 2; // Typical booking
    const baggageCost = 25; // Additional baggage costs
    const totalPrice = (basePrice * numPassengers) + baggageCost;

    const response = {
      order_id: params.order_id,
      price_total: totalPrice,
      currency: "EUR",
      link: `https://test-api.bussystem.eu/viev/frame/print_ticket.php?order_id=${params.order_id}&security=722842&lang=${params.lang || 'ru'}`,
      
      // Passenger tickets (objects "0", "1", etc.)
      "0": {
        passenger_id: 0,
        transaction_id: `1038038`,
        ticket_id: `21011`,
        security: `761899`,
        price: 90,
        currency: "EUR",
        link: `https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=21011&security=761899&lang=${params.lang || 'ru'}`,
        baggage: [
          {
            baggage_id: "81",
            baggage_type_id: "1",
            baggage_type: "small_baggage",
            baggage_type_abbreviated: "БАГАЖ М/М",
            baggage_title: "Маломерный багаж",
            length: "35",
            width: "10",
            height: "10",
            kg: "5",
            price: 0,
            currency: "EUR",
            baggage_ticket_id: 46
          },
          {
            baggage_id: "82",
            baggage_type_id: "1",
            baggage_type: "small_baggage",
            baggage_type_abbreviated: "БАГАЖ М/М",
            baggage_title: "Маломерный багаж",
            length: "35",
            width: "10",
            height: "10",
            kg: "5",
            price: 5,
            currency: "EUR",
            baggage_ticket_id: 47
          }
        ]
      },
      "1": {
        passenger_id: 1,
        transaction_id: `1038039`,
        ticket_id: `21012`,
        security: `717836`,
        price: 45,
        currency: "EUR",
        link: `https://test-api.bussystem.eu/viev/frame/print_ticket.php?ticket_id=21012&security=717836&lang=${params.lang || 'ru'}`,
        baggage: [
          {
            baggage_id: "81",
            baggage_type_id: "1",
            baggage_type: "small_baggage",
            baggage_type_abbreviated: "БАГАЖ М/М",
            baggage_title: "Маломерный багаж",
            length: "35",
            width: "10",
            height: "10",
            kg: "5",
            price: 0,
            currency: "EUR",
            baggage_ticket_id: 48
          },
          {
            baggage_id: "84",
            baggage_type_id: "2",
            baggage_type: "medium_baggage",
            baggage_type_abbreviated: "БАГАЖ С/М",
            baggage_title: "Среднемерный багаж",
            length: "50",
            width: "25",
            height: "15",
            kg: "8",
            price: 10,
            currency: "EUR",
            baggage_ticket_id: 49
          }
        ]
      }
    };

    return response;
  },

  // Reserve ticket
  reserveTicket: async (params: {
    order_id: string;
    session?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      status: "reserved",
      message: "Ticket reserved successfully"
    };
  },

  // Get order details
  getOrder: async (params: {
    order_id: string;
    session?: string;
  }): Promise<BussystemOrderInfo> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      order_id: params.order_id,
      security: "SEC_123456789",
      status: "confirmed",
      price: 75,
      currency: "EUR",
      passengers: [
        {
          first_name: "John",
          last_name: "Doe",
          seat_number: "12",
          price: 75
        }
      ]
    };
  },

  // Ping API
  ping: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { status: "ok", message: "Mock API is working" };
  },

  // Get routes for return journey
  getRoutesReturn: async (params: {
    date: string;
    id_from: string;
    id_to: string;
    station_id_from?: string;
    station_id_to?: string;
    interval_id: string | string[];
    trans?: "bus" | "train";
    change?: "auto" | "no";
    currency?: string;
    lang?: string;
    v?: string;
    session?: string;
  }): Promise<BussystemRoute[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockReturnRoutes: BussystemRoute[] = [
      {
        trans: "bus",
        interval_id: "54321",
        route_name: "Berlin - Chișinău",
        has_plan: 1,
        carrier: "MoldovaExpress",
        comfort: "wifi,220v,conditioner,music,tv",
        rating: "4.6",
        reviews: "93",
        logo: "333.png",
        request_get_free_seats: 1,
        request_get_discount: 1, // Must call get_discount.php
        request_get_baggage: 1,
        need_orderdata: 1,
        can_cyrillic_orderdata: 1,
        need_birth: 1,
        need_doc: 1,
        need_doc_expire_date: 1,
        need_citizenship: 1,
        need_gender: 1,
        need_middlename: 0,
        lock_order: "1",
        lock_min: "30",
        reserve_min: "0",
        max_seats: "10",
        start_sale_day: "180",
        stop_sale_hours: 0,
        cancel_free_min: "5",
        date_from: params.date,
        time_from: "09:00:00",
        point_from: "Berlin",
        date_to: params.date.replace(/(\d{4}-\d{2}-\d{2})/, (match) => {
          const date = new Date(match);
          date.setDate(date.getDate() + 1);
          return date.toISOString().split('T')[0];
        }),
        time_to: "23:00:00",
        point_to: "Chișinău",
        time_in_way: "14:00",
        price_one_way: "75",
        price_one_way_max: "95",
        currency: "EUR",
        free_seats: [2, 4, 6, 8, 11, 13, 16, 19, 21, 23, 26, 29],
        luggage: "1 bag up to 20kg included",
        route_info: "Return direct route with one stop in Budapest"
      }
    ];

    return mockReturnRoutes;
  },

  // Get seat plan for visual representation
  getPlan: async (params: {
    bustype_id: string;
    position?: string;
    v?: string;
    session?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock seat plan - simulate different bus layouts based on bustype_id
    const mockPlans: Record<string, {
      plan_type: string;
      floors: Array<{
        number: number;
        rows: { row: Array<{ seat: string[] }> };
      }>;
    }> = {
      "bus_type_123": {
        plan_type: "bus_type_123",
        floors: [
          {
            number: 1,
            rows: {
              row: [
                { seat: ["", "1", "2", "", "3", "4"] },      // Row 1: aisle, seat 1, seat 2, aisle, seat 3, seat 4
                { seat: ["", "5", "6", "", "7", "8"] },      // Row 2
                { seat: ["", "9", "10", "", "11", "12"] },   // Row 3
                { seat: ["", "", "", "", "", ""] },          // Empty row (aisle space)
                { seat: ["", "13", "14", "", "15", "16"] },  // Row 4
                { seat: ["", "17", "18", "", "19", "20"] },  // Row 5
                { seat: ["", "21", "22", "", "23", "24"] },  // Row 6
                { seat: ["", "25", "26", "", "27", "28"] },  // Row 7
                { seat: ["", "29", "30", "", "", ""] }       // Last row (partial)
              ]
            }
          }
        ]
      },
      "105": {
        plan_type: "105",
        floors: [
          {
            number: 1,
            rows: {
              row: [
                { seat: ["", "1", "6", "10", "15", "20"] },
                { seat: ["", "2", "7", "11", "16", "21"] },
                { seat: ["", "3", "8", "12", "17", "22"] },
                { seat: ["", "", "", "", "", ""] }, // aisle
                { seat: ["", "4", "9", "13", "18", "23"] },
                { seat: ["", "5", "", "14", "19", "24"] }
              ]
            }
          }
        ]
      },
      "217": {
        plan_type: "217",
        floors: [
          {
            number: 1,
            rows: {
              row: [
                { seat: ["", "1", "2", "", "3", "4", "5"] },
                { seat: ["", "6", "7", "", "8", "9", "10"] },
                { seat: ["", "11", "12", "", "13", "14", "15"] },
                { seat: ["", "", "", "", "", "", ""] }, // aisle
                { seat: ["", "16", "17", "", "18", "19", "20"] },
                { seat: ["", "21", "22", "", "23", "24", "25"] },
                { seat: ["", "26", "27", "", "28", "29", "30"] }
              ]
            }
          }
        ]
      }
    };

    const plan = mockPlans[params.bustype_id] || mockPlans["bus_type_123"];
    return plan;
  },

  // Get discounts for a route (when request_get_discount = 1)
  getDiscounts: async (params: {
    interval_id: string;
    currency?: string;
    lang?: string;
    v?: string;
    session?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock discounts based on route
    const mockDiscounts: Record<string, Array<{
      discount_id: string;
      discount_name: string;
      discount_price: number;
      discount_price_max?: number;
      discount_currency?: string;
    }>> = {
      "12345": [ // Standard route
        {
          discount_id: "3199",
          discount_name: "10% Pensionari de la 60 ani",
          discount_price: 67,
          discount_price_max: 75,
          discount_currency: "EUR"
        },
        {
          discount_id: "3200",
          discount_name: "15% Studenți",
          discount_price: 64,
          discount_price_max: 75,
          discount_currency: "EUR"
        },
        {
          discount_id: "3201",
          discount_name: "5% Copii 7-14 ani",
          discount_price: 71,
          discount_price_max: 75,
          discount_currency: "EUR"
        }
      ],
      "54321": [ // Return route
        {
          discount_id: "3199",
          discount_name: "10% Pensionari de la 60 ani",
          discount_price: 67,
          discount_price_max: 75,
          discount_currency: "EUR"
        },
        {
          discount_id: "3202",
          discount_name: "20% Grup familial (3+ persoane)",
          discount_price: 60,
          discount_price_max: 75,
          discount_currency: "EUR"
        }
      ]
    };

    const discounts = mockDiscounts[params.interval_id] || [];
    
    return {
      route_id: params.interval_id,
      discounts: discounts.length > 0 ? discounts : null
    };
  },

  // Get baggage options for a route (when request_get_baggage = 1)
  getBaggage: async (params: {
    interval_id: string;
    station_id_to?: string;
    currency?: string;
    lang?: string;
    v?: string;
    session?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock baggage options based on route
    const mockBaggage: Record<string, Array<{
      baggage_id: string;
      baggage_type_id: string;
      baggage_type: string;
      baggage_type_abbreviated: string;
      baggage_title: string;
      length?: string;
      width?: string;
      height?: string;
      kg?: string;
      max_in_bus?: string;
      max_per_person?: string;
      typ?: "route" | string;
      price: number;
      currency: string;
    }>> = {
      "12345": [ // Standard route - outbound with basic baggage
        {
          baggage_id: "bag_free_1",
          baggage_type_id: "1",
          baggage_type: "included_baggage",
          baggage_type_abbreviated: "БАГАЖ ВКЛЮЧ",
          baggage_title: "Багаж включен (1 место)",
          length: "60",
          width: "40", 
          height: "25",
          kg: "20",
          max_in_bus: "50",
          max_per_person: "1",
          typ: "route",
          price: 0, // Gratuit - nu se trimite la new_order
          currency: "EUR"
        },
        {
          baggage_id: "bag_small_2",
          baggage_type_id: "2",
          baggage_type: "small_baggage", 
          baggage_type_abbreviated: "БАГАЖ М/М",
          baggage_title: "Маломерный багаж",
          length: "40",
          width: "30",
          height: "20",
          kg: "10",
          max_in_bus: "30",
          max_per_person: "2",
          typ: "route",
          price: 15,
          currency: "EUR"
        }
      ],
      "54321": [ // Return route - more baggage options
        {
          baggage_id: "bag_free_ret",
          baggage_type_id: "1", 
          baggage_type: "included_baggage",
          baggage_type_abbreviated: "БАГАЖ ВКЛЮЧ",
          baggage_title: "Багаж включен (1 место)",
          length: "60",
          width: "40",
          height: "25", 
          kg: "20",
          max_in_bus: "50",
          max_per_person: "1",
          typ: "route",
          price: 0, // Gratuit
          currency: "EUR"
        },
        {
          baggage_id: "bag_small_ret",
          baggage_type_id: "2",
          baggage_type: "small_baggage",
          baggage_type_abbreviated: "БАГАЖ М/М", 
          baggage_title: "Маломерный багаж",
          length: "40",
          width: "30",
          height: "20",
          kg: "10", 
          max_in_bus: "25",
          max_per_person: "2",
          typ: "route",
          price: 12,
          currency: "EUR"
        },
        {
          baggage_id: "bag_medium_ret",
          baggage_type_id: "3",
          baggage_type: "medium_baggage",
          baggage_type_abbreviated: "БАГАЖ СР",
          baggage_title: "Средний багаж",
          length: "70",
          width: "50",
          height: "30",
          kg: "25",
          max_in_bus: "15", 
          max_per_person: "1",
          typ: "route",
          price: 25,
          currency: "EUR"
        },
        {
          baggage_id: "bag_large_ret",
          baggage_type_id: "4",
          baggage_type: "large_baggage", 
          baggage_type_abbreviated: "БАГАЖ Б",
          baggage_title: "Большой багаж",
          length: "80",
          width: "60",
          height: "40",
          kg: "35",
          max_in_bus: "8",
          max_per_person: "1",
          typ: "route",
          price: 45,
          currency: "EUR"
        }
      ]
    };

    const baggage = mockBaggage[params.interval_id] || [];
    return baggage;
  }
};
