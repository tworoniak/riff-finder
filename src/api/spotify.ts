// export async function spotifyFetch<T>(path: string): Promise<T> {
//   // path should start with /v1/...
//   const r = await fetch(`/api/spotify?path=${encodeURIComponent(path)}`);

//   if (!r.ok) {
//     const text = await r.text().catch(() => '');
//     throw new Error(`Spotify error ${r.status}: ${text}`);
//   }

//   return (await r.json()) as T;
// }

import { getValidAccessToken } from '../auth/spotifyAuth';

export async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getValidAccessToken();

  const r = await fetch(`/api/spotify?path=${encodeURIComponent(path)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`Spotify error ${r.status}: ${text}`);
  }

  return (await r.json()) as T;
}
