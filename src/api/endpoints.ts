import type {
  AlbumTracksResponse,
  TrackResponse,
  AlbumsResponse,
  Artist,
  // RelatedArtistsResponse,
  SearchArtistsResponse,
  // TopTracksResponse,
} from './types';

import {
  mockGetArtist,
  mockGetArtistAlbums,
  // mockGetArtistTopTracks,
  // mockGetRelatedArtists,
  mockSearchArtists,
} from './mockSpotify';

import { spotifyFetch } from './spotify';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_SPOTIFY === 'true';
const MARKET = import.meta.env.VITE_SPOTIFY_MARKET || 'US';

export async function searchArtists(
  query: string,
  limit = 10,
): Promise<SearchArtistsResponse> {
  if (USE_MOCK) return mockSearchArtists(query, limit);

  const q = encodeURIComponent(query.trim());
  return spotifyFetch<SearchArtistsResponse>(
    `/v1/search?q=${q}&type=artist&limit=${limit}`,
  );
}

export async function getArtist(id: string): Promise<Artist> {
  if (USE_MOCK) return mockGetArtist(id);
  return spotifyFetch<Artist>(`/v1/artists/${id}`);
}

export async function getArtistAlbums(
  id: string,
  market = MARKET,
  includeGroups = 'album,single',
): Promise<AlbumsResponse> {
  if (USE_MOCK) return mockGetArtistAlbums(id);

  return spotifyFetch<AlbumsResponse>(
    `/v1/artists/${id}/albums?include_groups=${encodeURIComponent(includeGroups)}&market=${encodeURIComponent(market)}`,
  );
}

export async function getArtistTopTracks(): Promise<never> {
  throw new Error(
    'Removed by Spotify (Feb 2026): GET /artists/{id}/top-tracks',
  );
}

export async function getRelatedArtists(): Promise<never> {
  throw new Error(
    'Not available in Spotify Dev Mode (Feb 2026): GET /artists/{id}/related-artists',
  );
}

export async function getAlbumTracks(
  albumId: string,
): Promise<AlbumTracksResponse> {
  // NOTE: limit param appears flaky for some endpoints; omit it.
  return spotifyFetch<AlbumTracksResponse>(`/v1/albums/${albumId}/tracks`);
}

export async function getTrack(id: string): Promise<TrackResponse> {
  return spotifyFetch<TrackResponse>(`/v1/tracks/${id}`);
}
