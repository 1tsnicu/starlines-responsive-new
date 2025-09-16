import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/bussystem-test': {
        target: 'https://test-api.bussystem.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bussystem-test/, '/server'),
        secure: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to:', proxyReq.path);
          });
        }
      },
      // Backward-compatible alias (legacy code expects /api/bussystem)
      // Now routes to our secure backend instead of direct API calls
      '/api/bussystem': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bussystem/, '/api/backend'),
        secure: false,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      },
      '/api/bussystem-real': {
        target: 'https://bussystem.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bussystem-real/, '/api'),
        secure: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
      // Local backend (Node) for secure server-side Bussystem calls
      '/api/backend': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    // Configurare API URL pentru producție
    __API_BASE_URL__: JSON.stringify(
      mode === 'production' 
        ? (process.env.VITE_API_URL || 'https://your-backend.railway.app') 
        : '/api/backend'
    )
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
