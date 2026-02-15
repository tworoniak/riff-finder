import type { Artist } from './types';
import { scoreCandidates, type ScoredArtist } from '../utils/discovery';
import { buildSimilarArtistsByGenre } from './artistReplacements';

export async function buildDiscovery(
  seedArtists: Artist[],
  limit = 30,
): Promise<ScoredArtist[]> {
  const candidatesBySeed = new Map<string, Artist[]>();

  // For each seed artist, generate candidates using genre-based search
  const lists = await Promise.all(
    seedArtists.map(async (seed) => {
      const candidates = await buildSimilarArtistsByGenre(seed, 10); // search limit max is 10
      return [seed.id, candidates] as const;
    }),
  );

  for (const [seedId, artists] of lists) {
    candidatesBySeed.set(seedId, artists);
  }

  const scored = scoreCandidates(seedArtists, candidatesBySeed);
  return scored.slice(0, limit);
}
