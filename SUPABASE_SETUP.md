# 🚀 **Configurarea Supabase pentru Starlines Routes**

## 📋 **Pași de Configurare**

### **1. Accesare Supabase Dashboard**
- Mergi la [supabase.com](https://supabase.com)
- Conectează-te la contul tău
- Accesează proiectul: `vrxwhyvyodvxovpbenpr`

### **2. Configurarea Bazei de Date**
1. **Deschide SQL Editor** din meniul din stânga
2. **Copiază și rulează** conținutul din `supabase-setup.sql`
3. **Verifică** că tabelele au fost create:
   - `profiles` - profilurile utilizatorilor
   - `bookings` - rezervările
   - `routes` - rutele de transport

### **3. Configurarea Autentificării**
1. **Authentication > Settings** din meniul din stânga
2. **Enable Email Auth** dacă nu este activat
3. **Configure Email Templates** (opțional)

### **4. Configurarea RLS (Row Level Security)**
- RLS este deja configurat prin scriptul SQL
- Utilizatorii pot vedea doar propriile date
- Adminii pot vedea toate datele

## 🗄️ **Structura Bazei de Date**

### **Tabela `profiles`**
```sql
- id (UUID) - referință la auth.users
- email (TEXT) - email-ul utilizatorului
- first_name (TEXT) - prenumele
- last_name (TEXT) - numele
- phone (TEXT) - numărul de telefon
- is_admin (BOOLEAN) - dacă este admin
- created_at, updated_at (TIMESTAMP)
```

### **Tabela `bookings`**
```sql
- id (UUID) - ID-ul rezervării
- user_id (UUID) - referință la profiles
- route_id (TEXT) - ID-ul rutei
- fare_type (TEXT) - tipul tarifului
- passengers (INTEGER) - numărul de pasageri
- total_price (DECIMAL) - prețul total
- currency (TEXT) - moneda
- status (TEXT) - statusul rezervării
- departure_date, return_date (DATE)
```

### **Tabela `routes`**
```sql
- id (UUID) - ID-ul rutei
- from_city, to_city (TEXT) - orașele
- operator (TEXT) - operatorul
- departure_time, arrival_time (TIME)
- duration (TEXT) - durata
- price_economy, price_premium, price_business (DECIMAL)
- amenities (TEXT[]) - facilitățile
- is_active (BOOLEAN) - dacă ruta este activă
```

## 🔐 **Politici de Securitate (RLS)**

### **Profiles**
- Utilizatorii pot vedea și edita doar propriul profil
- Adminii pot vedea toate profilele

### **Bookings**
- Utilizatorii pot vedea doar propriile rezervări
- Adminii pot vedea toate rezervările

### **Routes**
- Toată lumea poate vedea rutele active
- Doar adminii pot crea/edita/șterge rute

## 👥 **Crearea Primului Admin**

### **Metoda 1: Prin Aplicație**
1. Creează un cont normal prin `/signup`
2. Conectează-te la baza de date
3. Execută:
```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'emailul_tau@example.com';
```

### **Metoda 2: Prin Supabase Dashboard**
1. **Authentication > Users**
2. Creează un utilizator nou
3. **Table Editor > profiles**
4. Adaugă un rând cu `is_admin = TRUE`

## 🧪 **Testarea Autentificării**

### **1. Testare Înregistrare**
- Mergi la `/signup`
- Completează formularul
- Verifică că contul este creat în `profiles`

### **2. Testare Conectare**
- Mergi la `/login`
- Conectează-te cu contul creat
- Verifică că ești redirecționat corect

### **3. Testare Admin**
- Conectează-te cu un cont admin
- Verifică că vezi link-ul "Admin Panel" în header
- Accesează `/admin/routes`

## 🔧 **Configurarea de Producție**

### **1. Variabile de Mediu**
```env
VITE_SUPABASE_URL=https://vrxwhyvyodvxovpbenpr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Securitate**
- Activează **2FA** pentru conturile admin
- Configurează **rate limiting**
- Monitorizează **audit logs**

### **3. Backup**
- Configurează **backup automat** în Supabase
- Exportă datele periodic

## 📱 **Funcționalități Implementate**

### **✅ Autentificare**
- Înregistrare utilizatori noi
- Conectare utilizatori existenți
- Gestionare sesiuni
- Deconectare

### **✅ Profil Utilizator**
- Informații personale
- Actualizare profil
- Avatar (opțional)

### **✅ Sistem Admin**
- Acces la toate datele
- Gestionare rute
- Gestionare utilizatori
- Panel administrativ

### **✅ Securitate**
- Row Level Security (RLS)
- Politici de acces
- Validare date
- Protecție CSRF

## 🚨 **Troubleshooting**

### **Eroare: "Invalid JWT"**
- Verifică cheia anonimă
- Verifică URL-ul Supabase
- Verifică configurația RLS

### **Eroare: "Permission denied"**
- Verifică politicile RLS
- Verifică dacă utilizatorul este autentificat
- Verifică dacă utilizatorul are permisiunile necesare

### **Eroare: "Table not found"**
- Rulează din nou scriptul SQL
- Verifică că tabelele au fost create
- Verifică numele tabelelor

## 📞 **Suport**

Pentru probleme tehnice:
1. Verifică **Supabase Status**
2. Consultează **Supabase Docs**
3. Contactează **echipa de dezvoltare**

---

**🎯 Obiectiv:** Aplicația Starlines Routes este acum conectată la Supabase cu autentificare completă și sistem de administrare!
