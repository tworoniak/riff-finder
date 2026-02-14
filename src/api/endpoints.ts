import type {
  AlbumsResponse,
  Artist,
  RelatedArtistsResponse,
  SearchArtistsResponse,
  TopTracksResponse,
} from './types';

import {
  mockGetArtist,
  mockGetArtistAlbums,
  mockGetArtistTopTracks,
  mockGetRelatedArtists,
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

export async function getArtistTopTracks(
  id: string,
  market = MARKET,
): Promise<TopTracksResponse> {
  if (USE_MOCK) return mockGetArtistTopTracks(id);
  return spotifyFetch<TopTracksResponse>(
    `/v1/artists/${id}/top-tracks?market=${market}`,
  );
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

export async function getRelatedArtists(
  id: string,
): Promise<RelatedArtistsResponse> {
  if (USE_MOCK) return mockGetRelatedArtists(id);
  return spotifyFetch<RelatedArtistsResponse>(
    `/v1/artists/${id}/related-artists`,
  );
}
