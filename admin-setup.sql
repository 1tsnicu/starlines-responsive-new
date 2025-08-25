-- Script pentru configurarea manuală a adminului în Supabase
-- Rulează acest script în Supabase SQL Editor

-- 1. Creează utilizatorul admin prin Supabase Auth (manual)
-- În Supabase Dashboard > Authentication > Users > Add User
-- Email: admin@starlines.md
-- Password: admin123 (sau ce vrei tu)

-- 2. După ce ai creat utilizatorul, execută acest script pentru a seta flag-ul admin

-- Găsește ID-ul utilizatorului admin
-- Înlocuiește 'admin@starlines.md' cu emailul pe care l-ai folosit
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'admin@starlines.md';

-- Verifică că s-a actualizat
SELECT id, email, first_name, last_name, is_admin, created_at 
FROM public.profiles 
WHERE email = 'admin@starlines.md';

-- 3. Verifică toți adminii
SELECT id, email, first_name, last_name, is_admin, created_at 
FROM public.profiles 
WHERE is_admin = TRUE;

-- 4. Dacă vrei să creezi un profil complet pentru admin
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    is_admin,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@starlines.md'),
    'admin@starlines.md',
    'Administrator',
    'Starlines',
    '+373 60 12 34 56',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    is_admin = TRUE,
    updated_at = NOW();
