import type { Album, AlbumTrack, Artist, Track } from './types';
import { getAlbumTracks, searchArtists } from './endpoints';

function toTrackish(t: AlbumTrack): Track {
  // AlbumTrack may not include external_urls; provide a safe fallback link.
  const spotifyUrl =
    t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`;
  return {
    id: t.id,
    name: t.name,
    preview_url: t.preview_url ?? null,
    duration_ms: t.duration_ms ?? 0,
    external_urls: { spotify: spotifyUrl },
  };
}

export async function buildNotableTracksFromAlbums(
  albums: Album[],
  maxAlbums = 6,
  maxTracks = 10,
): Promise<Track[]> {
  const picked = albums.slice(0, maxAlbums);

  const lists = await Promise.all(
    picked.map(async (a) => {
      const res = await getAlbumTracks(a.id);
      return res.items ?? [];
    }),
  );

  const seen = new Set<string>();
  const out: Track[] = [];

  for (const list of lists) {
    for (const t of list) {
      if (!t?.id) continue;
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(toTrackish(t));
      if (out.length >= maxTracks) return out;
    }
  }

  return out;
}

function overlapScore(seedGenres: string[], candidateGenres: string[]) {
  const a = new Set(seedGenres.map((g) => g.toLowerCase()));
  const b = new Set(candidateGenres.map((g) => g.toLowerCase()));
  let hits = 0;
  for (const g of b) if (a.has(g)) hits++;
  return hits;
}

export async function buildSimilarArtistsByGenre(
  seed: Artist,
  limit = 10,
): Promise<Artist[]> {
  const seedGenres = seed.genres ?? [];
  const q = seedGenres[0] ? seedGenres[0] : seed.name;

  // Search limit max is 10 now
  const res = await searchArtists(q, 10);
  const candidates = res.artists.items ?? [];

  const filtered = candidates.filter((a) => a.id !== seed.id);

  filtered.sort((a, b) => {
    const as = overlapScore(seedGenres, a.genres ?? []);
    const bs = overlapScore(seedGenres, b.genres ?? []);
    return bs - as;
  });

  return filtered.slice(0, limit);
}
