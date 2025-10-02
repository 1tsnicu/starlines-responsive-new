# 🔍 Debug Seat Selection Issue

## 📋 Pași pentru Testarea Problemei

### **1. Accesarea unei Rute Fără Plan**
1. Accesați aplicația pe `http://localhost:3001`
2. Căutați o rută cu `hasPlan = 0` (free seating 99 locuri)
3. Selectați o rută și accesați pagina de detalii

### **2. Verificarea Log-urilor în Browser**
1. Deschideți Developer Tools (F12)
2. Mergeți la tab-ul Console
3. Căutați log-urile cu următoarele prefixe:
   - `🚌 TripDetail DEBUG:` - Informații despre segmente
   - `🗺️ SeatMap DEBUG:` - Informații despre locurile generate
   - `🔍 canSelectSeat DEBUG:` - Verificarea selecției locurilor
   - `🎯 selectSeat called:` - Apelarea funcției de selecție

### **3. Testarea Selecției Multiple**
1. Setați numărul de pasageri la 2 sau mai mult
2. Încercați să selectați primul loc
3. Încercați să selectați al doilea loc
4. Verificați log-urile pentru a vedea unde se blochează

### **4. Informații Importante de Căutat în Log-uri**

#### **TripDetail DEBUG:**
```javascript
🚌 TripDetail DEBUG: {
  passengers: 2,                    // Numărul de pasageri
  seatMapsKeys: ["default"],        // Cheile segmentelor
  outboundSegmentsCount: 1,         // Numărul de segmente
  firstSegmentFreeSeats: 99         // Numărul de locuri disponibile
}
```

#### **SeatMap DEBUG:**
```javascript
🗺️ SeatMap DEBUG: {
  totalFreeSeats: 99,               // Total locuri în freeSeats
  availableSeats: 99,               // Locuri disponibile (seat_free === 1)
  hasPlan: 0,                       // Dacă există plan (0 = nu, 1 = da)
  firstFewSeats: ["1", "2", "3"...] // Primele locuri disponibile
}
```

#### **canSelectSeat DEBUG:**
```javascript
🔍 canSelectSeat DEBUG: {
  bustype_id: "default",            // ID-ul segmentului
  seatNumber: "1",                  // Numărul locului
  currentSelected: [],              // Locurile deja selectate
  passengers: 2,                    // Numărul de pasageri
  segmentsCount: 1                  // Numărul de segmente
}
```

### **5. Scenarii de Testare**

#### **Scenariul 1: Primul Loc**
1. Click pe primul loc disponibil
2. Verificați că apare: `✅ Selecting seat 1`
3. Verificați că locul devine selectat (culoare diferită)

#### **Scenariul 2: Al Doilea Loc**
1. Click pe al doilea loc disponibil
2. Verificați log-urile:
   - `🔍 Can select more seats: 1 < 2 = true`
   - `✅ Selecting seat 2`
3. Verificați că al doilea loc devine selectat

#### **Scenariul 3: Problema Potențială**
Dacă al doilea loc nu poate fi selectat, căutați:
- `❌ Cannot select seat 2`
- `❌ No segment found for bustype_id`
- `❌ Seat 2 not available`

### **6. Probleme Posibile și Soluții**

#### **Problema 1: Nu există segmente**
```javascript
❌ No segment found for bustype_id: default
```
**Soluție**: Verificați că `seatMaps` este populat corect

#### **Problema 2: Locurile nu sunt disponibile**
```javascript
❌ Seat 2 not available
```
**Soluție**: Verificați că `freeSeats` conține locurile cu `seat_free === 1`

#### **Problema 3: Limită de selecție**
```javascript
🔍 Can select more seats: 1 < 2 = false
```
**Soluție**: Verificați că `passengers` este setat corect

### **7. Comenzi pentru Testare Rapidă**

#### **În Browser Console:**
```javascript
// Verificați starea aplicației
console.log('Current passengers:', window.React?.passengers);
console.log('Current seatMaps:', window.React?.seatMaps);

// Testați selecția programatic
window.React?.selectOutboundSeat?.('default', '1');
window.React?.selectOutboundSeat?.('default', '2');
```

### **8. Raportarea Rezultatelor**

Când testați, vă rog să includeți:
1. **Log-urile complete** din Console
2. **Numărul de pasageri** setat
3. **Numărul de locuri** afișate
4. **Comportamentul exact** când încercați să selectați locurile
5. **Mesajele de eroare** (dacă există)

### **9. Exemple de Log-uri Corecte**

#### **Pentru 2 Pasageri, 99 Locuri:**
```javascript
🚌 TripDetail DEBUG: { passengers: 2, seatMapsKeys: ["default"], outboundSegmentsCount: 1, firstSegmentFreeSeats: 99 }
🗺️ SeatMap DEBUG: { totalFreeSeats: 99, availableSeats: 99, hasPlan: 0, firstFewSeats: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] }
🔍 canSelectSeat DEBUG: { bustype_id: "default", seatNumber: "1", currentSelected: [], passengers: 2, segmentsCount: 1 }
🔍 Seat availability check: { seatNumber: "1", normalizedSeat: "1", isAvailable: true, freeSeatsCount: 99, freeSeats: [...] }
🔍 Can select more seats: 0 < 2 = true
🎯 selectSeat called: bustype_id=default, seatNumber=1
✅ Selecting seat 1
```

---

**🎯 Obiectiv**: Identificarea exactă a locului unde se blochează selecția locurilor pentru mai mulți pasageri când nu există plan.
