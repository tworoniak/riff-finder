export async function spotifyFetch<T>(path: string): Promise<T> {
  // path should start with /v1/...
  const r = await fetch(`/api/spotify?path=${encodeURIComponent(path)}`);

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`Spotify error ${r.status}: ${text}`);
  }

  return (await r.json()) as T;
}
