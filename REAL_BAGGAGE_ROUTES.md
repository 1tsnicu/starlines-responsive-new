# Rute Reale cu Opțiuni de Bagaj

## Rute găsite prin API-ul Bussystem cu `request_get_baggage: true`

### 1. Kiev → Warsaw (Kiev → Warszawa)
**Interval ID:** `local|100502|NTkwMXwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8NTd8fHww|4|1758096000||2025-09-16T10:54:00||2bcaafbf`

**Detalii rute:**
- **Plecare:** Kiev, Bus Station "Kiev", 32 S.Petlyry str. (Railway Station) - 17:05
- **Sosire:** Warszawa, Bus Station "Zachodnia", Al. Jerozolimskie 144 - 10:00+1
- **Durată:** 17:55
- **Preț:** €28.05
- **Operator:** Oles Trans Carrier
- **Autobuz:** Bus-2 (49 seats)

**Bagaje disponibile:**
```json
[
  {
    "baggage_id": "90",
    "baggage_type_id": "15", 
    "baggage_type": "large_baggage",
    "baggage_type_abbreviated": "БАГАЖ Б/М",
    "baggage_title": "Large luggage",
    "length": "100",
    "width": "50", 
    "height": "50",
    "kg": "40",
    "max_in_bus": "30",
    "max_per_person": "2",
    "typ": "route",
    "price": 0,
    "currency": "EUR"
  },
  {
    "baggage_id": "302",
    "baggage_type_id": "17",
    "baggage_type": "small_baggage", 
    "baggage_type_abbreviated": "БАГАЖ М/М",
    "baggage_title": "Small luggage",
    "length": "10",
    "width": "20",
    "height": "15", 
    "kg": "10",
    "max_in_bus": "20",
    "max_per_person": "1",
    "typ": "route",
    "price": 0,
    "currency": "EUR"
  },
  {
    "baggage_id": "303",
    "baggage_type_id": "17",
    "baggage_type": "small_baggage",
    "baggage_type_abbreviated": "БАГАЖ М/М", 
    "baggage_title": "Small luggage",
    "length": "10",
    "width": "20",
    "height": "15",
    "kg": "10", 
    "max_in_bus": "10",
    "max_per_person": "2",
    "typ": "route",
    "price": 14.03,
    "currency": "EUR"
  },
  {
    "baggage_id": "91",
    "baggage_type_id": "15",
    "baggage_type": "large_baggage",
    "baggage_type_abbreviated": "БАГАЖ Б/М",
    "baggage_title": "Large luggage", 
    "length": "100",
    "width": "50",
    "height": "50",
    "kg": "40",
    "max_in_bus": "30", 
    "max_per_person": "1",
    "typ": "route",
    "price": 16.67,
    "currency": "EUR"
  }
]
```

### 2. Kiev → Warsaw (Kiev → Warszawa) - Ruta Kovalchuk
**Interval ID:** `local|100240|MzA4NnwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8NTd8fHww|25|1758096000||2025-09-16T10:54:00||26b37feb`

**Detalii rute:**
- **Plecare:** Kiev, Bus Station "Kiev", 32 S.Petlyry str. (Railway Station) - 19:00
- **Sosire:** Warszawa, Bus Station "Zachodnia", Al. Jerozolimskie 144 - 10:00+1
- **Durată:** 16:00
- **Preț:** €37.40
- **Operator:** Default carrier
- **Autobuz:** Neoplan (49 seats)

**Bagaje disponibile:**
```json
[
  {
    "baggage_id": "139",
    "baggage_type_id": "8",
    "baggage_type": "medium_baggage",
    "baggage_type_abbreviated": "БАГАЖ С/М", 
    "baggage_title": "Medium luggage",
    "length": "50",
    "width": "20",
    "height": "40",
    "kg": "15",
    "max_in_bus": "25",
    "max_per_person": "1",
    "typ": "route", 
    "price": 11.69,
    "currency": "EUR"
  }
]
```

### 3. Kiev → Prague (Kiev → Praha)
**Interval ID:** `local|100502|NTkwMHwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8M3x8fDA=|4|1758141000||2025-09-16T10:54:41||4b8fcd22`

**Detalii rute:**
- **Plecare:** Kiev, Bus Station "Kiev", 32 S.Petlyry str. (Railway Station) - 17:05
- **Sosire:** Praha, Bus Station "Roztyly" - 22:30+1
- **Durată:** 30:25
- **Preț:** €44.42
- **Operator:** Oles Trans Carrier
- **Autobuz:** Bus-2 (49 seats)

**Bagaje disponibile:** (aceleași ca ruta Kiev → Warsaw)

### 4. Kiev → Prague (Kiev → Praha) - Ruta Kovalchuk
**Interval ID:** `local|100240|MzA4N3wyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8M3x8fDA=|25|1758141000||2025-09-16T10:54:41||5afd199e`

**Detalii rute:**
- **Plecare:** Kiev, Bus Station "Kiev", 32 S.Petlyry str. (Railway Station) - 19:00
- **Sosire:** Praha, Florenz Bus Station - 22:30+1
- **Durată:** 28:30
- **Preț:** €37.40
- **Operator:** Default carrier
- **Autobuz:** Neoplan (49 seats)

**Bagaje disponibile:** (aceleași ca ruta Kiev → Warsaw Kovalchuk)

## ID-uri stații pentru testare:

### Kiev (Ukraine):
- **Punct ID:** 6
- **Stația principală:** 777 - Bus Station "Kiev", 32 S.Petlyry str. (Railway Station)
- **Alte stații:** 2029 - Bus Station "Polesye", T.Shevcenko sq. 2

### Warszawa (Poland):
- **Punct ID:** 57  
- **Stația principală:** 921 - Bus Station "Zachodnia", Al. Jerozolimskie 144

### Praha (Czech Republic):
- **Punct ID:** 3
- **Stația principală:** 123 - Florenz Bus Station
- **Alte stații:** 3872 - Bus Station "Roztyly"

## Pentru testarea în frontend:

### Test 1 - Kiev → Warsaw (bagaje multiple):
```javascript
{
  interval_id: "local|100502|NTkwMXwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8NTd8fHww|4|1758096000||2025-09-16T10:54:00||2bcaafbf",
  station_from_id: "777",
  station_to_id: "921", 
  currency: "EUR",
  lang: "en"
}
```

### Test 2 - Kiev → Warsaw (bagaj mediu):
```javascript
{
  interval_id: "local|100240|MzA4NnwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8NTd8fHww|25|1758096000||2025-09-16T10:54:00||26b37feb",
  station_from_id: "777",
  station_to_id: "921",
  currency: "EUR", 
  lang: "en"
}
```

### Test 3 - Kiev → Prague:
```javascript
{
  interval_id: "local|100502|NTkwMHwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8M3x8fDA=|4|1758141000||2025-09-16T10:54:41||4b8fcd22",
  station_from_id: "777",
  station_to_id: "3872",
  currency: "EUR",
  lang: "en"
}
```

## Tipuri de bagaje găsite:

1. **Large luggage (БАГАЖ Б/М)** - 100x50x50 cm, 40 kg
   - Gratuit sau €16.67
   
2. **Small luggage (БАГАЖ М/М)** - 10x20x15 cm, 10 kg  
   - Gratuit sau €14.03

3. **Medium luggage (БАГАЖ С/М)** - 50x20x40 cm, 15 kg
   - €11.69

## Note importante:

- Toate rutele sunt pentru data 2025-09-16
- Interval ID-urile sunt valabile doar pentru această dată
- Pentru testare în altă dată, trebuie să faci cerere nouă la get_routes
- Bagajele gratuite (price: 0) nu se trimit la new_order
- Bagajele plătite se trimit cu baggage_id și qty la new_order
