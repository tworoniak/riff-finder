import type { Artist } from '../api/types';

export type ScoredArtist = {
  artist: Artist;
  score: number;
  reasons: string[];
};

function overlapCount(a: string[], b: Set<string>) {
  let n = 0;
  for (const g of a) if (b.has(g)) n++;
  return n;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function scoreCandidates(
  seeds: Artist[],
  candidatesBySeed: Map<string, Artist[]>,
): ScoredArtist[] {
  const seedGenreSet = new Set(seeds.flatMap((s) => s.genres));
  const avgPopularity =
    seeds.reduce((sum, s) => sum + (s.popularity ?? 0), 0) /
    Math.max(1, seeds.length);

  const appearanceCount = new Map<string, number>();
  const candidateMap = new Map<string, Artist>();

  for (const list of candidatesBySeed.values()) {
    for (const a of list) {
      candidateMap.set(a.id, a);
      appearanceCount.set(a.id, (appearanceCount.get(a.id) ?? 0) + 1);
    }
  }

  for (const s of seeds) {
    candidateMap.delete(s.id);
    appearanceCount.delete(s.id);
  }

  const results: ScoredArtist[] = [];

  for (const [id, artist] of candidateMap.entries()) {
    const reasons: string[] = [];

    const genreOverlap = overlapCount(artist.genres ?? [], seedGenreSet);
    const multiSeedBoost = (appearanceCount.get(id) ?? 1) - 1;
    const popDistance = Math.abs((artist.popularity ?? 0) - avgPopularity);

    const genreScore = genreOverlap * 12;
    const multiSeedScore = multiSeedBoost * 20;
    const popPenalty = clamp(popDistance, 0, 60) * 0.6;

    const score = genreScore + multiSeedScore - popPenalty;

    if (genreOverlap > 0)
      reasons.push(
        `${genreOverlap} shared genre${genreOverlap === 1 ? '' : 's'}`,
      );
    if (multiSeedBoost > 0)
      reasons.push(`related to ${multiSeedBoost + 1} seeds`);
    if (popDistance < 12) reasons.push('similar popularity');

    results.push({ artist, score, reasons });
  }

  return results.sort((a, b) => b.score - a.score);
}
