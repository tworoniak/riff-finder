import type { VercelRequest, VercelResponse } from '@vercel/node';

type TokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Spotify env vars' });
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

    const data = (await r.json()) as TokenResponse;

    // Cache token response at the edge briefly (Spotify tokens typically last 3600s)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (e) {
    console.error('Spotify token error:', e);
    return res.status(500).json({ error: 'Token request error' });
  }
}
