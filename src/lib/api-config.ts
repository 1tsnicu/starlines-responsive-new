// API configuration for different environments
declare global {
  const __API_BASE_URL__: string;
}

// Get API base URL based on environment
export const getApiBaseUrl = (): string => {
  // In development, use local proxy
  if (import.meta.env.DEV) {
    return '/api/backend';
  }
  
  // In production, use configured API URL or default
  if (typeof __API_BASE_URL__ !== 'undefined') {
    return __API_BASE_URL__;
  }
  
  // Fallback for production builds without configured API URL
  return import.meta.env.VITE_API_URL || 'https://your-backend.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  POINTS_AUTOCOMPLETE: `${API_BASE_URL}/api/backend/points/autocomplete`,
  ROUTES_SEARCH: `${API_BASE_URL}/api/backend/routes/search`,
  ORDERS_NEW: `${API_BASE_URL}/api/backend/orders/new`,
  ORDERS_BUY: `${API_BASE_URL}/api/backend/orders/buy`,
  ORDERS_GET: `${API_BASE_URL}/api/backend/orders/get`,
  SEATS_FREE: `${API_BASE_URL}/api/backend/seats/free`,
  RESERVATIONS_VALIDATE: `${API_BASE_URL}/api/backend/reservations/validate`,
  CURL: (file: string) => `${API_BASE_URL}/api/backend/curl/${file}`
} as const;
