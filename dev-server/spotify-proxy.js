import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(express.json());

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

  // ✅ Prefer user token if client provided one (PKCE)
  const authHeader = req.headers.authorization;
  const userToken =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null;

  console.log('[spotify-proxy] auth mode:', userToken ? 'user' : 'app');

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // Only fetch app token if we don't have a user token
    let appAccessToken = '';
    if (!userToken) {
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

      appAccessToken = tokenData.access_token;
    }

    const tokenToUse = userToken || appAccessToken;

    console.log('[spotify-proxy] fetching:', `https://api.spotify.com${path}`);

    console.log(
      '[spotify-proxy] spotify status:',
      spotifyRes.status,
      spotifyRes.statusText,
    );
    console.log('[spotify-proxy] body length:', bodyText.length);
    console.log('[spotify-proxy] body preview:', bodyText.slice(0, 200));

    const spotifyRes = await fetch(`https://api.spotify.com${path}`, {
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
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

app.post('/api/spotify-exchange', async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Spotify credentials' });
  }

  const { code, code_verifier, redirect_uri } = req.body ?? {};
  if (!code || !code_verifier || !redirect_uri) {
    return res
      .status(400)
      .json({ error: 'Missing code/code_verifier/redirect_uri' });
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
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      }).toString(),
    });

    const text = await tokenRes.text();
    if (!tokenRes.ok) return res.status(tokenRes.status).send(text);

    return res.status(200).send(text);
  } catch (err) {
    console.error('[spotify-proxy] exchange error:', err);
    return res.status(500).json({ error: 'Spotify exchange error' });
  }
});

app.post('/api/spotify-refresh', async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Spotify credentials' });
  }

  const { refresh_token } = req.body ?? {};
  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh_token' });
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
        grant_type: 'refresh_token',
        refresh_token,
      }).toString(),
    });

    const text = await tokenRes.text();
    if (!tokenRes.ok) return res.status(tokenRes.status).send(text);

    return res.status(200).send(text);
  } catch (err) {
    console.error('[spotify-proxy] refresh error:', err);
    return res.status(500).json({ error: 'Spotify refresh error' });
  }
});

app.listen(PORT, () => {
  console.log(`Spotify proxy running on http://localhost:${PORT}`);
});
