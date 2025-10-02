// Environment configuration with fallbacks for different environments
// This file handles environment variables across different build tools (Vite, Create React App, etc.)

interface EnvConfig {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  BUS_LOGIN?: string
  BUS_PASSWORD?: string
  NODE_ENV?: string
  MODE?: string
}

// Helper function to get environment variables with fallbacks
const getEnvVar = (key: string, fallback?: string): string | undefined => {
  // Try Vite's import.meta.env first (for Vite-based projects)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback
  }
  
  // Try process.env for Node.js environments
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback
  }
  
  // Return fallback if neither is available
  return fallback
}

// Get environment mode
const getEnvMode = (): string => {
  return getEnvVar('MODE', getEnvVar('NODE_ENV', 'production')) || 'production'
}

// Environment configuration
export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('REACT_APP_SUPABASE_URL', 'https://vrxwhyvyodvxovpbenpr.supabase.co')!,
  SUPABASE_ANON_KEY: getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeHdoeXZ5b2R2eG92cGJlbnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDUxNDYsImV4cCI6MjA3MTY4MTE0Nn0.04QxU-lZspdz-PybBJAd3h26av9tPViscHPwaT0xEns')!,
  BUS_LOGIN: getEnvVar('VITE_BUS_LOGIN', getEnvVar('BUS_LOGIN')),
  BUS_PASSWORD: getEnvVar('VITE_BUS_PASSWORD', getEnvVar('BUS_PASSWORD')),
  NODE_ENV: getEnvVar('NODE_ENV'),
  MODE: getEnvMode()
}

// Helper functions
export const isDevelopment = (): boolean => {
  return env.MODE === 'development' || env.NODE_ENV === 'development'
}

export const isProduction = (): boolean => {
  return env.MODE === 'production' || env.NODE_ENV === 'production'
}

export default env
