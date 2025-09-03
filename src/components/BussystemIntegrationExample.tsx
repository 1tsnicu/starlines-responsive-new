// Example usage of Bussystem Partner API
import React, { useState } from 'react';
import { BussystemPartnerAPI, BussystemConfig } from '@/lib/bussystem';

// Example configuration - replace with your real credentials
const myConfig: BussystemConfig = {
  baseUrl: 'https://test-api.bussystem.eu/server',
  login: 'your_test_login',      // Get this from Bussystem
  password: 'your_test_password', // Get this from Bussystem
  partnerId: 'YOUR_PARTNER_ID',   // Get this after registration
  bookingBaseUrl: 'https://booking.bussystem.eu',
  iframeBaseUrl: 'https://iframe.bussystem.eu/booking',
  useMockData: false,             // Set to false when ready for real API
  defaultLang: 'ru',
  defaultCurrency: 'EUR'
};

interface RouteResult {
  interval_id: string;
  route_name: string;
  seats?: unknown;
}

interface OrderData {
  order_id?: number;
  security?: string;
  payment_url?: string;
}

export const BussystemIntegrationExample: React.FC = () => {
  const [step, setStep] = useState<'search' | 'select' | 'book' | 'payment'>('search');
  const [searchResults, setSearchResults] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  // Initialize API with your config
  const api = new BussystemPartnerAPI(myConfig);

  // Step 1: Search routes
  const handleSearch = async () => {
    try {
      const results = await api.searchRoutes({
        pointFromId: '6',    // Kyiv
        pointToId: '7',      // Lviv  
        date: '2024-01-24'
      });
      setSearchResults(results as RouteResult[]);
      setStep('select');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Step 2: Select route and get seats
  const handleSelectRoute = async (route: RouteResult) => {
    try {
      const seats = await api.getSeats(route.interval_id);
      setSelectedRoute({ ...route, seats });
      setStep('book');
    } catch (error) {
      console.error('Get seats failed:', error);
    }
  };

  // Step 3: Create order
  const handleCreateOrder = async (passengerData: { name: string; surname: string }) => {
    try {
      const orderData = {
        login: myConfig.login,
        password: myConfig.password,
        interval_id: selectedRoute?.interval_id || '',
        date: ['2024-01-24'], // Array format as required by API
        seat: '1,2', // Example seats
        passengers: [passengerData],
        partner: myConfig.partnerId,
      };
      
      const result = await api.createOrder(orderData as never); // Temporary fix for complex types
      setOrder(result as OrderData);
      
      // Redirect to payment
      const orderResult = result as OrderData;
      if (orderResult.payment_url) {
        window.location.href = orderResult.payment_url;
      }
    } catch (error) {
      console.error('Create order failed:', error);
    }
  };

  // Step 4: Handle return from payment
  const handlePaymentReturn = async (orderId: string, security: string) => {
    try {
      const orderStatus = await api.checkOrderStatus(orderId, security);
      console.log('Order status:', orderStatus);
      // Update UI based on payment status
    } catch (error) {
      console.error('Check order status failed:', error);
    }
  };

  // Alternative: Generate direct booking URL
  const generateDirectBookingUrl = () => {
    return api.generateBookingUrl({
      pointFromId: '6',
      pointToId: '7', 
      date: '2024-01-24'
    });
  };

  // Alternative: Generate iframe URL
  const generateIframeUrl = () => {
    return api.generateIframeUrl({
      pointFromId: '6',
      pointToId: '7',
      date: '2024-01-24'
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bussystem Partner Integration</h1>
      
      {step === 'search' && (
        <div>
          <h2>Search Routes</h2>
          <button onClick={handleSearch} className="btn btn-primary">
            Search Kyiv → Lviv
          </button>
          
          <div className="mt-4">
            <h3>Or use direct links:</h3>
            <a href={generateDirectBookingUrl()} target="_blank" rel="noopener noreferrer">
              Direct Booking Link
            </a>
            <br />
            <iframe 
              src={generateIframeUrl()} 
              width="100%" 
              height="600"
              title="Bussystem Booking"
            />
          </div>
        </div>
      )}

      {step === 'select' && (
        <div>
          <h2>Select Route</h2>
          {searchResults.map((route, index) => (
            <div key={index} className="border p-4 mb-2">
              <p>{route.route_name}</p>
              <button onClick={() => handleSelectRoute(route)}>
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      {step === 'book' && (
        <div>
          <h2>Book Route</h2>
          <p>Route: {selectedRoute?.route_name}</p>
          <button onClick={() => handleCreateOrder({ 
            name: 'John', 
            surname: 'Doe' 
          })}>
            Create Order & Go to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default BussystemIntegrationExample;
