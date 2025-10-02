import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

const supabaseUrl = env.SUPABASE_URL
const supabaseAnonKey = env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          created_at: string
          updated_at: string
          is_admin: boolean
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          avatar_url?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          route_id: string
          fare_type: string
          passengers: number
          total_price: number
          currency: string
          status: string
          created_at: string
          updated_at: string
          departure_date: string
          return_date: string | null
          payment_status: string
        }
        Insert: {
          id?: string
          user_id: string
          route_id: string
          fare_type: string
          passengers: number
          total_price: number
          currency: string
          status?: string
          created_at?: string
          updated_at?: string
          departure_date: string
          return_date?: string | null
          payment_status?: string
        }
        Update: {
          id?: string
          user_id?: string
          route_id?: string
          fare_type?: string
          passengers?: number
          total_price?: number
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
          departure_date?: string
          return_date?: string | null
          payment_status?: string
        }
      }
      routes: {
        Row: {
          id: string
          from_city: string
          to_city: string
          operator: string
          departure_time: string
          arrival_time: string
          duration: string
          price_economy: number
          price_premium: number
          price_business: number
          amenities: string[]
          frequency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_city: string
          to_city: string
          operator: string
          departure_time: string
          arrival_time: string
          duration: string
          price_economy: number
          price_premium: number
          price_business: number
          amenities: string[]
          frequency: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_city?: string
          to_city?: string
          operator?: string
          departure_time?: string
          arrival_time?: string
          duration?: string
          price_economy?: number
          price_premium?: number
          price_business?: number
          amenities?: string[]
          frequency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
