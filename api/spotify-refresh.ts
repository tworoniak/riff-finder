import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return res.status(500).json({ error: 'Missing Spotify credentials' });

  const { refresh_token } = req.body ?? {};
  if (!refresh_token)
    return res.status(400).json({ error: 'Missing refresh_token' });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

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
}
