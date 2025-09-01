# Ghid Complet Integrare Bussystem API

## Prezentare Generală

Acest proiect implementează o integrare completă cu Bussystem API, incluzând toate componentele necesare pentru un sistem de rezervare de transport complet.

## Componente Implementate

### 1. API Client Complet (`src/lib/bussystem.ts`)
- **20+ endpoints** implementate cu tipuri TypeScript stricte
- Suport pentru autentificare, căutare, locuri, reduceri, bagaje, rezervări
- Sistem mock pentru dezvoltare și testare
- Gestionare errori și validări

### 2. Sistem Selectare Locuri
- **Hărți vizuale** generate dinamic din API (`get_plan`)
- Suport pentru **multiple segmente** per călătorie
- Validare restricții (ocupate, nu există, etc.)
- UI intuitiv cu drag & drop și click selection

### 3. Sistem Reduceri
- Atribuire **per pasager** cu logică separată dus/întors
- Validare compatibilitate reduceri cu rute
- Calcul automat prețuri cu reducere
- UI pentru gestionare reduceri complexe

### 4. Sistem Bagaje
- **Limite diferențiate** dus vs întors
- Validare **greutate/dimensiuni** per tip bagaj
- Calcul prețuri și restricții per operator
- Gestionare bagaje plătite vs gratuite

### 5. Sistem Rezervare Complet (`new_order`)
- **Payload complex** cu validări complete
- Suport **multi-trip** cu seat arrays
- **Promocode integration** cu reduceri automate
- Validare date pasageri (nume, telefon, naștere)

## Structura Fișierelor Cheie

```
src/
├── types/
│   ├── newOrder.ts          # Tipuri rezervare new_order
│   ├── seats.ts             # Tipuri selectare locuri
│   ├── discounts.ts         # Tipuri sistem reduceri
│   └── baggage.ts           # Tipuri sistem bagaje
├── lib/
│   ├── bussystem.ts         # Client API principal
│   ├── newOrderBuilder.ts   # Builder pentru payload rezervare
│   ├── mock-data.ts         # Date mock pentru dezvoltare
│   └── validation.ts        # Validări comune
├── components/
│   ├── BookingForm.tsx      # Form rezervare complet
│   ├── SeatSelectionDemo.tsx # Demo selectare locuri
│   └── ui/                  # Componente UI reutilizabile
└── pages/
    ├── BookingDemo.tsx      # Demo sistem complet
    ├── DiscountDemo.tsx     # Demo sistem reduceri
    └── BaggageDemo.tsx      # Demo sistem bagaje
```

## Exemple de Utilizare

### 1. Căutare Rute
```typescript
import { searchTickets } from '@/lib/bussystem';

const results = await searchTickets({
  from: "București", 
  to: "Cluj-Napoca",
  date: "2024-01-15"
});
```

### 2. Selectare Locuri
```typescript
import { getPlan, reserveSeats } from '@/lib/bussystem';

// Obținere plan autocar
const plan = await getPlan("12345");

// Rezervare locuri
const reservation = await reserveSeats({
  interval_id: "12345",
  seats: [3, 4, 5] // Locurile dorite
});
```

### 3. Aplicare Reduceri
```typescript
import { getDiscounts } from '@/lib/bussystem';

const discounts = await getDiscounts({
  interval_id: "12345",
  passengers: 3
});

// Aplicare reducere pentru pasagerul 1
const discountMap = { "1": "3196" }; // pasager index -> discount_id
```

### 4. Gestionare Bagaje
```typescript
import { getBaggage } from '@/lib/bussystem';

const baggageOptions = await getBaggage("12345");

// Selecție bagaje plătite per pasager
const baggage = {
  "0": ["bag_small_2", "bag_medium_2"] // trip 0, pasager cu 2 bagaje
};
```

### 5. Rezervare Completă
```typescript
import { newOrder } from '@/lib/bussystem';
import { buildNewOrderPayload } from '@/lib/newOrderBuilder';

const payload = await buildNewOrderPayload({
  trips: tripMeta,
  passengers: passengerData,
  promocode: "PROMO77ENDLESS"
});

const reservation = await newOrder(payload);
```

## Payload new_order Exemplu

```json
{
  "login": "demo_login",
  "password": "demo_password",
  "promocode_name": "PROMO77ENDLESS",
  "date": ["2024-01-15", "2024-01-22"],
  "interval_id": ["12345", "54321"],
  "seat": [
    ["3", "4", "5"],           // Trip 1: 3 pasageri, locuri simple
    ["5,1", "6,2", "7,3"]      // Trip 2: 3 pasageri, 2 segmente fiecare
  ],
  "name": ["Ion", "Maria", "Alex"],
  "surname": ["Popescu", "Ionescu", "Georgescu"],
  "birth_date": ["1990-05-15", "1985-08-22", "2000-12-10"],
  "discount_id": [
    {"1": "34835", "2": "3196"}, // Trip 1: pas.1,2 au reduceri
    {"0": "3199", "2": "3202"}   // Trip 2: pas.0,2 au reduceri
  ],
  "baggage": {
    "0": ["", "bag_small_2", "bag_small_2,bag_medium_2"],      // Trip 1
    "1": ["bag_large_ret", "", "bag_small_ret,bag_medium_ret"] // Trip 2
  },
  "phone": "0722123456",
  "currency": "EUR",
  "lang": "ro"
}
```

## Demo Pages Disponibile

### 1. Demo Complet - `/booking-demo`
- **Fluxul complet** de rezervare cu toate sistemele integrate
- **3 pasageri** cu date complete și validări
- **2 trip-uri** (dus-întors) cu segmente multiple
- **Reduceri diferențiate** per trip și pasager
- **Bagaje variate** per trip cu calcul prețuri
- **Promocode** cu aplicare automată

### 2. Demo Locuri - `/seat-selection-demo`
- Selectare interactivă cu hărți vizuale
- Multiple variante de planuri (autocar, microbuz)
- Validare restricții și disponibilitate

### 3. Demo Reduceri - `/discount-demo`
- Testare logică dus vs întors
- Compatibilitate reduceri cu rute
- Calcul prețuri cu reducere

### 4. Demo Bagaje - `/baggage-demo`
- Toate tipurile de bagaje cu prețuri
- Limite diferențiate dus/întors
- Validare restricții per operator

## Configurare pentru Producție

### 1. Credențiale API
```typescript
// În src/lib/bussystem.ts
const API_CONFIG = {
  BASE_URL: process.env.VITE_BUSSYSTEM_API_URL || 'https://api.bussystem.com',
  LOGIN: process.env.VITE_BUSSYSTEM_LOGIN,
  PASSWORD: process.env.VITE_BUSSYSTEM_PASSWORD
};
```

### 2. Variabile Mediu (.env)
```
VITE_BUSSYSTEM_API_URL=https://api.bussystem.com
VITE_BUSSYSTEM_LOGIN=your_login
VITE_BUSSYSTEM_PASSWORD=your_password
VITE_USE_MOCK_API=false
```

### 3. Dezactivare Mock API
```typescript
// În src/lib/mock-data.ts
const USE_MOCK = process.env.VITE_USE_MOCK_API === 'true';
```

## Validări Implementate

### new_order Payload
- ✅ **Lungimi egale** pentru date, interval_id, seat arrays
- ✅ **Același număr de pasageri** pentru toate trip-urile
- ✅ **Validare segmente** pentru trip-uri cu multiple segmente
- ✅ **Date obligatorii** pentru pasageri când needOrderData=1
- ✅ **Data nașterii** când needBirth=1
- ✅ **Structura corectă** pentru discount_id și baggage

### Sistem General
- ✅ **TypeScript strict** cu tipuri complete
- ✅ **Gestionare errori** centralizată
- ✅ **Validare input** pe toate nivelurile
- ✅ **Logging și debugging** integrat

## Testing și Debugging

### Console Logs Utile
```javascript
// În browser console pentru debugging
console.log("Current reservation payload:", payload);
console.log("Seat selections:", seatSelections);
console.log("Discount mapping:", discountMap);
console.log("Baggage assignments:", baggageMap);
```

### Mock API Testing
Toate endpoint-urile returnează date realiste pentru testare:
- Planuri de locuri variate cu restricții
- Reduceri cu compatibilitate și logică dus/întors
- Bagaje cu limite și prețuri diferențiate
- Rezervări cu prețuri calculate corect

## Integrare Frontend

Componentele sunt gata pentru integrare în orice aplicație React:

```tsx
import { BookingForm } from '@/components/BookingForm';
import { SeatSelectionDemo } from '@/components/SeatSelectionDemo';

// Utilizare în aplicația ta
<BookingForm 
  trips={trips}
  passengers={passengers}
  onReservationComplete={handleReservation}
/>
```

## Support și Documentație

- **API Bussystem**: Documentația oficială pentru toate endpoint-urile
- **TypeScript**: Tipuri complete pentru toate structurile de date
- **React**: Componente moderne cu hooks și best practices
- **Validări**: Sistem complet de validare pentru toate input-urile

---

**Status**: ✅ **IMPLEMENTARE COMPLETĂ**
**Ultima actualizare**: August 2025
**Versiune**: 1.0.0 - Production Ready
