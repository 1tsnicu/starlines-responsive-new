# Plan de Integrare Bussystem - Starlight Routes

## 📧 Răspuns Oficial Primit de la Bussystem

**Propunerea lor:**
1. Implementezi integrarea → Semnezi contractul → Verifică integrarea → Primești accesuri de producție
2. Credentiale de test: **vor fi trimise astăzi**
3. **Comision:** ~10% din biletul vândut (variabil, dar 95% din cazuri este 10%)
4. **Depozit minim:** 150 EUR (sistem de pre-plată)
5. **Markup:** Poți adăuga până la 50% la prețul biletului
6. **Acoperire:** Tot infobus.eu **MINUS** Flixbus

## 📖 Documentație API
- **URL:** https://bussystem.eu/api/
- **Login:** `infobus-ws`
- **Parola:** `infobus-ws`

## 💰 Model de Business ACTUALIZAT

### Sistem Depozit (Pre-plată)
✅ **Exemplu funcționare:**
- Depui: 1000 EUR
- Client cumpără bilet: 100 EUR
- Sistem deduce: 90 EUR din depozit
- Tu primești: 10 EUR comision
- Rămân: 910 EUR pentru următoarele vânzări

### Avantaje
1. **Comision garantat** - 10% din fiecare vânzare
2. **Markup flexibil** - până la 50% adaos la preț
3. **Acoperire largă** - tot infobus.eu (minus Flixbus)
4. **Control complet** - buy_ticket disponibil cu depozit

## 🎯 Strategie Recomandată: TESTARE → CONTRACTARE

### Pașii de Implementare

#### 1. Faza de Testare (ACUM)
**Pășii imediați:**
- ✅ **Astăzi:** Primești credentiale de test
- ✅ **Săptămâna aceasta:** Implementezi și testezi API-ul
- ✅ **Documentația:** https://bussystem.eu/api/ (login: `infobus-ws`, password: `infobus-ws`)

#### 2. Funcții API Disponibile cu Depozit
✅ **Acces COMPLET la toate API-urile:**
- `get_points` - Căutare orașe/puncte
- `get_routes` - Căutare rute  
- `get_seats` - Verificare locuri
- `new_order` - Creare comandă
- `buy_ticket` - **PLATĂ DIRECTĂ** (disponibilă cu depozit!)
- `get_order` - Verificare comandă
- `cancel_order` - Anulare comandă

#### 3. Workflow de Integrare COMPLET

```
1. Utilizator caută rute → API get_routes
2. Selectează rută → API get_seats
3. Completează date → API new_order  
4. Plată directă → API buy_ticket (deduce din depozit)
5. Bilet emis → Client primește biletul instant
```

**Avantaj MAJOR:** Nu mai ai nevoie de redirect - totul se întâmplă în aplicația ta!

#### 4. URLs și Configurare
- **API Documentation:** https://bussystem.eu/api/
- **Test Login:** `infobus-ws`
- **Test Password:** `infobus-ws` 
- **Credentiale personale:** vor veni astăzi prin email

#### 5. Calculul Profitului

**Exemplu practic:**
```
Preț bilet: 50 EUR
+ Markup-ul tău (max 50%): +25 EUR  
= Preț final pentru client: 75 EUR

Din vânzare:
- Dedus din depozit: 50 EUR (costul biletului)
- Comisionul tău: 5 EUR (10% din 50 EUR)
- Markup-ul tău: 25 EUR
= Profit total: 30 EUR (40% din preț!)
```

### Avantaje pentru Starlight Routes

1. **Profit Maxim** 
   - 10% comision garantat + până la 50% markup
   - Exemplu: 30 EUR profit la un bilet de 50 EUR

2. **Control Complet**
   - buy_ticket disponibil - plata se face direct în aplicația ta
   - Nu mai ai redirect-uri, experiența utilizatorului este perfectă

3. **Acoperire Largă**
   - Tot infobus.eu (minus Flixbus) 
   - Mii de rute în Europa de Est

4. **Risc Minim**
   - Depozit minim: doar 150 EUR pentru început
   - Depozitul se returnează la încetarea colaborării

### Integrare Tehnică ACTUALIZATĂ

#### Modifică biblioteca existentă (`src/lib/bussystem.ts`):

```typescript
export const defaultBussystemConfig: BussystemConfig = {
  baseUrl: 'https://bussystem.eu/api', // URL actualizat
  login: 'YOUR_LOGIN',     // Din credentialele primite astăzi
  password: 'YOUR_PASSWORD', // Din credentialele primite astăzi
  useMockData: false,      // Pentru testare cu API real
  defaultLang: 'ru',
  defaultCurrency: 'EUR',
  hasDepositAccount: true  // Activează buy_ticket
};
```

#### Workflow actualizat:

```typescript
// 1. Caută rute
const routes = await api.searchRoutes({...});

// 2. Vezi locurile  
const seats = await api.getSeats(routeId);

// 3. Creează comanda
const order = await api.createOrder({...});

// 4. PLATĂ DIRECTĂ (nou!)
const payment = await api.buyTicket({
  orderId: order.id,
  amount: totalPrice // inclusiv markup-ul tău
});

// 5. Biletul e gata!
if (payment.success) {
  // Afișează biletul utilizatorului
  console.log('Bilet emis:', payment.ticket);
}
```

### Next Steps ACTUALIZAȚI
1. ✅ **Astăzi:** Primești credentialele de test prin email
2. ✅ **Mâine:** Accesezi documentația și înțelegi API-ul 
3. ✅ **Săptămâna aceasta:** Implementezi și testezi complet
4. ✅ **Săptămâna viitoare:** Semnezi contractul electronic
5. ✅ **După contract:** Primești credentiale de producție + depui 150 EUR
6. 🚀 **Go Live:** Începi să vinzi bilete cu profit real!
