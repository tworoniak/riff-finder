import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { qk, qf } from '../api/queries';
import type { Album, Artist, Track } from '../api/types';

const MARKET = import.meta.env.VITE_SPOTIFY_MARKET || 'US';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='space-y-3'>
      <h2 className='text-lg font-semibold'>{title}</h2>
      {children}
    </section>
  );
}

function InlineError({
  error,
  friendly403,
}: {
  error: unknown;
  friendly403: string;
}) {
  const msg = error instanceof Error ? error.message : String(error);

  const is403 = msg.includes('Spotify error 403');
  const isInvalidLimit = msg.includes('Invalid limit');

  if (is403) {
    return (
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
        {friendly403}
      </div>
    );
  }

  if (isInvalidLimit) {
    return (
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
        Albums unavailable due to a Spotify API parameter issue (fixing now).
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
      Unavailable ({msg})
    </div>
  );
}

function ArtistHeader({ artist }: { artist: Artist }) {
  const image = artist.images?.[0]?.url;

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <div className='h-28 w-28 overflow-hidden rounded-2xl bg-zinc-800'>
        {image ? (
          <img
            src={image}
            alt={artist.name}
            className='h-full w-full object-cover'
          />
        ) : null}
      </div>

      <div className='min-w-0'>
        <h1 className='truncate text-2xl font-semibold'>{artist.name}</h1>

        <div className='mt-2 flex flex-wrap gap-2'>
          {(artist.genres ?? []).slice(0, 6).map((g) => (
            <span
              key={g}
              className='rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-200'
            >
              {g}
            </span>
          ))}
          {(!artist.genres || artist.genres.length === 0) && (
            <span className='text-sm text-zinc-400'>No genres listed</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function TrackList({ tracks }: { tracks: Track[] }) {
  if (!tracks.length) {
    return (
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
        No notable tracks available.
      </div>
    );
  }

  return (
    <ol className='divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/30'>
      {tracks.map((t, idx) => (
        <li
          key={t.id}
          className='flex items-center justify-between gap-3 px-4 py-3'
        >
          <div className='min-w-0'>
            <div className='text-sm'>
              <span className='mr-2 text-zinc-500'>{idx + 1}.</span>
              <span className='font-medium'>{t.name}</span>
            </div>
            <div className='mt-1 text-xs text-zinc-500'>
              {formatMs(t.duration_ms)}{' '}
              {t.preview_url ? '• preview available' : ''}
            </div>
          </div>

          <a
            href={t.external_urls.spotify}
            target='_blank'
            rel='noreferrer'
            className='shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs hover:bg-zinc-900'
          >
            Open
          </a>
        </li>
      ))}
    </ol>
  );
}

function AlbumGrid({ albums }: { albums: Album[] }) {
  if (!albums.length) {
    return (
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
        No albums available.
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
      {albums.map((a) => {
        const cover = a.images?.[0]?.url;
        const year = a.release_date?.slice(0, 4);

        return (
          <a
            key={a.id}
            href={a.external_urls.spotify}
            target='_blank'
            rel='noreferrer'
            className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900'
          >
            <div className='aspect-square overflow-hidden rounded-lg bg-zinc-800'>
              {cover ? (
                <img
                  src={cover}
                  alt={a.name}
                  className='h-full w-full object-cover'
                />
              ) : null}
            </div>
            <div className='mt-2 min-w-0'>
              <div className='truncate text-sm font-medium'>{a.name}</div>
              <div className='mt-1 text-xs text-zinc-500'>
                {year ? year : '—'} • {a.album_type}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

function RelatedArtists({ artists }: { artists: Artist[] }) {
  if (!artists.length) {
    return (
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
        No similar artists available.
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {artists.map((a) => {
        const image = a.images?.[0]?.url;
        return (
          <Link
            key={a.id}
            to={`/artist/${a.id}`}
            className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 hover:bg-zinc-900'
          >
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 overflow-hidden rounded-lg bg-zinc-800'>
                {image ? (
                  <img
                    src={image}
                    alt={a.name}
                    className='h-full w-full object-cover'
                  />
                ) : null}
              </div>
              <div className='min-w-0'>
                <div className='truncate text-sm font-semibold'>{a.name}</div>
                <div className='mt-1 truncate text-xs text-zinc-400'>
                  {a.genres?.slice(0, 2).join(' • ') || '—'}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ArtistPage() {
  const { id } = useParams();
  const artistId = id ?? '';

  const artistQuery = useQuery({
    queryKey: qk.artist(artistId),
    queryFn: qf.artist(artistId),
    enabled: !!artistId,
    staleTime: 10 * 60_000,
  });

  const albumsQuery = useQuery({
    queryKey: qk.albums(artistId, MARKET, 'album,single'),
    queryFn: qf.albums(artistId, MARKET, 'album,single'),
    enabled: !!artistId,
    staleTime: 10 * 60_000,
  });

  const notableTracksQuery = useQuery({
    queryKey: qk.notableTracks(artistId),
    queryFn: qf.notableTracks(albumsQuery.data?.items ?? []),
    enabled: !!artistId && (albumsQuery.data?.items?.length ?? 0) > 0,
    staleTime: 10 * 60_000,
  });

  const similarArtistsQuery = useQuery({
    queryKey: qk.similarArtists(artistId),
    queryFn: artistQuery.data
      ? qf.similarArtists(artistQuery.data)
      : async () => [],
    enabled: !!artistId && !!artistQuery.data,
    staleTime: 10 * 60_000,
  });

  const tracks = useMemo(
    () => notableTracksQuery.data ?? [],
    [notableTracksQuery.data],
  );
  const related = useMemo(
    () => similarArtistsQuery.data ?? [],
    [similarArtistsQuery.data],
  );

  const albums = useMemo(
    () => albumsQuery.data?.items ?? [],
    [albumsQuery.data],
  );

  if (!artistId) {
    return (
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
        Missing artist ID.
      </div>
    );
  }

  // Only fail the page if the core artist query fails
  if (artistQuery.isError) {
    return (
      <div className='rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200'>
        {(artistQuery.error as Error).message}
      </div>
    );
  }

  if (artistQuery.isLoading || !artistQuery.data) {
    return (
      <div className='space-y-4'>
        <div className='h-28 w-full animate-pulse rounded-2xl bg-zinc-900/50' />
        <div className='h-40 w-full animate-pulse rounded-2xl bg-zinc-900/50' />
        <div className='h-48 w-full animate-pulse rounded-2xl bg-zinc-900/50' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <ArtistHeader artist={artistQuery.data} />

      <Section title='Notable tracks'>
        {notableTracksQuery.isLoading ? (
          <div className='h-32 w-full animate-pulse rounded-2xl bg-zinc-900/50' />
        ) : notableTracksQuery.isError ? (
          <InlineError
            error={notableTracksQuery.error}
            friendly403='Notable tracks are currently unavailable.'
          />
        ) : (
          <TrackList tracks={tracks} />
        )}
      </Section>

      <Section title='Albums'>
        {albumsQuery.isLoading ? (
          <div className='h-48 w-full animate-pulse rounded-2xl bg-zinc-900/50' />
        ) : albumsQuery.isError ? (
          <InlineError
            error={albumsQuery.error}
            friendly403='Albums are currently unavailable.'
          />
        ) : (
          <AlbumGrid albums={albums} />
        )}
      </Section>

      <Section title='Similar artists'>
        {similarArtistsQuery.isLoading ? (
          <div className='h-40 w-full animate-pulse rounded-2xl bg-zinc-900/50' />
        ) : similarArtistsQuery.isError ? (
          <InlineError
            error={similarArtistsQuery.error}
            friendly403='Similar artists are currently unavailable.'
          />
        ) : (
          <RelatedArtists artists={related} />
        )}
      </Section>
    </div>
  );
}
