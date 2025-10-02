-- Supabase Setup for Starlines Application
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE public.profiles (
  id uuid not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_admin boolean null default false,
  avatar_url text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 2. Create index on email
CREATE INDEX IF not exists idx_profiles_email on public.profiles using btree (email) TABLESPACE pg_default;

-- 3. Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create trigger for updating updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create bookings table (if not exists)
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id text NOT NULL,
  fare_type text NOT NULL,
  passengers integer NOT NULL,
  total_price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  departure_date date NOT NULL,
  return_date date,
  payment_status text NOT NULL DEFAULT 'pending'
);

-- 10. Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- 12. Create routes table (if not exists)
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_city text NOT NULL,
  to_city text NOT NULL,
  operator text NOT NULL,
  departure_time time NOT NULL,
  arrival_time time NOT NULL,
  duration text NOT NULL,
  price_economy numeric(10,2) NOT NULL,
  price_premium numeric(10,2) NOT NULL,
  price_business numeric(10,2) NOT NULL,
  amenities text[] DEFAULT '{}',
  frequency text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 13. Enable RLS for routes
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for routes (public read access)
CREATE POLICY "Routes are viewable by everyone" ON public.routes
  FOR SELECT USING (true);

-- 15. Create trigger for routes updated_at
CREATE TRIGGER update_routes_updated_at BEFORE
UPDATE ON public.routes FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 16. Create trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE
UPDATE ON public.bookings FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 17. Configure email settings (run these in Supabase Dashboard > Authentication > Settings)
-- Enable email confirmations
-- UPDATE auth.config SET email_confirm_enabled = true;

-- 18. Create function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is an email confirmation
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- User just confirmed their email, ensure profile exists
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      phone, 
      is_admin,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      updated_at = NOW();
  END IF;
  
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Create trigger for email confirmation
CREATE TRIGGER on_email_confirmation
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();