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
      '/api/bussystem': {
        target: 'https://test-api.bussystem.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bussystem/, '/server'),
        secure: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
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
