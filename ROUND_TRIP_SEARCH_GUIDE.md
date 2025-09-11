# Căutare Rute Dus-Întors (Round Trip) - Ghid Implementare

## Prezentare Generală

Am implementat funcționalitatea completă pentru căutarea rutelor dus-întors conform specificațiilor API Bussystem. Această funcționalitate respectă toate regulile pentru:

1. **Căutarea rutelor de dus** (outbound)
2. **Căutarea rutelor de întoarcere** (return) cu inversarea corectă a direcției
3. **Gestionarea transferurilor externe** (multiple interval_id)
4. **Validarea datelor** și restricțiilor temporale

## Funcții Principale Implementate

### 1. `getRoutes()` - Căutare Rute de Dus

```typescript
await getRoutes({
  date: "2023-11-30",          // Data plecării
  id_from: "3",                // ID punctul de plecare (din get_points)
  id_to: "6",                  // ID punctul de destinație  
  station_id_from: "123",      // Optional: ID stația specifică de plecare
  station_id_to: "456",        // Optional: ID stația specifică de destinație
  trans: "bus",                // "bus" sau "train"
  change: "auto",              // "auto" pentru conexiuni cu transferuri
  currency: "EUR",
  lang: "ru",
  v: "1.1"
});
```

### 2. `getRoutesReturn()` - Căutare Rute de Întoarcere

```typescript
await getRoutesReturn({
  // Datele din căutarea de dus (inversate automat)
  outbound_id_from: "3",           // Originala plecare dus
  outbound_id_to: "6",             // Originala destinație dus
  outbound_station_id_from: "123", // Originala stație plecare dus
  outbound_station_id_to: "456",   // Originala stație destinație dus
  outbound_arrival_date: "2023-12-01", // Data sosirii din ruta dus
  
  // Toate interval_id din ruta dus selectată (OBLIGATORIU!)
  interval_id: ["local|14916|Mjc...nw=|2023-11-30T10:34:50||d47e87b4"],
  
  // Parametrii pentru căutarea de retur
  date_return: "2023-12-14",       // Data retur (>= outbound_arrival_date)
  trans: "bus",
  currency: "EUR",
  lang: "ru"
});
```

### 3. Helper Functions

#### `extractIntervalsFromRoute(route)` 
Extrage toate interval_id dintr-o rută (inclusiv transferuri externe):

```typescript
const intervals = extractIntervalsFromRoute(selectedRoute);
// Returns: ["interval1", "interval2"] pentru rute cu transferuri
// Returns: ["interval1"] pentru rute simple
```

#### `createReturnSearchParams(selectedRoute, originalParams)`
Creează parametrii pentru căutarea de retur dintr-o rută selectată:

```typescript
const returnParams = createReturnSearchParams(selectedRoute, {
  id_from: "3",
  id_to: "6", 
  station_id_from: "123",
  date: "2023-11-30"
});
```

#### `validateReturnDate(arrivalDate, returnDate)`
Validează dacă data de retur este validă:

```typescript
const isValid = validateReturnDate("2023-12-01", "2023-12-14"); // true
```

#### `formatTransferInfo(route)`
Formatează informațiile despre transferuri:

```typescript
const transferInfo = formatTransferInfo(route);
// Returns: { hasTransfers, transferCount, segments[] }
```

## React Hooks

### 1. `useRouteSearch()` - Căutare Dus

```typescript
const { data: outboundRoutes, loading, error } = useRouteSearch({
  id_from: "3",
  id_to: "6", 
  date: "2023-11-30",
  station_id_from: "123",
  trans: "bus",
  currency: "EUR",
  lang: "ru"
});
```

### 2. `useReturnRouteSearch()` - Căutare Retur

```typescript
const { data: returnRoutes, loading, error } = useReturnRouteSearch({
  outbound_id_from: "3",
  outbound_id_to: "6",
  outbound_station_id_from: "123", 
  outbound_arrival_date: "2023-12-01",
  interval_id: ["interval_id_from_outbound"],
  date_return: "2023-12-14",
  trans: "bus",
  currency: "EUR",
  lang: "ru"
});
```

## Fluxul Complet de Implementare

### Pasul 1: Căutarea Rutelor de Dus

```typescript
// 1. Utilizatorul selectează orașele și data
const outboundResults = await getRoutes({
  date: "2023-11-30",
  id_from: fromPoint.point_id,     // Din autocomplete
  id_to: toPoint.point_id,         // Din autocomplete  
  station_id_from: "123",          // Optional, dacă este selectată o stație specifică
  trans: "bus",
  change: "auto",
  currency: "EUR",
  lang: "ru"
});
```

### Pasul 2: Utilizatorul Selectează Ruta de Dus

```typescript
// 2. Utilizatorul alege o rută din rezultate
const selectedOutboundRoute = outboundResults[selectedIndex];

// 3. Extragem interval_id pentru căutarea de retur
const intervals = extractIntervalsFromRoute(selectedOutboundRoute);

// 4. Calculăm data minimă pentru retur
const minReturnDate = selectedOutboundRoute.date_to; // Data sosirii
```

### Pasul 3: Căutarea Rutelor de Întoarcere

```typescript
// 5. Căutăm rutele de retur (direcția este inversată automat)
const returnResults = await getRoutesReturn({
  outbound_id_from: fromPoint.point_id,        // Original din căutarea dus
  outbound_id_to: toPoint.point_id,            // Original din căutarea dus
  outbound_station_id_from: "123",             // Original din căutarea dus
  outbound_arrival_date: selectedOutboundRoute.date_to,
  interval_id: intervals,                      // TOATE interval_id din dus
  date_return: userSelectedReturnDate,         // >= minReturnDate
  trans: "bus",
  currency: "EUR", 
  lang: "ru"
});
```

## Reguli Importante

### 1. Inversarea Direcției
- `id_from` ↔ `id_to` sunt inversate automat
- `station_id_from` ↔ `station_id_to` sunt inversate automat

### 2. Interval_ID Management
- Pentru rute simple: `interval_id: [route.interval_id]`
- Pentru rute cu transferuri: `interval_id: route.trips.map(t => t.interval_id)`
- **NU modificați niciodată aceste valori** - trimiteți exact așa cum au fost primite

### 3. Validări Temporale
- Data retur >= data sosirii dus
- Funcția `validateReturnDate()` verifică această regulă

### 4. Transferuri Externe
- Rute cu `trips[]` au transferuri externe (2+ operatori)
- Toate `interval_id` din `trips[]` trebuie incluse în căutarea de retur
- `change_route[]` conține detaliile fiecărui segment

## Exemple de Utilizare

### Exemplu 1: Rută Simplă (Fără Transferuri)

```typescript
// Dus: Praga -> Kiev
const outbound = await getRoutes({
  date: "2023-11-30",
  id_from: "3",  // Praga
  id_to: "6",    // Kiev
  station_id_from: "123" // Autovokzal Florenc
});

// Selectează ruta și caută retur
const selectedRoute = outbound[0]; // interval_id: "local|14916|..."
const returnRoutes = await getRoutesReturn({
  outbound_id_from: "3",
  outbound_id_to: "6", 
  outbound_station_id_from: "123",
  outbound_arrival_date: selectedRoute.date_to, // "2023-12-01"
  interval_id: [selectedRoute.interval_id],
  date_return: "2023-12-14"
});
```

### Exemplu 2: Rută cu Transferuri

```typescript
// Dus: București -> Berlin (cu transfer în Viena)
const outbound = await getRoutes({
  date: "2023-11-30", 
  id_from: "10", // București
  id_to: "15",   // Berlin
  change: "auto" // Permite transferuri
});

// Ruta cu transferuri va avea trips[]
const routeWithTransfers = outbound.find(r => r.trips?.length > 1);
const allIntervals = routeWithTransfers.trips.map(t => t.interval_id);

// Caută retur cu toate interval_id
const returnRoutes = await getRoutesReturn({
  outbound_id_from: "10",
  outbound_id_to: "15",
  outbound_arrival_date: routeWithTransfers.date_to,
  interval_id: allIntervals, // ["interval1", "interval2"] 
  date_return: "2023-12-20"
});
```

## Debugging și Troubleshooting

### Verifică Parametrii
```typescript
console.log('Outbound params:', {
  id_from, id_to, station_id_from, date
});

console.log('Selected route:', {
  interval_id: selectedRoute.interval_id,
  date_to: selectedRoute.date_to,
  has_transfers: selectedRoute.trips?.length > 1
});

console.log('Return params:', {
  // Atenție: id_from și id_to sunt inversate!
  swapped_direction: { from: id_to, to: id_from },
  intervals: extractIntervalsFromRoute(selectedRoute),
  min_return_date: selectedRoute.date_to
});
```

### Erori Comune
1. **Data retur prea devreme**: Verifică că `date_return >= route.date_to`
2. **Interval_ID lipsă**: Verifică că incluzi toate interval_id din trips[]
3. **Direcție greșită**: Nu inversa manual - funcția o face automat
4. **Stații greșite**: Verifică maparea stațiilor (from->to, to->from)

## Performanță și Limitări

- **Rate Limiting**: Max ~100 căutări pentru 1 comandă plătită
- **Cache**: Implementează caching pentru căutările repetate
- **Timeout**: Toate request-urile au timeout de 15 secunde
- **Retry Logic**: Implementează retry pentru request-urile failed

## Integrare cu UI

```typescript
// În componenta de căutare
const [searchResults, setSearchResults] = useState({
  outbound: [],
  return: [],
  selectedOutbound: null,
  canSearchReturn: false
});

const handleOutboundSelect = (route) => {
  setSearchResults(prev => ({
    ...prev,
    selectedOutbound: route,
    canSearchReturn: true,
    return: [] // Reset return results
  }));
  
  // Auto-search return sau așteaptă input utilizator
};
```

Această implementare respectă complet specificațiile API Bussystem și oferă o bază solidă pentru funcționalitatea dus-întors în aplicație.
