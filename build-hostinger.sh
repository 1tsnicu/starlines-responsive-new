#!/bin/bash

# Build script pentru deploy pe Hostinger
# Acest script creează build-ul frontend pentru upload pe Hostinger

echo "🚀 Starting build for Hostinger deployment..."

# 1. Set production API URL (optional - poate fi setat din .env)
export VITE_API_URL="https://your-backend.railway.app"

# 2. Build frontend
echo "📦 Building frontend..."
npm run build

# 3. Create deployment folder
echo "📁 Creating deployment folder..."
rm -rf deploy-hostinger
mkdir -p deploy-hostinger

# 4. Copy built files
echo "📋 Copying built files..."
cp -r dist/* deploy-hostinger/

# 5. Create .htaccess for React Router
echo "⚙️ Creating .htaccess for React Router..."
cat > deploy-hostinger/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF

echo "✅ Build complete! Upload contents of 'deploy-hostinger/' to your Hostinger public_html folder"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your backend to Railway/Render and get the URL"
echo "2. Update VITE_API_URL in this script with your backend URL"
echo "3. Run this script again to rebuild with correct API URL"
echo "4. Upload all files from deploy-hostinger/ to Hostinger public_html/"
echo ""
echo "📁 Files ready in: ./deploy-hostinger/"
ls -la deploy-hostinger/
