# Autocomplete și Selectare Orașe/Stații - Ghid Implementare

## Prezentare Generală

Am implementat funcționalitatea completă pentru autocomplete și selectarea orașelor/stațiilor conform API-ului `get_points` Bussystem. Acesta include:

1. **Autocomplete Basic** - căutare simplă de orașe
2. **Autocomplete Avansat** - cu filtrare după țară și transport
3. **Selector Țări** - dropdown pentru selectarea țării
4. **Căutare Avansată** - combinație de toate funcționalitățile

## Componente Implementate

### 1. `BussystemAutocomplete` - Componentă Autocomplete de Bază

```tsx
import { BussystemAutocomplete } from '@/components/BussystemAutocomplete';

<BussystemAutocomplete
  placeholder="Căutați orașul..."
  value={city}
  onSelect={(point) => setSelectedPoint(point)}
  // Opțiuni avansate
  country_id="1"                    // Filtrare după țară
  trans="bus"                       // Tip transport
  lang="ru"                         // Limba
  showCountry={true}                // Afișează țara în rezultate
  showDetails={true}                // Afișează detalii
  minLength={2}                     // Min caractere pentru căutare
  className="w-full"
/>
```

### 2. `CountrySelector` - Selector pentru Țări

```tsx
import { CountrySelector } from '@/components/CountrySelector';

<CountrySelector
  selectedCountry={country}
  onSelect={(country) => setSelectedCountry(country)}
  lang="ru"
  placeholder="Selectează țara"
  showAllOption={true}              // Opțiunea "Toate țările"
  className="w-full"
/>
```

### 3. `AdvancedCitySearch` - Căutare Completă cu Filtre

```tsx
import { AdvancedCitySearch } from '@/components/AdvancedCitySearch';

<AdvancedCitySearch
  label="Orașul de plecare"
  placeholder="Căutați orașul cu filtre..."
  onSelect={(point) => setSelectedPoint(point)}
  showFilters={true}                // Afișează secțiunea de filtre
  enableCountryFilter={true}        // Permite filtrarea după țară
  enableTransportFilter={true}      // Permite filtrarea după transport
  lang="ru"
  className="w-full"
/>
```

## API Functions și Hooks

### 1. `getPoints()` - Funcție API Îmbunătățită

```typescript
import { getPoints } from '@/lib/bussystem';

// Căutare simplă
const points = await getPoints({
  autocomplete: "Praga",
  lang: "ru"
});

// Căutare cu filtre
const filteredPoints = await getPoints({
  autocomplete: "Bucu",
  country_id: "2",                  // România
  trans: "bus",
  lang: "ru",
  all: 1                           // Toate orașele, nu doar populare
});
```

### 2. `getCountries()` - Obținere Lista Țări

```typescript
import { getCountries } from '@/lib/bussystem';

const countries = await getCountries({
  lang: "ru"
});
```

### 3. `usePointsAutocomplete()` - Hook pentru Autocomplete

```typescript
import { usePointsAutocomplete } from '@/lib/bussystem';

const { data: points, loading, error } = usePointsAutocomplete("Praga", {
  debounceMs: 300,                  // Delay pentru debounce
  lang: "ru",
  country_id: "1",                  // Filtrare după țară
  trans: "bus",                     // Tip transport
  minLength: 2                      // Min caractere
});
```

### 4. `useCountries()` - Hook pentru Țări

```typescript
import { useCountries } from '@/lib/bussystem';

const { data: countries, loading, error } = useCountries({
  lang: "ru",
  enabled: true                     // Activează/dezactivează request-ul
});
```

## Integrare în SearchForm

În `SearchForm.tsx` am actualizat autocomplete-ul pentru o experiență mai bună:

```tsx
<BussystemAutocomplete
  placeholder="Orașul de plecare"
  value={fromCity}
  onSelect={handleFromPointSelect}
  lang="ru"                         // Limba română pentru interface
  trans="bus"                       // Doar autobuze
  showCountry={true}                // Afișează țara
  showDetails={true}                // Afișează detalii stație
  minLength={2}                     // Min 2 caractere
  className="w-full h-12 bg-white/95..."
/>
```

## Parametrii API Suportați

Implementarea suportă toți parametrii din API-ul `get_points`:

- ✅ `autocomplete` - Filtrare după nume
- ✅ `lang` - Limba răspunsului
- ✅ `country_id` - Filtrare după țară
- ✅ `point_id_from` - Puncte accesibile din punct
- ✅ `point_id_to` - Puncte accesibile către punct
- ✅ `trans` - Tip transport (bus, train, air, etc.)
- ✅ `viev` - Tip răspuns (get_country, group_country)
- ✅ `group_by_point` - Grupare orașe cu stații
- ✅ `group_by_iata` - Grupare orașe cu aeroporturi
- ✅ `all` - Toate orașe vs doar populare
- ✅ `boundLatSW`, `boundLonSW`, `boundLatNE`, `boundLotNE` - Filtrare GPS

## Exemple de Utilizare

### 1. Autocomplete Simplu (SearchForm Actual)

```tsx
const [fromCity, setFromCity] = useState("");
const [fromPoint, setFromPoint] = useState<BussPoint | null>(null);

<BussystemAutocomplete
  placeholder="De unde plecați?"
  value={fromCity}
  onSelect={(point) => {
    setFromPoint(point);
    setFromCity(point.point_ru_name || point.point_latin_name || '');
  }}
  lang="ru"
  trans="bus"
/>
```

### 2. Autocomplete cu Filtrare după Țară

```tsx
const [selectedCountry, setSelectedCountry] = useState(null);
const [selectedCity, setSelectedCity] = useState(null);

// Selectorul de țară
<CountrySelector
  selectedCountry={selectedCountry}
  onSelect={setSelectedCountry}
/>

// Autocomplete filtrat
<BussystemAutocomplete
  placeholder="Selectați orașul..."
  country_id={selectedCountry?.country_id}
  onSelect={setSelectedCity}
  showCountry={false}  // Nu afișa țara dacă e deja filtrată
/>
```

### 3. Căutare Completă cu Toate Filtrele

```tsx
<AdvancedCitySearch
  label="Orașul de destinație"
  placeholder="Unde mergeți?"
  onSelect={(point) => {
    console.log('Selected:', point);
    // point.point_id, point.point_name, etc.
  }}
  showFilters={true}
  enableCountryFilter={true}
  enableTransportFilter={true}
/>
```

## Tipuri de Date

### BussPoint (Punct/Oraș)

```typescript
interface BussPoint {
  point_id: string;                 // ID-ul punctului
  point_ru_name: string | null;     // Numele în rusă
  point_ua_name: string | null;     // Numele în ucraineană
  point_latin_name: string | null;  // Numele latin
  point_name: string | null;        // Numele principal
  country_name: string | null;      // Numele țării
  country_kod: string | null;       // Codul țării (3 litere)
  country_id: string | null;        // ID-ul țării
  point_name_detail: string | null; // Detalii suplimentare
  priority: string | null;          // Prioritatea punctului
}
```

### Country (Țară)

```typescript
interface Country {
  country_id: string;               // ID-ul țării
  country_kod: string;              // Cod țară (3 litere)
  country_kod_two: string;          // Cod țară (2 litere)
  country_name: string;             // Numele țării
  currency: string;                 // Moneda
  time_zone: string;                // Fusul orar
}
```

## Fluxul de Căutare Complet

1. **Utilizatorul deschide formularul de căutare**
2. **Începe să tasteze orașul** (min 2 caractere)
3. **Se face debounced request** la `get_points` cu `autocomplete`
4. **Se afișează rezultatele** cu nume, țară, detalii
5. **Utilizatorul selectează orașul** → se salvează `BussPoint`
6. **Se folosește `point_id`** pentru căutarea rutelor cu `get_routes`

## Beneficii Implementare

### Pentru Utilizatori
- ✅ Căutare rapidă și intuitivă
- ✅ Afișare detalii complete (țară, stații, etc.)
- ✅ Filtrare avansată după țară și transport
- ✅ Suport pentru multiple limbi
- ✅ Navigare cu tastatura (arrows, Enter, Escape)

### Pentru Dezvoltatori
- ✅ API complet implementat conform documentației
- ✅ Tipuri TypeScript complete
- ✅ Hooks React optimizate
- ✅ Componente reutilizabile
- ✅ Debouncing pentru performanță
- ✅ Error handling robust

## Testing

Pentru a testa funcționalitățile, vizitează:
- **Pagina principală**: `http://localhost:8081/` (SearchForm îmbunătățit)
- **Pagina de test**: `http://localhost:8081/test/autocomplete` (toate componentele)

## Performance și Optimizări

- **Debouncing**: 300ms delay pentru reducerea request-urilor
- **Minimum Length**: Min 2 caractere pentru căutare
- **Caching**: React Query cache pentru countries și rezultate frecvente
- **Error Handling**: Retry logic și afișare erori user-friendly
- **TypeScript**: Type safety completă pentru toate API-urile

## Extensii Viitoare

Poți extinde funcționalitatea pentru:
- 🔄 GPS filtering pentru căutare în zone geografice
- 🚂 Integrare cu alte tipuri de transport (train, air)
- 🗺️ Mapare vizuală a punctelor
- 📱 Suport pentru favorite și istoric căutări
- 🌐 Localizare completă în română

Această implementare oferă o bază solidă pentru căutarea și selectarea orașelor/stațiilor în sistemul de bilete autobus!
