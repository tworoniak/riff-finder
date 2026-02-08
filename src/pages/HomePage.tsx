import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { qk, qf } from '../api/queries';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Artist } from '../api/types';

function ArtistCard({ a }: { a: Artist }) {
  const image = a.images?.[0]?.url;

  return (
    <Link
      to={`/artist/${a.id}`}
      className='group rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:bg-zinc-900'
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

        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold'>{a.name}</div>
          <div className='mt-1 truncate text-xs text-zinc-400'>
            {a.genres?.slice(0, 3).join(' • ') || '—'}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 300);

  const enabled = debounced.trim().length >= 2;

  const { data, isFetching, isError, error } = useQuery({
    queryKey: qk.searchArtists(debounced),
    queryFn: qf.searchArtists(debounced),
    enabled,
    staleTime: 30_000,
  });

  const artists = useMemo(() => data?.artists.items ?? [], [data]);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Riff Finder</h1>
        <p className='mt-1 text-zinc-300'>
          Search artists and jump into discovery.
        </p>
      </div>

      <div className='space-y-2'>
        <label className='text-sm text-zinc-300' htmlFor='search'>
          Search (try: “sludge”, “post-metal”, “RWAKE”)
        </label>
        <input
          id='search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search artists…'
          className='w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-700'
        />
        <div className='text-xs text-zinc-500'>
          {enabled
            ? isFetching
              ? 'Searching…'
              : `${artists.length} result(s)`
            : 'Type at least 2 characters'}
        </div>
      </div>

      {isError ? (
        <div className='rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200'>
          {(error as Error).message}
        </div>
      ) : null}

      {enabled && !isFetching && artists.length === 0 ? (
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
          No results. Try a different artist name or genre.
        </div>
      ) : null}

      {artists.length > 0 ? (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {artists.map((a) => (
            <ArtistCard key={a.id} a={a} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
