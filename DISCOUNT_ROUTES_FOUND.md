# 🎯 RUTE CU DISCOUNTURI GĂSITE

## **Rute Kiev → Praga (2025-09-20)**

### **1. 🚌 REGABUS - "4732 Київ-Плзень"**
- **Interval ID**: `local|100874|OTM0NnwyMDI1LTA5LTIwfHwyMDI1LTA5LTIwfEVVUnx8|--|YWxsfDIwMjUtMDktMjB8NnwzfHx8MA==|203|1758427200||2025-09-16T15:08:15||74cbca58`
- **Preț**: 63.12 EUR
- **Discounturi disponibile**:
  - `10% Пенсионеры` - 56.81 EUR
  - `20% Дети 5-15 лет` - 50.5 EUR  
  - `50% Дети 0-4 лет` - 31.56 EUR
- **Bagaj**: `request_get_baggage: true`
- **Plecare**: 10:00 - Автостанция "Киев", ул.С.Петлюры 32
- **Sosire**: 06:00 - Автовокзал "Флоренц"

### **2. 🚌 Oles Trans Carrier - "Київ - Прага (12:00)"**
- **Interval ID**: `local|100231|Mjg2NXwyMDI1LTA5LTIwfHwyMDI1LTA5LTIwfEVVUnx8|--|YWxsfDIwMjUtMDktMjB8NnwzfHx8MA==|4|1758486600||2025-09-16T15:08:15||46c6a0f7`
- **Preț**: 44.42 EUR
- **Discounturi disponibile**:
  - `10% Пенсионеры от 60 лет` - 39.98 EUR
  - `10% Группа от 6 чел.` - 39.98 EUR
  - `10% 1 ребенок до 12 лет` - 39.98 EUR
  - `15% Студент` - 37.76 EUR
  - `20% Дети 5-12 лет` - 35.54 EUR
  - `50% Дети 0-4 лет` - 22.21 EUR
- **Bagaj**: `request_get_baggage: false`
- **Plecare**: 12:00 - Автостанция "Киев", ул.С.Петлюры 32
- **Sosire**: 22:30 - Автовокзал "Флоренц"

### **3. 🚌 Default carrier - "Киев - Прага (14:00)"**
- **Interval ID**: `local|100354|OTEzNXwyMDI1LTA5LTIwfHwyMDI1LTA5LTIwfEVVUnx8OTc=|--|YWxsfDIwMjUtMDktMjB8NnwzfHx8MA==|25|1758459600||2025-09-16T15:08:15||70c62e6a`
- **Preț**: 206.47 EUR
- **Discounturi disponibile**:
  - `10% Пенсионеры от 60 лет` - 185.82 EUR
  - `10% Группа от 6 чел.` - 185.82 EUR
  - `15% Студент` - 175.5 EUR
  - `20% Дети 0-12 лет` - 165.18 EUR
  - `50% Дети 0-4 лет` - 103.23 EUR
- **Bagaj**: `request_get_baggage: false`
- **Plecare**: 14:00 - Ж/Д Вокзал "Южный", ул.Петрозаводская
- **Sosire**: 15:00 - Автовокзал "Флоренц"

### **4. 🚌 Oles Trans Carrier - "Київ - Прага"**
- **Interval ID**: `local|100502|NTkwMHwyMDI1LTA5LTIwfHwyMDI1LTA5LTIwfEVVUnx8|--|YWxsfDIwMjUtMDktMjB8NnwzfHx8MA==|4|1758486600||2025-09-16T15:08:15||f119e7f6`
- **Preț**: 44.42 EUR
- **Discounturi disponibile**:
  - `10% Пенсионеры от 60 лет` - 39.98 EUR
  - `10% Группа от 6 чел.` - 39.98 EUR
  - `15% Студент` - 37.76 EUR
  - `20% Дети 5-12 лет` - 35.54 EUR
  - `50% Дети 0-4 лет` - 22.21 EUR
- **Bagaj**: `request_get_baggage: true`
- **Plecare**: 17:05 - Автостанция "Киев", ул.С.Петлюры 32
- **Sosire**: 22:30 - Автовокзал "Розтылы"

### **5. 🚌 International transportation - "Київ - Прага"**
- **Interval ID**: `local|100932|OTYwOHwyMDI1LTA5LTIwfHwyMDI1LTA5LTIwfEVVUnx8|--|YWxsfDIwMjUtMDktMjB8NnwzfHx8MA==|241|1758466800||2025-09-16T15:08:15||67cb2a0d`
- **Preț**: 2.66 EUR (foarte ieftin!)
- **Discounturi disponibile**:
  - `10% Группа от 6 чел.` - 2.39 EUR
  - `10% Пенсионеры от 60 лет` - 2.39 EUR
  - `15% Студент` - 2.26 EUR
  - `20% Дети 5-12 лет` - 2.13 EUR
  - `50% Дети 0-4 лет` - 1.33 EUR
- **Bagaj**: `request_get_baggage: false`
- **Plecare**: 19:00 - Автовокзал "Полесье", площ.Тараса Шевченко
- **Sosire**: 17:00 - Автовокзал "Флоренц"

## **Rute Praga → Warszawa (2025-09-22)**

### **6. 🚌 Ruta cu discounturi**
- **Interval ID**: (de verificat în prague_warsaw_routes.json)
- **Discounturi**: 1 rută cu `request_get_discount: true` găsită

---

## **🧪 INSTRUCȚIUNI PENTRU TESTARE**

### **Pentru a testa discounturile în frontend:**

1. **Deschide aplicația** și mergi la pagina de căutare
2. **Selectează ruta**: Kiev → Praga, data: 20.09.2025
3. **Alege una din rutele de mai sus** (recomand **Ruta #2** - Oles Trans Carrier, 44.42 EUR)
4. **Verifică în consolă** log-urile cu "Booking price calculation"
5. **Selectează un discount** dacă este disponibil (ex: "10% Пенсионеры от 60 лет")
6. **Verifică butonul "Continue to Checkout"** - ar trebui să afișeze prețul cu discount aplicat

### **Log-uri așteptate:**
```javascript
Booking price calculation: {
  outboundTotalPrice: 44.42,        // prețul biletului
  baseTotalPrice: 44.42,            // biletul de bază
  totalDiscountAmount: 4.44,        // discount 10% (44.42 * 0.1)
  totalBaggageAmount: 0,            // bagaj (dacă nu este selectat)
  finalTotalPrice: 39.98,           // totalul final (44.42 - 4.44)
  outboundDiscountDetails: {...}    // detaliile discounturilor
}
```

### **Rutele recomandate pentru testare:**
- **Ruta #2** (Oles Trans Carrier) - preț mic, multe discounturi
- **Ruta #4** (Oles Trans Carrier) - are și bagaj și discounturi
- **Ruta #5** (International transportation) - preț foarte mic pentru testare rapidă

---

## **🎯 REZULTATUL CĂUTĂRII**

✅ **6 rute cu discounturi găsite** în total:
- **5 rute** Kiev → Praga cu discounturi în datele rutei (`request_get_discount: false`)
- **1 rută** Praga → Warszawa cu `request_get_discount: true` (necesită API call)

**Toate rutele au discounturi disponibile pentru testare!** 🚀
