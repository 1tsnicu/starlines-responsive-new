# SearchForm Autocomplete - Implementare pentru Autobuze

## Prezentare Generală

SearchForm-ul este configurat pentru a funcționa perfect cu sistemul de autobuze Bussystem. Implementarea include autocomplete avansat pentru selectarea orașelor de plecare și destinație.

## Configurare Actuală

### Transport
- **Tip transport**: Doar autobuze (`trans: "bus"`)
- **Toate orașele**: Include orașe populare și nepopulare (`all: 1`)
- **Limba**: Rusă pentru rezultate (`lang: "ru"`)

### Componente Utilizate

#### 1. BussystemAutocomplete în SearchForm
```tsx
<BussystemAutocomplete
  placeholder="Orașul de plecare" / "Orașul de destinație"
  value={fromCity / toCity}
  onSelect={handleFromPointSelect / handleToPointSelect}
  lang="ru"                     // Limba română pentru interface
  trans="bus"                   // Doar autobuze
  showCountry={true}            // Afișează țara în rezultate
  showDetails={false}           // Nu afișează detalii extra (optimizat pentru UI)
  minLength={2}                 // Min 2 caractere pentru căutare
  className="..."               // Stiluri pentru design frumos
/>
```

### API Integration

#### getPoints API Call
```typescript
await getPoints({ 
  autocomplete: query,          // Textul căutat de utilizator
  lang: "ru",                   // Limba răspunsului
  trans: "bus",                 // Doar autobuze
  all: 1,                       // Toate orașele, nu doar populare
  country_id                    // Opțional: filtrare după țară
});
```

### Parametrii Suportați

Conform API-ului Bussystem `get_points`, implementarea suportă:

✅ **Utilizați în producție:**
- `autocomplete` - Căutare după nume oraș
- `lang` - Limba răspunsului (ru)
- `trans` - Tip transport (bus)
- `all` - Toate orașele (1)
- `country_id` - Filtrare după țară (opțional)

🔄 **Disponibili pentru extensii viitoare:**
- `point_id_from` - Căutare după puncte accesibile din
- `point_id_to` - Căutare după puncte accesibile către
- `boundLatSW/LonSW/LatNE/LotNE` - Filtrare GPS
- `viev` - Tip răspuns (get_country, group_country)
- `group_by_point` - Grupare orașe cu stații
- `group_by_iata` - Grupare orașe cu aeroporturi

## Fluxul de Utilizare

### 1. Utilizatorul Deschide Pagina Principală
- SearchForm este afișat cu două câmpuri autocomplete
- Butoane pentru rute rapide populare
- Toggle pentru bilete dus/dus-întors

### 2. Căutarea Orașelor
```
Utilizator tastează "Bucu" → API call la get_points → 
Rezultate: București, Bucuresti, etc. → 
Utilizator selectează → Se salvează BussPoint complet
```

### 3. Salvarea Datelor
```typescript
// Când utilizatorul selectează un oraș
const handleFromPointSelect = (point: BussPoint) => {
  setFromPoint(point);  // Salvează obiectul complet
  setFromCity(point.point_ru_name || point.point_latin_name || '');
};
```

### 4. Căutarea Rutelor
```typescript
// Când utilizatorul caută bilete
const searchParams = {
  fromPointId: fromPoint?.point_id,  // ID-ul pentru get_routes
  toPointId: toPoint?.point_id,      // ID-ul pentru get_routes
  date: format(departureDate, "yyyy-MM-dd"),
  passengers: "1",
  baggage: "1"
};
```

## Tipuri de Date

### BussPoint (Obiect Oraș/Stație)
```typescript
interface BussPoint {
  point_id: string;               // Pentru get_routes API
  point_ru_name: string | null;   // Numele în rusă (principal)
  point_latin_name: string | null;// Numele latin (backup)
  point_name: string | null;      // Numele original
  country_name: string | null;    // Țara pentru afișare
  country_kod: string | null;     // Codul țării (3 litere)
  country_id: string | null;      // ID țării pentru filtrare
  point_name_detail: string | null; // Detalii stație (opțional)
}
```

## Afișarea Rezultatelor

### În Dropdown Autocomplete
```
București, România
Bucuresti Nord (autogara), România  
Bucharest Airport, România
```

### Format Afișare
- **Nume principal**: `point_ru_name` sau `point_latin_name`
- **Țara**: `country_name` (afișat cu virgulă)
- **Fără detalii**: `showDetails={false}` pentru UI curat

## Optimizări Implementate

### Performance
- **Debouncing**: 300ms delay pentru reducerea request-urilor
- **Minimum Length**: 2 caractere pentru căutare
- **Transport Fix**: Doar autobuze, fără verificări suplimentare
- **Cache**: React Query pentru rezultate frecvente

### UX/UI
- **Z-index**: Dropdown peste alte elemente (z-[100])
- **Navigare cu Tastatura**: Arrow keys, Enter, Escape
- **Loading States**: Indicator loading în timpul căutării
- **Error Handling**: Mesaje friendly pentru erori
- **Quick Routes**: Butoane pentru rute populare

### Dezvoltare
- **TypeScript**: Type safety completă
- **No Debug Logs**: Fără console.log în producție
- **Clean Code**: Cod optimizat și documentat

## Configurări Specifice Autobuze

### Transport Lock
```typescript
// În usePointsAutocomplete hook
trans: "bus", // Always use bus transport
all: 1,       // Include all cities, not just popular ones
```

### UI Optimizat
```typescript
showDetails={false}  // Nu afișează detalii extra pentru UI curat
showCountry={true}   // Afișează țara pentru claritate
minLength={2}        // Rapid response la 2 caractere
```

## Integrare cu Sistemul Complet

### 1. SearchForm → SearchResults
```typescript
// SearchForm trimite
{
  fromPointId: "123",     // Pentru get_routes
  toPointId: "456",       // Pentru get_routes  
  date: "2025-09-11",
  passengers: "1"
}

// SearchResults folosește
await getRoutes({
  point_id_from: fromPointId,
  point_id_to: toPointId,
  date: date,
  // ... alți parametri
});
```

### 2. URL Parameters
```
/search?from=București&to=Istanbul&date=2025-09-11&fromPointId=123&toPointId=456
```

### 3. Booking Integration
```typescript
// Pentru booking final
const bookingUrl = generateBookingUrl({
  pointFromId: fromPoint.point_id,
  pointToId: toPoint.point_id,
  date: selectedDate
});
```

## Benefits pentru Utilizatori

✅ **Căutare Rapidă**: Rezultate în timp real la 2 caractere
✅ **Toate Orașele**: Include și orașe mai mici, nu doar populare  
✅ **Autobuze Focus**: Doar rezultate relevante pentru autobuze
✅ **Interfață Curată**: Fără informații inutile, design frumos
✅ **Rute Rapide**: Butoane pentru destinații populare
✅ **Validare Completă**: Verificare orașe și date înainte de căutare

## Status Implementare

🟢 **Complet funcțional** pentru autobuze
🟢 **Optimizat pentru performance** 
🟢 **UI/UX finalizat**
🟢 **Integration ready** cu get_routes

Implementarea este gata pentru utilizare în producție!
