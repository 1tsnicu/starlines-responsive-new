// Vercel Serverless Function for get_routes.php
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { body } = req;
    
    // Inject credentials
    const payload = {
      login: process.env.BUSS_LOGIN,
      password: process.env.BUSS_PASSWORD,
      json: 1,
      ...body
    };

    const response = await fetch('https://test-api.bussystem.eu/server/curl/get_routes.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Starlight-Backend/1.0'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch (e) {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ error: error.message });
  }
}
