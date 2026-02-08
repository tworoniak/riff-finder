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

// later: you’ll implement real Spotify versions and switch here
const USE_MOCK = import.meta.env.VITE_USE_MOCK_SPOTIFY === 'true';

export async function searchArtists(
  query: string,
  limit = 10,
): Promise<SearchArtistsResponse> {
  if (USE_MOCK) return mockSearchArtists(query, limit);
  throw new Error('Real Spotify not enabled yet');
}

export async function getArtist(id: string): Promise<Artist> {
  if (USE_MOCK) return mockGetArtist(id);
  throw new Error('Real Spotify not enabled yet');
}

export async function getArtistTopTracks(
  id: string,
  _market?: string,
): Promise<TopTracksResponse> {
  if (USE_MOCK) return mockGetArtistTopTracks(id);
  throw new Error('Real Spotify not enabled yet');
}

export async function getArtistAlbums(
  id: string,
  _market?: string,
  _includeGroups?: string,
): Promise<AlbumsResponse> {
  if (USE_MOCK) return mockGetArtistAlbums(id);
  throw new Error('Real Spotify not enabled yet');
}

export async function getRelatedArtists(
  id: string,
): Promise<RelatedArtistsResponse> {
  if (USE_MOCK) return mockGetRelatedArtists(id);
  throw new Error('Real Spotify not enabled yet');
}
