# 🚀 Configurarea Supabase pentru Starlines UI

## 📋 Pași de Configurare

### 1. Creează un Proiect Supabase
1. Mergi la [supabase.com](https://supabase.com)
2. Creează un cont nou sau conectează-te
3. Creează un proiect nou
4. Alege o regiune aproape de utilizatorii tăi

### 2. Obține Credențialele
1. În dashboard-ul proiectului, mergi la **Settings** → **API**
2. Copiază:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key

### 3. Configurează Variabilele de Mediu
Creează un fișier `.env` în rădăcina proiectului:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Creează Tabelul Users
În **SQL Editor** din Supabase, rulează:

```sql
-- Creează tabelul pentru profilul utilizatorilor
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activează RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Creează policy pentru utilizatorii autentificați să-și vadă propriul profil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Creează policy pentru utilizatorii să-și creeze propriul profil
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Creează policy pentru utilizatorii să-și actualizeze propriul profil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Creează trigger pentru actualizarea updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. Configurează Autentificarea
1. În **Authentication** → **Settings**
2. Activează **Email confirmations** dacă dorești
3. Configurează **Site URL** cu domeniul tău
4. Adaugă **Redirect URLs** pentru aplicația ta

### 6. Testează Integrarea
1. Rulează `npm run dev`
2. Mergi la pagina **My Tickets**
3. Încearcă să creezi un cont nou
4. Verifică în **Authentication** → **Users** din Supabase

## 🔧 Structura Bazei de Date

### Tabelul `users`
- `id` - UUID (cheie primară, referință la auth.users)
- `email` - TEXT (unic, obligatoriu)
- `first_name` - TEXT (obligatoriu)
- `last_name` - TEXT (obligatoriu)
- `created_at` - TIMESTAMP (automat)
- `updated_at` - TIMESTAMP (automat)

## 🚨 Securitate

### RLS (Row Level Security)
- Utilizatorii pot vedea doar propriul profil
- Nu pot accesa datele altor utilizatori
- Autentificarea este gestionată de Supabase Auth

### Autentificare
- Parolele sunt hash-uite automat
- Sesiunile sunt gestionate de Supabase
- JWT tokens pentru autentificare

## 📱 Funcționalități Implementate

### ✅ Autentificare
- Înregistrare utilizator nou
- Conectare utilizator existent
- Deconectare
- Resetare parolă (opțional)

### ✅ Persistența Datelor
- Datele rămân salvate între sesiuni
- Sincronizare automată cu baza de date
- Gestionarea stării de autentificare

### ✅ Interfața Utilizator
- Formulare de înregistrare/conectare
- Afișarea informațiilor utilizatorului
- Mesaje de eroare și succes
- Loading states

## 🔍 Debugging

### Verifică Console-ul Browser
- Erori de conectare la Supabase
- Probleme cu autentificarea
- Erori de validare

### Verifică Supabase Dashboard
- **Authentication** → **Users** - utilizatori creați
- **Logs** → **API** - cereri API
- **Database** → **Tables** - date în tabel

### Verifică Network Tab
- Cereri către Supabase
- Status codes
- Response data

## 🚀 Următorii Pași

### Extinderea Funcționalității
1. **Profil Utilizator** - editare informații
2. **Istoric Bilete** - salvare bilete în baza de date
3. **Preferințe** - setări utilizator
4. **Notificări** - email/SMS pentru bilete

### Optimizări
1. **Caching** - React Query pentru date
2. **Offline Support** - PWA capabilities
3. **Real-time** - subscriptions Supabase
4. **Analytics** - tracking utilizatori

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică console-ul browser
2. Verifică logs-urile Supabase
3. Consultă [documentația Supabase](https://supabase.com/docs)
4. Creează un issue în proiect

---

**Notă**: Asigură-te că nu expui niciodată cheia `service_role` în frontend. Folosește doar `anon` key pentru aplicația client.
