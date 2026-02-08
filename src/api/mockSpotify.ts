import type {
  Album,
  AlbumsResponse,
  Artist,
  RelatedArtistsResponse,
  SearchArtistsResponse,
  TopTracksResponse,
  Track,
} from './types';

const img = (seed: string): { url: string; width: number; height: number } => ({
  url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`,
  width: 600,
  height: 600,
});

const ARTISTS: Artist[] = [
  {
    id: 'rwake',
    name: 'RWAKE',
    genres: ['sludge metal', 'post-metal', 'psychedelic metal'],
    popularity: 42,
    images: [img('rwake')],
  },
  {
    id: 'neurosis',
    name: 'Neurosis',
    genres: ['post-metal', 'sludge metal'],
    popularity: 61,
    images: [img('neurosis')],
  },
  {
    id: 'highonfire',
    name: 'High on Fire',
    genres: ['stoner metal', 'sludge metal'],
    popularity: 66,
    images: [img('highonfire')],
  },
  {
    id: 'amenra',
    name: 'Amenra',
    genres: ['post-metal', 'atmospheric sludge'],
    popularity: 58,
    images: [img('amenra')],
  },
  {
    id: 'sumac',
    name: 'SUMAC',
    genres: ['post-metal', 'experimental metal', 'sludge metal'],
    popularity: 47,
    images: [img('sumac')],
  },
  {
    id: 'yob',
    name: 'YOB',
    genres: ['doom metal', 'stoner metal'],
    popularity: 55,
    images: [img('yob')],
  },
  {
    id: 'thisgiftisacurse',
    name: 'This Gift Is A Curse',
    genres: ['black metal', 'sludge metal', 'hardcore'],
    popularity: 33,
    images: [img('thisgiftisacurse')],
  },
  {
    id: 'converge',
    name: 'Converge',
    genres: ['metalcore', 'hardcore'],
    popularity: 70,
    images: [img('converge')],
  },
];

const ALBUMS_BY_ARTIST: Record<string, Album[]> = {
  rwake: [
    {
      id: 'rwake-return-of-magik',
      name: 'The Return of Magik',
      album_type: 'album',
      release_date: '2011-03-15',
      total_tracks: 7,
      images: [img('rwake-album-1')],
      external_urls: { spotify: 'https://open.spotify.com' },
    },
  ],
  neurosis: [
    {
      id: 'neurosis-times-of-grace',
      name: 'Times of Grace',
      album_type: 'album',
      release_date: '1999-11-30',
      total_tracks: 10,
      images: [img('neurosis-album-1')],
      external_urls: { spotify: 'https://open.spotify.com' },
    },
  ],
  highonfire: [
    {
      id: 'hof-snakes-for-divine',
      name: 'Snakes for the Divine',
      album_type: 'album',
      release_date: '2010-02-23',
      total_tracks: 8,
      images: [img('hof-album-1')],
      external_urls: { spotify: 'https://open.spotify.com' },
    },
  ],
};

const TRACKS_BY_ARTIST: Record<string, Track[]> = {
  rwake: [
    {
      id: 'rwake-track-1',
      name: 'The Return of Magik',
      preview_url: null,
      duration_ms: 420000,
      external_urls: { spotify: 'https://open.spotify.com' },
    },
    {
      id: 'rwake-track-2',
      name: 'A Fountain',
      preview_url: null,
      duration_ms: 360000,
      external_urls: { spotify: 'https://open.spotify.com' },
    },
  ],
  neurosis: [
    {
      id: 'neuro-track-1',
      name: 'The Doorway',
      preview_url: null,
      duration_ms: 330000,
      external_urls: { spotify: 'https://open.spotify.com' },
    },
  ],
};

const RELATED: Record<string, string[]> = {
  rwake: ['neurosis', 'amenra', 'sumac', 'yob', 'highonfire'],
  neurosis: ['amenra', 'sumac', 'yob', 'rwake'],
  highonfire: ['yob', 'neurosis', 'rwake'],
  amenra: ['neurosis', 'sumac', 'rwake'],
  sumac: ['neurosis', 'amenra', 'rwake'],
  yob: ['highonfire', 'neurosis', 'rwake'],
  thisgiftisacurse: ['converge', 'amenra', 'sumac'],
  converge: ['thisgiftisacurse', 'highonfire'],
};

function sleep(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export async function mockSearchArtists(
  query: string,
  limit = 10,
): Promise<SearchArtistsResponse> {
  await sleep();
  const q = normalize(query);
  if (!q) return { artists: { items: [] } };

  const items = ARTISTS.filter((a) => {
    const inName = normalize(a.name).includes(q);
    const inGenre = (a.genres ?? []).some((g) => normalize(g).includes(q));
    return inName || inGenre;
  }).slice(0, limit);

  return { artists: { items } };
}

export async function mockGetArtist(id: string): Promise<Artist> {
  await sleep();
  const a = ARTISTS.find((x) => x.id === id);
  if (!a) throw new Error(`Mock artist not found: ${id}`);
  return a;
}

export async function mockGetArtistTopTracks(
  id: string,
): Promise<TopTracksResponse> {
  await sleep();
  return { tracks: TRACKS_BY_ARTIST[id] ?? [] };
}

export async function mockGetArtistAlbums(id: string): Promise<AlbumsResponse> {
  await sleep();
  return { items: ALBUMS_BY_ARTIST[id] ?? [] };
}

export async function mockGetRelatedArtists(
  id: string,
): Promise<RelatedArtistsResponse> {
  await sleep();
  const ids = RELATED[id] ?? [];
  const artists = ids
    .map((aid) => ARTISTS.find((a) => a.id === aid))
    .filter(Boolean) as Artist[];
  return { artists };
}
