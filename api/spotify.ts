import type { VercelRequest, VercelResponse } from '@vercel/node';

let appTokenCache: { token: string; expiresAt: number } | null = null;

async function getAppAccessToken(): Promise<string> {
  const now = Date.now();
  if (appTokenCache && now < appTokenCache.expiresAt)
    return appTokenCache.token;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
  });

  const text = await tokenRes.text();
  if (!tokenRes.ok) {
    throw new Error(`Token request failed: ${tokenRes.status} ${text}`);
  }

  const data = JSON.parse(text) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  // refresh 60s early
  appTokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

function getUserTokenFromAuthHeader(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth || typeof auth !== 'string') return null;
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawPath = req.query.path;
  const path = typeof rawPath === 'string' ? rawPath.trim() : '';

  if (!path) return res.status(400).json({ error: 'Missing ?path=/v1/...' });
  if (!path.startsWith('/v1/')) {
    return res.status(400).json({ error: 'path must start with /v1/' });
  }

  try {
    const userToken = getUserTokenFromAuthHeader(req);
    const tokenToUse = userToken ?? (await getAppAccessToken());

    const spotifyRes = await fetch(`https://api.spotify.com${path}`, {
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        Accept: 'application/json',
        'User-Agent': 'RiffFinder/1.0 (+vercel)',
      },
    });

    const bodyText = await spotifyRes.text();

    // Don’t cache user-specific responses; modest caching for app-token requests is OK.
    if (userToken) {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      // short edge cache for public/app-token requests
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    }

    res.status(spotifyRes.status);

    try {
      return res.json(JSON.parse(bodyText));
    } catch {
      return res.send(bodyText);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: 'Spotify proxy error', detail: msg });
  }
}
