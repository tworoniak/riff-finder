import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { qk, qf } from '../api/queries';
import type { Artist } from '../api/types';
import { buildDiscovery } from '../api/discover';

type ScoredArtist = {
  artist: Artist;
  score: number;
  reasons: string[];
};

function stableSeedKey(ids: string[]) {
  return ids
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .sort()
    .join('|');
}

function parseSeedParam(seedParam: string | null) {
  if (!seedParam) return [];
  return seedParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function SeedChip({
  artist,
  onRemove,
}: {
  artist: Artist;
  onRemove: (id: string) => void;
}) {
  return (
    <div className='flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-sm'>
      <span className='max-w-45 truncate'>{artist.name}</span>
      <button
        onClick={() => onRemove(artist.id)}
        className='rounded-full px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-800'
        aria-label={`Remove ${artist.name}`}
      >
        ✕
      </button>
    </div>
  );
}

function ArtistPickCard({
  artist,
  onAdd,
  disabled,
}: {
  artist: Artist;
  onAdd: (id: string) => void;
  disabled: boolean;
}) {
  const image = artist.images?.[0]?.url;

  return (
    <button
      type='button'
      onClick={() => onAdd(artist.id)}
      disabled={disabled}
      className='w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-left hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50'
    >
      <div className='flex items-center gap-3'>
        <div className='h-12 w-12 overflow-hidden rounded-lg bg-zinc-800'>
          {image ? (
            <img
              src={image}
              alt={artist.name}
              className='h-full w-full object-cover'
              loading='lazy'
            />
          ) : null}
        </div>
        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold'>{artist.name}</div>
          <div className='mt-1 truncate text-xs text-zinc-400'>
            {artist.genres?.slice(0, 2).join(' • ') || '—'}
          </div>
        </div>
      </div>
    </button>
  );
}

function ResultCard({ scored }: { scored: ScoredArtist }) {
  const a = scored.artist;
  const image = a.images?.[0]?.url;

  return (
    <Link
      to={`/artist/${a.id}`}
      className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900'
    >
      <div className='flex items-center gap-3'>
        <div className='h-14 w-14 overflow-hidden rounded-lg bg-zinc-800'>
          {image ? (
            <img
              src={image}
              alt={a.name}
              className='h-full w-full object-cover'
              loading='lazy'
            />
          ) : null}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='truncate text-sm font-semibold'>{a.name}</div>
          <div className='mt-1 truncate text-xs text-zinc-400'>
            {a.genres?.slice(0, 3).join(' • ') || '—'}
          </div>

          <div className='mt-2 flex flex-wrap gap-2'>
            {scored.reasons.slice(0, 3).map((r) => (
              <span
                key={r}
                className='rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-200'
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className='shrink-0 text-xs text-zinc-500'>
          score {Math.round(scored.score)}
        </div>
      </div>
    </Link>
  );
}

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search UI state for adding seeds
  const [query, setQuery] = useState('');
  const enabledSearch = query.trim().length >= 2;

  // "Run id" increments when user clicks Generate
  // Seeds changing resets runId to 0 (no effect needed)
  const [runId, setRunId] = useState(0);

  // Seeds come from URL: ?seed=rwake,neurosis
  const seedIdsFromUrl = useMemo(
    () => parseSeedParam(searchParams.get('seed')),
    [searchParams],
  );

  // Fetch seed artist objects
  const seedArtistQueries = useQueries({
    queries: seedIdsFromUrl.map((id) => ({
      queryKey: qk.artist(id),
      queryFn: qf.artist(id),
      staleTime: 10 * 60_000,
      enabled: !!id,
    })),
  });

  const seedArtists = useMemo(() => {
    return seedArtistQueries.map((q) => q.data).filter(Boolean) as Artist[];
  }, [seedArtistQueries]);

  const seedKey = useMemo(
    () => stableSeedKey(seedIdsFromUrl),
    [seedIdsFromUrl],
  );

  // Search artists to add as seeds
  const searchQuery = useQuery({
    queryKey: qk.searchArtists(query),
    queryFn: qf.searchArtists(query),
    enabled: enabledSearch,
    staleTime: 30_000,
  });

  const searchResults = useMemo(
    () => searchQuery.data?.artists.items ?? [],
    [searchQuery.data],
  );

  const canGenerate = seedArtists.length >= 1 && seedArtists.length <= 3;

  const discoveryQuery = useQuery({
    queryKey: ['spotify', 'discoverCandidates', seedKey, runId] as const,
    queryFn: async () => buildDiscovery(seedArtists, 30),
    enabled:
      runId > 0 && canGenerate && seedArtists.length === seedIdsFromUrl.length,
    staleTime: 5 * 60_000,
  });

  const scoredResults: ScoredArtist[] = useMemo(
    () => (discoveryQuery.data ?? []) as ScoredArtist[],
    [discoveryQuery.data],
  );

  function updateSeedParam(nextIds: string[]) {
    // Any seed change cancels previous run
    setRunId(0);

    const ids = nextIds.slice(0, 3);
    if (ids.length === 0) {
      searchParams.delete('seed');
      setSearchParams(searchParams, { replace: true });
      return;
    }
    setSearchParams({ seed: ids.join(',') }, { replace: true });
  }

  function addSeed(id: string) {
    const curr = seedIdsFromUrl;
    if (curr.includes(id)) return;
    if (curr.length >= 3) return;
    updateSeedParam([...curr, id]);
  }

  function removeSeed(id: string) {
    const next = seedIdsFromUrl.filter((x) => x !== id);
    updateSeedParam(next);
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-semibold'>Discover</h1>
        <p className='mt-1 text-zinc-300'>
          Add up to 3 seed artists and generate recommendations.
        </p>
      </div>

      {/* Seed section */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold'>Seeds</h2>
          <div className='text-xs text-zinc-500'>
            {seedIdsFromUrl.length}/3 selected
          </div>
        </div>

        {seedArtists.length > 0 ? (
          <div className='flex flex-wrap gap-2'>
            {seedArtists.map((a) => (
              <SeedChip key={a.id} artist={a} onRemove={removeSeed} />
            ))}
          </div>
        ) : (
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
            No seeds yet. Search below and click an artist to add.
          </div>
        )}

        <div className='flex items-center gap-3'>
          <button
            type='button'
            disabled={!canGenerate}
            onClick={() => setRunId((n) => n + 1)}
            className='rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40'
          >
            Generate recommendations
          </button>

          <button
            type='button'
            disabled={seedIdsFromUrl.length === 0}
            onClick={() => updateSeedParam([])}
            className='rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40'
          >
            Clear
          </button>
        </div>
      </section>

      {/* Search to add seeds */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Add seeds</h2>

        <div className='space-y-2'>
          <label className='text-sm text-zinc-300' htmlFor='seed-search'>
            Search artists
          </label>
          <input
            id='seed-search'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "sludge", "post-metal", "RWAKE"'
            className='w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-700'
          />
          <div className='text-xs text-zinc-500'>
            {enabledSearch
              ? searchQuery.isFetching
                ? 'Searching…'
                : `${searchResults.length} result(s)`
              : 'Type at least 2 characters'}
          </div>
        </div>

        {enabledSearch && searchResults.length > 0 ? (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {searchResults.map((a) => (
              <ArtistPickCard
                key={a.id}
                artist={a}
                onAdd={addSeed}
                disabled={
                  seedIdsFromUrl.includes(a.id) || seedIdsFromUrl.length >= 3
                }
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* Results */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Results</h2>

        {runId === 0 ? (
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
            Click{' '}
            <span className='font-semibold'>Generate recommendations</span> to
            see results.
          </div>
        ) : discoveryQuery.isLoading ? (
          <div className='space-y-3'>
            <div className='h-20 animate-pulse rounded-xl bg-zinc-900/40' />
            <div className='h-20 animate-pulse rounded-xl bg-zinc-900/40' />
            <div className='h-20 animate-pulse rounded-xl bg-zinc-900/40' />
          </div>
        ) : discoveryQuery.isError ? (
          <div className='rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200'>
            {(discoveryQuery.error as Error).message}
          </div>
        ) : scoredResults.length === 0 ? (
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
            No recommendations found. Try different seeds.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3'>
            {scoredResults.map((s) => (
              <ResultCard key={s.artist.id} scored={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
