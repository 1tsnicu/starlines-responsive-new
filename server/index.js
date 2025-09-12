import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment credentials (never expose to client directly)
const BUSS_LOGIN = process.env.BUSS_LOGIN || process.env.VITE_BUSS_LOGIN || process.env.VITE_BUSSYSTEM_LOGIN;
const BUSS_PASSWORD = process.env.BUSS_PASSWORD || process.env.VITE_BUSS_PASSWORD || process.env.VITE_BUSSYSTEM_PASSWORD;
const BUSS_BASE_URL = process.env.BUSS_BASE_URL || process.env.VITE_BUSS_BASE_URL || 'https://test-api.bussystem.eu/server';

if (!BUSS_LOGIN || !BUSS_PASSWORD) {
  console.warn('⚠️  Missing Bussystem credentials (BUSS_LOGIN / BUSS_PASSWORD). Set them in .env');
}

function buildPayload(body) {
  return {
    login: BUSS_LOGIN,
    password: BUSS_PASSWORD,
    json: 1,
    ...body
  };
}

async function bussystemPost(path, body) {
  const url = `${BUSS_BASE_URL}${path}`;
  const payload = buildPayload(body);
  
  if (path === '/curl/new_order.php') {
    console.log('Sending to Bussystem API:', {
      url,
      payload: JSON.stringify(payload, null, 2)
    });
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Starlight-Backend/1.0'
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  
  if (path === '/curl/new_order.php') {
    console.log('Bussystem API response:', {
      status: res.status,
      statusText: res.statusText,
      body: text.slice(0, 500) // First 500 chars
    });
  }
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0,200)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    // Basic XML fallback: detect <error>
    if (text.trim().startsWith('<')) {
      if (text.includes('<error>')) {
        const m = text.match(/<error>(.*?)<\/error>/);
        throw new Error(m ? m[1] : 'API XML error');
      }
    }
    throw new Error('Invalid response format');
  }
}

// Health check
app.get('/api/backend/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Points autocomplete
app.post('/api/backend/points/autocomplete', async (req, res) => {
  try {
    const { query, lang = 'en', transport = 'all', includeAll = true } = req.body;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }
    const data = await bussystemPost('/curl/get_points.php', {
      autocomplete: query,
      trans: transport,
      all: includeAll ? 1 : 0,
      lang
    });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get routes (simplified wrapper)
app.post('/api/backend/routes/search', async (req, res) => {
  try {
    const { id_from, id_to, date, lang = 'en' } = req.body;
    if (!id_from || !id_to || !date) {
      return res.status(400).json({ error: 'id_from, id_to, date required' });
    }
    const data = await bussystemPost('/curl/get_routes.php', {
      id_from, id_to, date, lang
    });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generic proxy (last resort) - restrict allowed paths
const ALLOWED = new Set(['/curl/get_points.php','/curl/get_routes.php']);
app.post('/api/backend/raw', async (req, res) => {
  try {
    const { path, params = {} } = req.body;
    if (!ALLOWED.has(path)) return res.status(403).json({ error: 'Path not allowed' });
    const data = await bussystemPost(path, params);
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generic curl passthrough with allowlist of filename
const FILE_ALLOWED = new Set([
  'get_points.php',
  'get_routes.php',
  'get_free_seats.php',
  'get_plan.php',
  'get_all_routes.php',
  'get_discount.php',
  'get_baggage.php',
  'new_order.php',
  'buy_ticket.php',
  'get_order.php'
]);

app.post('/api/backend/curl/:file', async (req, res) => {
  try {
    const file = req.params.file;
    if (!FILE_ALLOWED.has(file)) {
      return res.status(403).json({ error: 'File not allowed' });
    }
    
    if (file === 'new_order.php') {
      console.log('New order request received:', JSON.stringify(req.body, null, 2));
    }
    
    const data = await bussystemPost(`/curl/${file}`, req.body || {});
    
    if (file === 'new_order.php') {
      console.log('New order response:', JSON.stringify(data, null, 2));
    }
    
    res.json(data);
  } catch (e) {
    console.error(`Error in ${req.params.file}:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// Serve static files from dist folder (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React Router (catch all handler)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📱 Frontend served from http://localhost:${PORT}`);
  }
});

// ================= Additional structured endpoints =================

// Create new order (wrapper around new_order.php)
app.post('/api/backend/orders/new', async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await bussystemPost('/curl/new_order.php', payload);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Buy ticket (finalize reservation) wrapper
app.post('/api/backend/orders/buy', async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await bussystemPost('/curl/buy_ticket.php', payload);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get order info
app.post('/api/backend/orders/get', async (req, res) => {
  try {
    const { order_id, security, lang = 'en' } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id required' });
    const data = await bussystemPost('/curl/get_order.php', { order_id, security, lang });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get free seats
app.post('/api/backend/seats/free', async (req, res) => {
  try {
    const { interval_id, currency = 'EUR', lang = 'en', train_id, vagon_id, session } = req.body || {};
    if (!interval_id) return res.status(400).json({ error: 'interval_id required' });
    const data = await bussystemPost('/curl/get_free_seats.php', { interval_id, currency, lang, train_id, vagon_id, session });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simple reservation validation stub (placeholder for future business logic)
app.post('/api/backend/reservations/validate', async (req, res) => {
  try {
    // For now just echo and mark as valid; real implementation could call dedicated endpoint if exists
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });
    res.json({ success: true, phone, sms_required: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
