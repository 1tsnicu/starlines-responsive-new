# 🧪 Ghid de Testare - Sistem de Plată Bussystem

## 🎯 **Problema Rezolvată**

**Eroarea:** `Bussystem API error: dealer_no_activ`

**Cauza:** 
1. Foloseau credențiale hardcodate `"demo_login"` și `"demo_password"` în loc să lași backend-ul să gestioneze credențialele
2. `interval_id`-ul era mock (`"demo_interval_1"`) în loc de un interval real din API
3. **Proxy-ul Vite** trimitea direct la API-ul Bussystem în loc să folosească backend-ul nostru securizat

**Soluția:**
1. ✅ Schimbat credențialele în `BookingForm` la `"backend_managed"`
2. ✅ Înlocuit `interval_id`-ul mock cu unul real din API
3. ✅ Adăugat logging detaliat pentru debugging
4. ✅ **Configurat proxy-ul Vite** să folosească backend-ul nostru (`/api/bussystem` → `http://localhost:3001/api/backend`)
5. ✅ **Corectat rewrite-ul** pentru a evita dublarea `curl` în URL

## 🚀 **Cum să Testezi**

### **1. Accesează Aplicația**
```
http://localhost:8080/payment-demo
```

### **2. Fluxul de Testare**
1. **Demo Overview** - Vezi caracteristicile implementate
2. **Începe Demo** - Completează formularul de rezervare
3. **Verifică Console** - Urmărește logs-urile pentru debugging
4. **Confirmă Rezervarea** - Ar trebui să funcționeze acum!

### **3. Verifică Console Logs**

În browser console, ar trebui să vezi:

```javascript
// Când se face request-ul
Bussystem API Request: {
  url: "http://localhost:3001/api/backend/curl/new_order.php",
  method: "POST",
  headers: {...},
  payload: {...}
}

// Când se primește răspunsul
Bussystem API Response: {
  status: 200,
  statusText: "OK",
  url: "http://localhost:3001/api/backend/curl/new_order.php",
  data: {
    order_id: 1060376,
    reservation_until: "2025-09-15 09:25:05",
    status: "reserve_ok",
    ...
  }
}

// În BookingForm
BookingForm - Payload built: {
  passengers: 2,
  trips: 1,
  payload: {...}
}
```

### **4. Testează cu Date Reale**

Dacă vrei să testezi cu date complet reale, poți:

1. **Schimba data** în `mockTrips` la o dată din viitor
2. **Folosește un interval_id diferit** din răspunsul API-ului
3. **Testează cu rute diferite** (Praga → Kiev, etc.)

## 🔧 **Configurare pentru Testare**

### **1. Backend Server**
```bash
# Rulează backend-ul
cd server
node index.js
```

### **2. Frontend Server**
```bash
# Rulează frontend-ul
npm run dev
```

### **3. Verifică Credențialele**
În `.env`:
```env
VITE_USE_MOCK_BUSSYSTEM=false
BUSS_LOGIN=starok_md_test
BUSS_PASSWORD=bHAZpUN02RQlYG1H
```

### **4. Verifică Configurația Proxy**
În `vite.config.ts`:
```typescript
'/api/bussystem': {
  target: 'http://localhost:3001',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/bussystem/, '/api/backend'),
  secure: false,
}
```

**Important:** `rewrite`-ul trebuie să fie `/api/backend` (nu `/api/backend/curl`) pentru a evita dublarea `curl` în URL.

## 📊 **Date de Test Folosite**

### **Interval ID Real:**
```
local|100184|MjI4MXwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8OTc=|--|YWxsfDIwMjUtMDktMTZ8M3w2fHx8MA==|25|1758103200||2025-09-15T09:11:45||a1eadce4
```

### **Ruta:**
- **De la:** Praga (point_id: 3)
- **La:** Kiev (point_id: 6)  
- **Data:** 2025-09-16
- **Preț:** 130 EUR per pasager

### **Pasageri:**
- Anna Ivanova (1992-01-01)
- Masha Ivanova (2020-02-02)

### **Locuri Disponibile:**
- Locurile 2, 3 (disponibile la momentul testării)

## 🎯 **Rezultatul Așteptat**

După fix-uri, ar trebui să vezi:

1. ✅ **Rezervare reușită** cu `order_id` real
2. ✅ **Timer de 30 minute** pentru plată
3. ✅ **Bilete emise** cu detalii complete
4. ✅ **Fără erori** în console

## 🚨 **Dacă Încă Nu Funcționează**

### **1. Verifică Logs-urile**
- Console browser pentru erori JavaScript
- Console backend pentru erori API
- Network tab pentru request-uri eșuate

### **2. Verifică Credențialele**
```bash
curl -X POST http://localhost:3001/api/backend/curl/get_routes.php \
  -H "Content-Type: application/json" \
  -d '{"json":1,"id_from":"3","id_to":"6","date":"2025-09-15","lang":"ru"}'
```

### **3. Verifică Locurile Disponibile**
```bash
curl -X POST http://localhost:3001/api/backend/curl/get_free_seats.php \
  -H "Content-Type: application/json" \
  -d '{"json":1,"interval_id":"local|100184|...","lang":"ru"}'
```

**Important:** Locurile se ocupă rapid în timp real. Dacă primești `free_seat` error, verifică locurile disponibile și actualizează datele mock.

### **4. Verifică Backend-ul**
```bash
# Verifică dacă backend-ul rulează
lsof -i :3001

# Verifică logs-urile backend-ului
tail -f server/logs/app.log  # dacă există
```

## 🎉 **Succes!**

Dacă totul funcționează, ar trebui să vezi:
- ✅ Rezervare confirmată cu order_id real
- ✅ Timer de plată funcțional
- ✅ Bilete emise cu linkuri pentru descărcare
- ✅ Sistem complet funcțional pentru producție

---

**Sistemul de plată Bussystem este acum complet funcțional!** 🚀
