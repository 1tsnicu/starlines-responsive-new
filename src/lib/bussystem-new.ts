// src/lib/bussystem-new.ts - Actualizat conform răspunsului oficial Bussystem

// Configurația pentru integrarea cu Bussystem API
export interface BussystemConfig {
  baseUrl: string;
  login?: string;          // Opțional pentru test API
  password?: string;       // Opțional pentru test API
  useMockData: boolean;
  defaultLang: string;
  defaultCurrency: string;
  hasDepositAccount?: boolean; // Pentru a activa buy_ticket
  markupPercentage?: number;   // Markup-ul tău (0-50%)
  requiresAuth?: boolean;      // Pentru a specifica dacă API-ul necesită autentificare
}

// Configurația pentru test API (prin proxy)
export const testBussystemConfig: BussystemConfig = {
  baseUrl: '/api/bussystem-test', // Folosește proxy-ul Vite
  useMockData: false,      // Folosește API real de test prin proxy
  defaultLang: 'ru',
  defaultCurrency: 'EUR',
  hasDepositAccount: false, // Test API nu are funcție de plată
  markupPercentage: 25,
  requiresAuth: false      // Test API nu necesită login/password (deocamdată)
};

// Configurația pentru API real (prin proxy)
export const realBussystemConfig: BussystemConfig = {
  baseUrl: '/api/bussystem-real', // Folosește proxy-ul Vite
  login: 'YOUR_LOGIN',     // Va fi înlocuit cu credentialele reale
  password: 'YOUR_PASSWORD', // Va fi înlocuit cu credentialele reale
  useMockData: false,
  defaultLang: 'ru',
  defaultCurrency: 'EUR',
  hasDepositAccount: true,  // API real are funcție de plată
  markupPercentage: 25,
  requiresAuth: true       // API real necesită login/password
};

// Configurația implicită - folosește test API
export const newBussystemConfig: BussystemConfig = testBussystemConfig;

// Calculul prețului cu markup
export const calculatePriceWithMarkup = (originalPrice: number, markupPercentage: number = 25): number => {
  return Math.round((originalPrice * (1 + markupPercentage / 100)) * 100) / 100;
};

// Calculul profitului
export const calculateProfit = (originalPrice: number, markupPercentage: number = 25): {
  commission: number;
  markup: number;
  totalProfit: number;
  finalPrice: number;
} => {
  const commission = Math.round((originalPrice * 0.10) * 100) / 100; // 10% comision
  const markup = Math.round((originalPrice * (markupPercentage / 100)) * 100) / 100;
  const totalProfit = commission + markup;
  const finalPrice = originalPrice + markup;
  
  return {
    commission,
    markup,
    totalProfit,
    finalPrice
  };
};

// Clasa principală pentru API-ul Bussystem cu depozit
export class BussystemDepositAPI {
  constructor(private config: BussystemConfig = newBussystemConfig) {}

  // Headers pentru toate request-urile
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Body de bază pentru toate request-urile
  private getBaseBody(): Record<string, string> {
    const body: Record<string, string> = {
      lang: this.config.defaultLang
    };

    // Adaugă autentificare doar dacă este necesară
    if (this.config.requiresAuth && this.config.login && this.config.password) {
      body.login = this.config.login;
      body.password = this.config.password;
    }

    return body;
  }

  // 1. Căutare puncte/orașe
  async searchPoints(query: string): Promise<any> {
    if (this.config.useMockData) {
      // Mock data pentru development
      return [
        { id: '6', name: 'Кишинев', country: 'Молдова' },
        { id: '7', name: 'Львов', country: 'Украина' },
        { id: '8', name: 'Киев', country: 'Украина' }
      ];
    }

    const response = await fetch(`${this.config.baseUrl}/curl/get_points.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        autocomplete: query
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 2. Căutare rute
  async searchRoutes(params: {
    pointFromId: string;
    pointToId: string;
    date: string; // YYYY-MM-DD
    passengers?: number;
  }): Promise<any> {
    if (this.config.useMockData) {
      // Mock data pentru development
      return [
        {
          interval_id: '12345',
          date: params.date,
          price: 50.00,
          departure_time: '08:00',
          arrival_time: '14:00',
          duration: '6h 00m',
          free_seats: 15
        }
      ];
    }

    const response = await fetch(`${this.config.baseUrl}/curl/get_routes.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        point_from_id: params.pointFromId,
        point_to_id: params.pointToId,
        date: params.date,
        passengers: params.passengers || 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 3. Verificare locuri libere
  async getSeats(intervalId: string): Promise<any> {
    if (this.config.useMockData) {
      // Mock data pentru development
      return {
        free_seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        seat_map: '1,2,3,4,5,6,7,8,9,10'
      };
    }

    const response = await fetch(`${this.config.baseUrl}/curl/get_seats.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        interval_id: intervalId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 4. Creare comandă nouă
  async createOrder(params: {
    interval_id: string;
    date: string[];
    seat: string;
    passengers: Array<{
      name: string;
      surname: string;
      phone?: string;
      email?: string;
    }>;
  }): Promise<any> {
    if (this.config.useMockData) {
      // Mock data pentru development
      return {
        order_id: 'TEST_' + Date.now(),
        security: 'security_code_' + Date.now(),
        status: 'created',
        total_price: 50.00
      };
    }

    const response = await fetch(`${this.config.baseUrl}/curl/new_order.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        ...params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 5. PLATĂ DIRECTĂ - disponibilă doar cu cont de depozit
  async buyTicket(params: {
    orderId: string;
    security: string;
    finalPrice?: number; // Prețul cu markup inclus
  }): Promise<any> {
    if (!this.config.hasDepositAccount) {
      throw new Error('buy_ticket requires deposit account. Set hasDepositAccount: true after contract signing.');
    }

    if (this.config.useMockData) {
      // Mock data pentru development
      return {
        success: true,
        ticket_id: 'TICKET_' + Date.now(),
        status: 'paid',
        amount_deducted: params.finalPrice || 50.00,
        commission_earned: (params.finalPrice || 50.00) * 0.10,
        ticket_url: 'https://example.com/ticket.pdf'
      };
    }

    const response = await fetch(`${this.config.baseUrl}/curl/buy_ticket.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        order_id: params.orderId,
        security: params.security,
        amount: params.finalPrice
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 6. Verificare status comandă
  async checkOrderStatus(orderId: string, security: string): Promise<any> {
    if (this.config.useMockData) {
      // Mock data pentru development
      return {
        order_id: orderId,
        status: 'paid',
        total_price: 50.00,
        created_at: new Date().toISOString()
      };
    }

    const response = await fetch(`${this.config.baseUrl}/curl/get_order.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        order_id: orderId,
        security: security
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 7. Anulare comandă
  async cancelOrder(orderId: string, security: string): Promise<any> {
    if (this.config.useMockData) {
      // Mock data pentru development
      return {
        success: true,
        order_id: orderId,
        status: 'cancelled'
      };
    }

    const response = await fetch(`${this.config.baseUrl}/curl/cancel_order.php`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.getBaseBody(),
        order_id: orderId,
        security: security
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Workflow complet de rezervare cu plată directă
  async completeBookingWorkflow(params: {
    pointFromId: string;
    pointToId: string;
    date: string;
    passengerName: string;
    passengerSurname: string;
    seatNumber: string;
    markupPercentage?: number;
  }): Promise<{
    success: boolean;
    ticket?: any;
    profit?: any;
    error?: string;
  }> {
    try {
      // 1. Caută rute
      const routes = await this.searchRoutes({
        pointFromId: params.pointFromId,
        pointToId: params.pointToId,
        date: params.date
      });

      if (!routes || routes.length === 0) {
        return { success: false, error: 'No routes found' };
      }

      const selectedRoute = routes[0];
      const originalPrice = selectedRoute.price;
      
      // 2. Calculează prețul cu markup
      const markupPercentage = params.markupPercentage || this.config.markupPercentage || 25;
      const profit = calculateProfit(originalPrice, markupPercentage);

      // 3. Creează comanda
      const order = await this.createOrder({
        interval_id: selectedRoute.interval_id,
        date: [params.date],
        seat: params.seatNumber,
        passengers: [{
          name: params.passengerName,
          surname: params.passengerSurname
        }]
      });

      if (!order.order_id) {
        return { success: false, error: 'Failed to create order' };
      }

      // 4. Plătește direct (doar cu cont de depozit)
      if (this.config.hasDepositAccount) {
        const payment = await this.buyTicket({
          orderId: order.order_id,
          security: order.security,
          finalPrice: profit.finalPrice
        });

        return {
          success: payment.success,
          ticket: payment,
          profit: profit
        };
      } else {
        // Pentru testare fără depozit, returnează doar detaliile comenzii
        return {
          success: true,
          ticket: order,
          profit: profit
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export instanță default pentru utilizare ușoară
export const bussystemAPI = new BussystemDepositAPI(newBussystemConfig);

// Utility functions
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return `${price.toFixed(2)} ${currency}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

// Tipurile pentru TypeScript
export interface Route {
  interval_id: string;
  date: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  duration: string;
  free_seats: number;
}

export interface Passenger {
  name: string;
  surname: string;
  phone?: string;
  email?: string;
}

export interface Order {
  order_id: string;
  security: string;
  status: string;
  total_price: number;
}

export interface Ticket {
  success: boolean;
  ticket_id?: string;
  status?: string;
  amount_deducted?: number;
  commission_earned?: number;
  ticket_url?: string;
}
