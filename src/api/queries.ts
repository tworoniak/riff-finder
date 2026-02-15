import { getArtist, getArtistAlbums, searchArtists } from './endpoints';
import type { AlbumsResponse, Artist } from './types'; //Track
import {
  buildNotableTracksFromAlbums,
  buildSimilarArtistsByGenre,
} from './artistReplacements';

export const qk = {
  searchArtists: (query: string) =>
    ['spotify', 'searchArtists', query] as const,
  artist: (id: string) => ['spotify', 'artist', id] as const,

  // still valid (albums endpoint remains)
  albums: (id: string, market = 'US', include = 'album,single') =>
    ['spotify', 'artistAlbums', id, market, include] as const,

  // replacements (derived)
  notableTracks: (artistId: string) =>
    ['spotify', 'notableTracks', artistId] as const,
  similarArtists: (artistId: string) =>
    ['spotify', 'similarArtists', artistId] as const,
};

export const qf = {
  searchArtists: (query: string) => () => searchArtists(query),
  artist: (id: string) => () => getArtist(id),

  albums:
    (id: string, market = 'US', include = 'album,single') =>
    () =>
      getArtistAlbums(id, market, include),

  /**
   * Derived: uses artist albums -> album tracks to create a "notable tracks" list.
   * NOTE: this expects albums to be fetched first (or pass albums directly elsewhere).
   */
  notableTracks: (albums: AlbumsResponse['items']) => async () => {
    return buildNotableTracksFromAlbums(albums, 6, 10);
  },

  /**
   * Derived: uses artist genres -> search artists -> score overlap.
   */
  similarArtists: (seedArtist: Artist) => async () => {
    return buildSimilarArtistsByGenre(seedArtist, 10);
  },
};
