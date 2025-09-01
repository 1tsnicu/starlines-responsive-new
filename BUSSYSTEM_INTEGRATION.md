# Integrarea Bussystem API - Ghid de Implementare

## 📋 Cerințe implementate

✅ **Base URL pentru test**: `https://test-api.bussystem.eu/server`  
✅ **Endpoint**: `POST /curl/get_points.php`  
✅ **Headers**: `Content-Type: application/json`, `Accept: application/json`  
✅ **Autentificare**: login/password în body  
✅ **TypeScript support** complet  
✅ **React hooks** pentru autocomplete  
✅ **Integrare în SearchForm** existent  

## 🔧 Configurare

### 1. Variabile de mediu

Fișierul `.env.local` este deja configurat cu credențialele de test:

```env
# Bussystem API Configuration (Test Environment)
VITE_BUSS_BASE_URL=https://test-api.bussystem.eu/server
VITE_BUSS_LOGIN=infobus-ws
VITE_BUSS_PASSWORD=infobus-ws
```

⚠️ **Status actual**: Credențialele sunt corecte, dar dealer-ul necesită activare în sistemul Bussystem.

### 2. Pentru producție

Când veți primi credențialele de producție, schimbați doar:

```env
VITE_BUSS_BASE_URL=https://api.bussystem.eu/server
VITE_BUSS_LOGIN=production_login
VITE_BUSS_PASSWORD=production_password
```

## 📁 Fișiere create/modificate

### Fișiere noi:

1. **`src/lib/bussystem.ts`** - Client API TypeScript cu:
   - Funcția `getPoints()` pentru autocomplete
   - Hook `usePointsAutocomplete()` pentru React
   - Types pentru `BussPoint`
   - Error handling complet

2. **`src/components/BussystemAutocomplete.tsx`** - Componentă UI pentru autocomplete cu:
   - Search cu debounce (300ms)
   - Suport pentru keyboard navigation (↑↓, Enter, Escape)
   - Loading states și error handling
   - Design consistent cu UI-ul existent

3. **`test-bussystem.js`** - Script de test pentru verificare rapidă

### Fișiere modificate:

1. **`src/components/SearchForm.tsx`** - Înlocuite input-urile simple cu `BussystemAutocomplete`
2. **`.env.local`** - Adăugate variabilele de configurare

## 🚀 Utilizare

### În SearchForm (deja implementat)

Componentele de autocomplete sunt integrate automat în formularul de căutare:

```tsx
<BussystemAutocomplete
  placeholder={t('search.fromPlaceholder')}
  value={fromCity}
  onSelect={handleFromPointSelect}
  className="w-full"
/>
```

### Manual în alte componente

```tsx
import { BussystemAutocomplete, BussPoint } from '@/components/BussystemAutocomplete';

function MyComponent() {
  const handlePointSelect = (point: BussPoint) => {
    console.log('Punctul selectat:', point);
    // point.point_id, point.point_ru_name, etc.
  };

  return (
    <BussystemAutocomplete
      placeholder="Căutați orașul..."
      onSelect={handlePointSelect}
    />
  );
}
```

### Direct cu API-ul

```tsx
import { getPoints, usePointsAutocomplete } from '@/lib/bussystem';

// Direct API call
const points = await getPoints("Прага", "ru");

// Sau cu hook în componente
const { data, loading, error } = usePointsAutocomplete(query);
```

## 🧪 Testare

### 1. Test cu script Node.js

```bash
# Setați credențialele
export BUSS_LOGIN=your_login
export BUSS_PASSWORD=your_password

# Rulați testul
node test-bussystem.js
```

### 2. Test în browser

Porniți aplicația și testați în SearchForm:
- Tastați minimum 2 caractere în câmpurile "De la" sau "Către"
- Ar trebui să apară dropdown cu sugestii
- Selectați o opțiune pentru a vedea că se completează automat

### 3. Test cu cURL

```bash
curl -X POST "https://test-api.bussystem.eu/server/curl/get_points.php" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "login":"your_login",
    "password":"your_password",
    "autocomplete":"Прага",
    "lang":"ru"
  }'
```

## 🔍 Debugging

### Mesaje de eroare comune:

1. **"dealer_no_activ"** - Dealer-ul nu este activat încă:
   - ✅ Credențialele sunt corecte
   - ❌ Dealer-ul necesită activare de către Bussystem
   - 📞 **Acțiune**: Contactați Bussystem pentru activarea dealer-ului
   - 🌐 **Pentru producție**: Solicitați și IP whitelist

2. **"Request timeout"** - API-ul nu răspunde în 15 secunde
3. **"BUSS login/password lipsesc"** - Verificați `.env.local`

### Console debugging:

În browser Console (F12), veți vedea erorile API:
- Network tab pentru requesturi HTTP
- Console tab pentru erori JavaScript

## 🎯 Extensii viitoare

Structura este pregătită pentru:

1. **Alte endpoint-uri** (căutare rute, rezervări etc.):
   ```ts
   // În bussystem.ts
   export async function searchRoutes(fromPointId: string, toPointId: string, date: string) {
     // implementare...
   }
   ```

2. **Cache pentru rezultate** frecvente
3. **Offline support** cu localStorage
4. **Multi-language** support (ru, ua, en)

## 📞 Support

Pentru probleme tehnice:
1. Verificați Network tab în DevTools
2. Rulați `node test-bussystem.js` pentru test rapid
3. Verificați console-ul pentru erori TypeScript

Pentru probleme cu API-ul Bussystem:
1. Contactați support-ul lor pentru credențiale/whitelist
2. Verificați documentația actualizată
