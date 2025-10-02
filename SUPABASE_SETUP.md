# 🚀 Supabase Setup pentru Starlines

Acest ghid vă va ajuta să configurați Supabase pentru aplicația Starlines.

## 📋 Pași de Configurare

### 1. **Configurarea Variabilelor de Mediu**

Creați un fișier `.env` în directorul root al proiectului:

```env
REACT_APP_SUPABASE_URL=https://vrxwhyvyodvxovpbenpr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeHdoeXZ5b2R2eG92cGJlbnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDUxNDYsImV4cCI6MjA3MTY4MTE0Nn0.04QxU-lZspdz-PybBJAd3h26av9tPViscHPwaT0xEns
```

#### **Pentru Vite (opțional):**
```env
VITE_SUPABASE_URL=https://vrxwhyvyodvxovpbenpr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Notă:** Aplicația folosește un sistem de configurare hibrid (`src/config/env.ts`) care funcționează cu atât Vite cât și Create React App, cu fallback-uri pentru toate variabilele de mediu.

### 2. **Configurarea Bazei de Date**

1. Accesați [Supabase Dashboard](https://supabase.com/dashboard)
2. Selectați proiectul `vrxwhyvyodvxovpbenpr`
3. Mergeți la **SQL Editor**
4. Copiați și rulați conținutul din `supabase-setup.sql`

### 3. **Structura Tabelelor**

#### **📊 Tabelul `profiles`**
```sql
- id (uuid) - ID-ul utilizatorului din auth.users
- email (text) - Emailul utilizatorului
- first_name (text) - Prenumele
- last_name (text) - Numele
- phone (text) - Numărul de telefon
- created_at (timestamp) - Data creării
- updated_at (timestamp) - Data ultimei modificări
- is_admin (boolean) - Dacă este administrator
- avatar_url (text) - URL-ul avatarului
```

#### **📊 Tabelul `bookings`**
```sql
- id (uuid) - ID-ul rezervării
- user_id (uuid) - ID-ul utilizatorului
- route_id (text) - ID-ul rutei
- fare_type (text) - Tipul tarifului
- passengers (integer) - Numărul de pasageri
- total_price (numeric) - Prețul total
- currency (text) - Moneda
- status (text) - Statusul rezervării
- departure_date (date) - Data plecării
- return_date (date) - Data întoarcerii
- payment_status (text) - Statusul plății
```

#### **📊 Tabelul `routes`**
```sql
- id (uuid) - ID-ul rutei
- from_city (text) - Orașul de plecare
- to_city (text) - Orașul de sosire
- operator (text) - Operatorul
- departure_time (time) - Ora plecării
- arrival_time (time) - Ora sosirii
- duration (text) - Durata călătoriei
- price_economy (numeric) - Prețul economie
- price_premium (numeric) - Prețul premium
- price_business (numeric) - Prețul business
- amenities (text[]) - Facilitățile
- frequency (text) - Frecvența
- is_active (boolean) - Dacă ruta este activă
```

### 4. **Row Level Security (RLS)**

Toate tabelele au RLS activat cu următoarele politici:

- **profiles**: Utilizatorii pot vedea/modifica doar propriul profil
- **bookings**: Utilizatorii pot vedea/modifica doar propriile rezervări
- **routes**: Toate rutele sunt vizibile publicului

### 5. **Trigger-e și Funcții**

#### **🔄 Trigger pentru `updated_at`**
```sql
-- Actualizează automat câmpul updated_at la modificare
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### **🔄 Trigger pentru utilizatori noi**
```sql
-- Creează automat profilul când se înregistrează un utilizator nou
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🔐 Autentificare

### **Funcționalități Disponibile:**

1. **Înregistrare** (`/login`)
   - Email și parolă
   - Prenume, nume, telefon
   - Validare automată
   - **Confirmare prin email** (opțional)
   - **Detectare utilizator existent**

2. **Autentificare** (`/login`)
   - Email și parolă
   - Persistența sesiunii

3. **Confirmare Email**
   - **Email automat** la înregistrare
   - **Pagina de callback** (`/auth/callback`)
   - **Crearea automată** a profilului după confirmare

4. **Profil Utilizator**
   - Vizualizare și editare
   - Informații personale
   - Istoricul rezervărilor

5. **Deconectare**
   - Buton în header
   - Ștergerea sesiunii

### **Context API**

Aplicația folosește `AuthContext` pentru gestionarea autentificării:

```typescript
const { user, profile, signIn, signUp, signOut, isAdmin } = useAuth();
```

## 🛠️ Testare

### **Testarea Înregistrării:**
1. Accesați `/login`
2. Click pe "Sign Up"
3. Completați formularul
4. Verificați în Supabase că profilul a fost creat

### **Testarea Autentificării:**
1. Accesați `/login`
2. Click pe "Login"
3. Introduceți credențialele
4. Verificați că header-ul afișează numele utilizatorului

### **Testarea Profilului:**
1. După autentificare, click pe numele din header
2. Verificați dropdown-ul cu opțiunile
3. Testați deconectarea

## 📱 Integrare în Aplicație

### **Header-ul**
- Afișează numele utilizatorului când este autentificat
- Buton de login când nu este autentificat
- Dropdown cu opțiuni de profil

### **Pagina de Login**
- Toggle între Login și Sign Up
- Formulare responsive
- Validare și mesaje de eroare

### **Protecția Rutelor**
- Rutele protejate pot fi implementate cu:
```typescript
const { user, loading } = useAuth();
if (loading) return <Loading />;
if (!user) return <Navigate to="/login" />;
```

## 🔧 Configurații Avansate

### **Configurarea OAuth (Google)**
1. În Supabase Dashboard, mergeți la Authentication > Providers
2. Activați Google Provider
3. Configurați Client ID și Client Secret

### **Configurarea Email-urilor**
1. În Supabase Dashboard, mergeți la Authentication > Settings
2. Configurați SMTP pentru email-uri de confirmare
3. Personalizați template-urile de email

#### **Pentru Confirmarea Email-ului:**
1. În Authentication > Settings > Email Templates
2. Selectați "Confirm signup"
3. Personalizați template-ul cu:
   ```html
   <h2>Confirmă contul tău Starlines</h2>
   <p>Bună {{ .Email }}!</p>
   <p>Te rugăm să confirmi contul tău făcând click pe linkul de mai jos:</p>
   <a href="{{ .ConfirmationURL }}">Confirmă Contul</a>
   <p>Dacă nu ai creat acest cont, te rugăm să ignori acest email.</p>
   ```

#### **Pentru Resetarea Parolei:**
1. În Authentication > Settings > Email Templates
2. Selectați "Reset password"
3. Personalizați template-ul cu:
   ```html
   <h2>Resetează parola Starlines</h2>
   <p>Ai solicitat resetarea parolei pentru contul {{ .Email }}.</p>
   <p>Fă click pe linkul de mai jos pentru a reseta parola:</p>
   <a href="{{ .ConfirmationURL }}">Resetează Parola</a>
   <p>Dacă nu ai solicitat această acțiune, te rugăm să ignori acest email.</p>
   ```

## 🚨 Troubleshooting

### **Probleme Comune:**

1. **"Invalid credentials"**
   - Verificați că utilizatorul există în `auth.users`
   - Verificați că parola este corectă

2. **"Profile not found"**
   - Verificați că trigger-ul `on_auth_user_created` este activ
   - Verificați că funcția `handle_new_user()` funcționează

3. **"Permission denied"**
   - Verificați că RLS este configurat corect
   - Verificați că politicele RLS sunt active

4. **"Email confirmation not working"**
   - Verificați că SMTP este configurat în Supabase
   - Verificați că email-urile nu ajung în spam
   - Verificați că URL-ul de callback este corect

5. **"User already exists" message**
   - Verificați că mesajul apare pentru utilizatori existenti
   - Verificați că redirectarea funcționează corect

6. **"process is not defined" error**
   - Verificați că folosiți `src/config/env.ts` pentru variabilele de mediu
   - Asigurați-vă că variabilele sunt configurate în `.env`
   - Pentru Vite, folosiți prefixul `VITE_` pentru variabilele publice

### **Log-uri pentru Debug:**
```typescript
// În AuthContext.tsx
console.log('Auth state:', { user, profile, session });
```

## 📚 Resurse Utile

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Auth Patterns](https://supabase.com/docs/guides/auth/auth-helpers/react)

---

**✅ După completarea acestor pași, aplicația va avea autentificare completă funcțională cu Supabase!**