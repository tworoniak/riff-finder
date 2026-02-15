export type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export type Artist = {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  // popularity removed Feb 2026
  popularity?: number;
};

export type Track = {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: { spotify: string };
};

// Album tracks endpoint returns a "simplified track" object.
// Keep it compatible with TrackList by ensuring these fields exist (or are optional-safe).
export type AlbumTrack = {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls?: { spotify: string };
};

export type Album = {
  id: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string;
  total_tracks: number;
  images: SpotifyImage[];
  external_urls: { spotify: string };
};

export type SearchArtistsResponse = { artists: { items: Artist[] } };

// Deprecated/removed endpoints (keep types only if old code still references them)
export type TopTracksResponse = { tracks: Track[] };
export type RelatedArtistsResponse = { artists: Artist[] };

export type AlbumsResponse = { items: Album[] };

// New (still-available) endpoints
export type AlbumTracksResponse = { items: AlbumTrack[] };
export type TrackResponse = Track;
