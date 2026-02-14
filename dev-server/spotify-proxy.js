import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Spotify token error:', err);
    return res.status(500).json({ error: 'Token request error' });
  }
});

// Proxy ALL Spotify Web API calls through this endpoint (avoids CORS/403 weirdness)
app.get('/api/spotify', async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const rawPath = req.query.path;
  console.log('[spotify-proxy] requested path:', rawPath);

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Spotify credentials' });
  }

  const path = typeof rawPath === 'string' ? rawPath.trim() : '';
  if (!path) return res.status(400).json({ error: 'Missing ?path=/v1/...' });
  if (!path.startsWith('/v1/')) {
    return res.status(400).json({ error: 'path must start with /v1/' });
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    });

    const tokenText = await tokenRes.text();

    if (!tokenRes.ok) {
      console.log('[spotify-proxy] token status:', tokenRes.status);
      console.log('[spotify-proxy] token body:', tokenText);
      return res
        .status(tokenRes.status)
        .json({ error: 'Token request failed', detail: tokenText });
    }

    const tokenData = JSON.parse(tokenText);
    console.log(
      '[spotify-proxy] token_type:',
      tokenData.token_type,
      'expires_in:',
      tokenData.expires_in,
    );

    console.log('[spotify-proxy] fetching:', `https://api.spotify.com${path}`);

    const spotifyRes = await fetch(`https://api.spotify.com${path}`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
        'User-Agent': 'RiffFinder/1.0 (+local-dev)',
      },
    });

    const bodyText = await spotifyRes.text();

    console.log('[spotify-proxy] spotify status:', spotifyRes.status);
    if (!spotifyRes.ok) {
      console.log('[spotify-proxy] error body:', bodyText);
    }

    res.status(spotifyRes.status);

    try {
      return res.json(JSON.parse(bodyText));
    } catch {
      return res.send(bodyText);
    }
  } catch (err) {
    console.error('[spotify-proxy] proxy error:', err);
    return res.status(500).json({ error: 'Spotify proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`Spotify proxy running on http://localhost:${PORT}`);
});
