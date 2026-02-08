import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = process.env.SPOTIFY_PROXY_PORT || 6001;

app.get('/api/spotify-token', async (_req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: 'Missing SPOTIFY_CLIENT_ID/SECRET in .env.local' });
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(r.status)
        .json({ error: 'Token request failed', detail: text });
    }

    const data = await r.json();

    // short cache; token itself lasts ~1h but we can refresh as needed
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Spotify token error:', err);
    return res.status(500).json({ error: 'Token request error' });
  }
});

app.listen(PORT, () => {
  console.log(`Spotify proxy running on http://localhost:${PORT}`);
});
