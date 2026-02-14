import type { Artist } from './types';
import { getRelatedArtists } from './endpoints';
import { scoreCandidates, type ScoredArtist } from '../utils/discovery';

export async function buildDiscovery(
  seedArtists: Artist[],
  limit = 30,
): Promise<ScoredArtist[]> {
  const candidatesBySeed = new Map<string, Artist[]>();

  const lists = await Promise.all(
    seedArtists.map(async (seed) => {
      const { artists } = await getRelatedArtists(seed.id);
      return [seed.id, artists] as const;
    }),
  );

  for (const [seedId, artists] of lists) {
    candidatesBySeed.set(seedId, artists);
  }

  const scored = scoreCandidates(seedArtists, candidatesBySeed);
  return scored.slice(0, limit);
}
