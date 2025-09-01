# Cum să lucrezi fără activarea contului Bussystem

Dacă nu poți activa încă contul de dealer la Bussystem, ai câteva opțiuni pentru a continua dezvoltarea:

## 1. Mock API (Recomandat pentru dezvoltare)

### Configurare automată
```bash
# Nu seta credențialele în .env și mock API va fi folosit automat
# VITE_BUSS_LOGIN=   # goală sau ștearsă
```

### Configurare manuală
```bash
# Forțează folosirea mock API
VITE_USE_MOCK_BUSSYSTEM=true
```

## 2. Test Mock vs Real API

Vizitează `/mock-vs-real-demo` pentru a testa și compara API-ul mock cu cel real.

## 3. Avantajele Mock API

✅ **Dezvoltare rapidă** - Nu depinzi de activarea contului  
✅ **Date consistente** - Răspunsuri predictibile pentru testing  
✅ **Offline work** - Lucrezi fără conexiune la internet  
✅ **Testing** - Testezi scenarii diverse (erori, succes, etc.)  

## 4. Caracteristici Mock API

- **Autocomplete orașe**: Suportă ~10 orașe europene
- **Căutare rute**: Generează 2 rute demo pentru orice combinație
- **Rezervări**: Simulează întreg flow-ul de rezervare
- **Locuri libere**: Returnează locuri random disponibile
- **Plăți**: Simulează plăți cu succes
- **Erori**: Testează diverse tipuri de erori

## 5. Structura Mock Data

```typescript
// Orașe disponibile
cities: [Chișinău, București, Istanbul, Moscow, Kiev, Warsaw, ...]

// Rute demo
routes: [
  Chișinău → București (8h 30m, 45 EUR),
  Chișinău → Istanbul (22h 15m, 89 EUR),
  Chișinău → Berlin (14h, 75 EUR)
]

// Interfața compatibilă Bussystem
mockBussystemAPI: {
  getPoints(),
  getRoutes(),
  getFreeSeats(),
  newOrder(),
  buyTicket(),
  reserveTicket()
}
```

## 6. Când să treci la API-ul real

```bash
# Când primești credențiale active de la Bussystem
VITE_BUSS_LOGIN=username-real
VITE_BUSS_PASSWORD=password-real
VITE_USE_MOCK_BUSSYSTEM=false
```

## 7. Testing Flow

1. **Dezvoltă cu Mock** - Implementează toată logica
2. **Testează componente** - Verifică UI/UX cu date consistente  
3. **Integrează gradual** - Comută la API real endpoint cu endpoint
4. **Production ready** - Când contul e activ, comută complet

## 8. Modificarea comportamentului

```typescript
// Adaugă orașe noi în mock-data.ts
export const cities = [
  { id: "new", name: "Orașul Nou", country: "România", code: "ON" },
  // ...
];

// Modifică rutele demo
export const routes = [
  {
    from: cities[0],
    to: cities[1], 
    price: 50,
    // ...
  }
];
```

## 9. Debugging

```bash
# Check ce mod folosești
console.log('Mock API:', import.meta.env.VITE_USE_MOCK_BUSSYSTEM)
console.log('Has credentials:', !!import.meta.env.VITE_BUSS_LOGIN)

# Force mock pentru testing
const useMock = true;
if (useMock) {
  const data = await mockBussystemAPI.getRoutes(params);
}
```

## 10. Tranziția către producție

1. **Contractează cu Bussystem** - Obține credențiale reale
2. **Activează contul** - Contactează suportul lor  
3. **Testează conectivitatea** - Folosește `/bussystem-demo`
4. **Update environment** - Setează credențialele reale
5. **Deploy** - Aplicația va funcționa identic

Mock API-ul este perfect pentru dezvoltare și te lasă să construiești întreg proiectul fără dependențe externe!
