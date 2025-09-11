# Deploy pe Hostinger - Ghid Complet

## 🎯 Strategia Recomandată: Frontend Static + Backend Extern

### Pas 1: Deploy Backend pe Railway (GRATUIT)

#### 1.1 Creează cont pe Railway
- Mergi pe [railway.app](https://railway.app)
- Conectează cu GitHub
- Creează new project → "Deploy from GitHub repo"
- Selectează repo-ul `starlight-routes`

#### 1.2 Configurează Environment Variables pe Railway
```bash
BUSS_LOGIN=starok_md_test
BUSS_PASSWORD=bHAZpUN02RQlYG1H
BUSS_BASE_URL=https://test-api.bussystem.eu/server
NODE_ENV=production
PORT=3001
```

#### 1.3 Configurează Startup Command
- În Railway settings: `node server/index.js`
- Railway îți va da un URL gen: `https://your-app.railway.app`

### Pas 2: Build Frontend pentru Hostinger

#### 2.1 Actualizează API URL în build script
```bash
# Editează build-hostinger.sh și înlocuiește:
export VITE_API_URL="https://your-app.railway.app"
```

#### 2.2 Rulează build script
```bash
./build-hostinger.sh
```

#### 2.3 Rezultat
- Folder `deploy-hostinger/` cu toate fișierele
- Conține `.htaccess` pentru React Router
- Optimizat pentru performance

### Pas 3: Upload pe Hostinger

#### 3.1 Conectează la File Manager Hostinger
- Login în Hostinger panel
- Găsește "File Manager"
- Navighează la `public_html/`

#### 3.2 Upload fișierele
- Șterge conținutul din `public_html/`
- Upload toate fișierele din `deploy-hostinger/`
- Sau folosește FTP/SFTP

#### 3.3 Verifică permisiunile
- `.htaccess` trebuie să fie 644
- Folder permissions: 755
- File permissions: 644

### Pas 4: Testare

#### 4.1 Verifică site-ul
- Accesează domeniul tău
- Testează navigarea (React Router)
- Testează căutarea de rute

#### 4.2 Debug common issues
```bash
# Dacă API nu funcționează:
# 1. Verifică Railway backend logs
# 2. Verifică CORS settings
# 3. Verifică API URL în browser dev tools
```

## 🔧 Alternative

### Opțiunea B: Totul în PHP (Dacă nu vrei servicii externe)

#### Structure pentru Hostinger:
```
public_html/
├── index.html              # Frontend build
├── assets/                # CSS, JS files
├── api/                   # PHP files
│   ├── config.php         # Credentials
│   ├── points.php         # Get points endpoint
│   ├── routes.php         # Search routes
│   └── orders.php         # Order management
└── .htaccess             # Routing rules
```

#### Exemplu api/points.php:
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

$data = array(
    'login' => BUSS_LOGIN,
    'password' => BUSS_PASSWORD,
    'query' => $input['query'] ?? ''
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, BUSS_BASE_URL . '/get_points.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json'
));

$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>
```

## 🎯 Recomandarea mea: Opțiunea A

### Avantaje:
- ✅ **Performanță**: CDN Hostinger pentru frontend
- ✅ **Securitate**: Credentials pe backend Railway
- ✅ **Scalabilitate**: Backend se poate scala independent
- ✅ **Mentenanță**: Deployment separat, easier updates
- ✅ **Cost**: Railway free tier + Hostinger existing plan

### Dezavantaje Opțiunea B (PHP):
- ❌ **Securitate**: Credentials în fișiere PHP pe shared hosting
- ❌ **Performance**: Procesare server-side pe shared hosting
- ❌ **Debugging**: Mai greu de debugat PHP vs JavaScript

## 🚀 Să începem?

1. **Creezi cont Railway** și deploy backend?
2. **Sau preferi** să convertim la PHP totul?

Care opțiune preferi?
