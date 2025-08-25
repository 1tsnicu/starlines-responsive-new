-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.routes ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    route_id TEXT NOT NULL,
    fare_type TEXT NOT NULL CHECK (fare_type IN ('economy', 'premium', 'business')),
    passengers INTEGER NOT NULL CHECK (passengers > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    currency TEXT NOT NULL DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    departure_date DATE NOT NULL,
    return_date DATE,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);

-- Create routes table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    operator TEXT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration TEXT NOT NULL,
    price_economy DECIMAL(10,2) NOT NULL CHECK (price_economy > 0),
    price_premium DECIMAL(10,2) NOT NULL CHECK (price_premium > 0),
    price_business DECIMAL(10,2) NOT NULL CHECK (price_business > 0),
    amenities TEXT[] DEFAULT '{}',
    frequency TEXT NOT NULL DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_route_id ON public.bookings(route_id);
CREATE INDEX IF NOT EXISTS idx_routes_from_city ON public.routes(from_city);
CREATE INDEX IF NOT EXISTS idx_routes_to_city ON public.routes(to_city);
CREATE INDEX IF NOT EXISTS idx_routes_operator ON public.routes(operator);

-- Row Level Security Policies

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Bookings: Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Routes: Everyone can view active routes
CREATE POLICY "Everyone can view active routes" ON public.routes
    FOR SELECT USING (is_active = TRUE);

-- Only admins can manage routes
CREATE POLICY "Only admins can insert routes" ON public.routes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Only admins can update routes" ON public.routes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Only admins can delete routes" ON public.routes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
-- Note: This should be done through the auth system in production
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'admin@starlines.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- Insert sample routes
INSERT INTO public.routes (from_city, to_city, operator, departure_time, arrival_time, duration, price_economy, price_premium, price_business, amenities, frequency) VALUES
('Chișinău', 'Berlin', 'Starlines Express', '08:00:00', '22:00:00', '14h', 85.00, 120.00, 180.00, ARRAY['WiFi', 'USB', 'WC', 'Refreshments'], 'daily'),
('Chișinău', 'Munich', 'Starlines Express', '10:30:00', '01:30:00', '15h', 90.00, 130.00, 190.00, ARRAY['WiFi', 'USB', 'WC', 'Entertainment'], 'daily'),
('Chișinău', 'Frankfurt', 'Starlines Express', '12:00:00', '03:00:00', '15h', 88.00, 125.00, 185.00, ARRAY['WiFi', 'USB', 'WC'], 'daily'),
('Chișinău', 'Vienna', 'Starlines Custom', '14:00:00', '04:00:00', '14h', 100.00, 140.00, 200.00, ARRAY['WiFi', 'USB', 'WC', 'Premium Service'], '2x weekly')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.bookings TO anon, authenticated;
GRANT ALL ON public.routes TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
