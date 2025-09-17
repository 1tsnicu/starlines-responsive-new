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

// Helper to safely join paths without duplicating segments like /api/backend/api/backend
function join(base: string, path: string) {
  // Normalize double slashes
  const b = base.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  // If path already contains api/backend and base ends with it, avoid repeating
  if (b.endsWith('/api/backend') && p.startsWith('api/backend/')) {
    return b + '/' + p.replace(/^api\/backend\//, '');
  }
  return `${b}/${p}`;
}

// Base already points to /api/backend in both dev & prod now, so endpoints are relative
const base = API_BASE_URL; // e.g. '/api/backend'

export const API_ENDPOINTS = {
  HEALTH: join(base, 'health'),
  POINTS_AUTOCOMPLETE: join(base, 'points/autocomplete'),
  ROUTES_SEARCH: join(base, 'routes/search'),
  ORDERS_NEW: join(base, 'orders/new'),
  ORDERS_BUY: join(base, 'orders/buy'),
  ORDERS_GET: join(base, 'orders/get'),
  SEATS_FREE: join(base, 'seats/free'),
  RESERVATIONS_VALIDATE: join(base, 'reservations/validate'),
  CURL: (file: string) => join(base, `curl/${file}`)
} as const;
