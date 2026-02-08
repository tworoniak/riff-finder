export type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export type Artist = {
  id: string;
  name: string;
  genres: string[];
  popularity: number; // 0-100
  images: SpotifyImage[];
};

export type Track = {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: { spotify: string };
};

export type Album = {
  id: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string; // ISO date
  total_tracks: number;
  images: SpotifyImage[];
  external_urls: { spotify: string };
};

export type SearchArtistsResponse = { artists: { items: Artist[] } };
export type TopTracksResponse = { tracks: Track[] };
export type AlbumsResponse = { items: Album[] };
export type RelatedArtistsResponse = { artists: Artist[] };
