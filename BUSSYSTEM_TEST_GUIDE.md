# 🧪 Test API Bussystem - Quick Guide

## 🎉 CORS PROBLEM REZOLVAT!

**Problema CORS a fost rezolvată folosind un proxy Vite!**

## 🔗 Link de Test
**Pagina de test:** http://localhost:8080/bussystem-test

## 🔧 Configurația Actuală

### ✅ API de Test (Prin Proxy)
- **URL Local:** `/api/bussystem-test` (proxy către `test-api.bussystem.eu`)
- **Status:** ✅ Funcționează - vezi răspunsul `{"error":"dealer_no_activ"}`
- **CORS:** ✅ Rezolvat prin proxy Vite
- **Următorul pas:** Credentiale de autentificare

### ⏳ API Real (Prin Proxy)  
- **URL Local:** `/api/bussystem-real` (proxy către `bussystem.eu/api`)
- **Status:** ⏳ În așteptarea credentialelor

## 🚀 Cum să Testezi ACUM

### 1. Test Proxy (Fără Credentiale)
1. Accesează http://localhost:8080/bussystem-test
2. Apasă **"🔍 Test Raw API"** 
3. **Rezultat așteptat:** `{"error":"dealer_no_activ"}` ✅
4. **Înseamnă:** Proxy funcționează, dar trebuie credentiale

### 2. Test Cu Credentiale (Când le Primești)
1. Completează **Login** și **Password** în formular
2. Apasă **"Actualizează Credentiale"**
3. Testează toate funcțiile - ar trebui să meargă!

## 🔍 Ce Să Verifici

### ✅ Răspuns Proxy Succes:
```json
{"error":"dealer_no_activ"}
```
**Înseamnă:** Proxy funcționează, API necesită credentiale

### ✅ Răspuns cu Credentiale Corecte:
```json
{
  "points": [
    {
      "id": "6", 
      "name": "Кишинев",
      "country": "Молдова"
    }
  ]
}
```

### ❌ Dacă nu funcționează:
- Verifică dacă serverul rulează pe http://localhost:8080
- Restart server: `npm run dev`

## 📧 Următorii Pași

1. **Astăzi**: Testează cu URL-ul de test
2. **Când primești credentialele**: Testează cu autentificare
3. **După testare reușită**: Integrează în aplicația principală

## 🚨 Debugging

### Dacă nu funcționează:
1. Verifică conexiunea la internet
2. Verifică în Network tab din browser (F12)
3. Verifică erorile în Console (F12)
4. Încearcă cu credentiale diferite

### Comenzi útile:
```bash
# Test manual cu curl
curl -X POST https://test-api.bussystem.eu/server/curl/get_points.php \
  -H "Content-Type: application/json" \
  -d '{"autocomplete": "Кишинев", "lang": "ru"}'

# Cu credentiale
curl -X POST https://test-api.bussystem.eu/server/curl/get_points.php \
  -H "Content-Type: application/json" \
  -d '{"login": "YOUR_LOGIN", "password": "YOUR_PASSWORD", "autocomplete": "Кишинев", "lang": "ru"}'
```

---

**IMPORTANT:** API-ul de test pare să necesite totuși credentiale. Așteaptă email-ul cu credentialele de test!
