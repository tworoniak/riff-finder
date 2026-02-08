import {
  getArtist,
  getArtistAlbums,
  getArtistTopTracks,
  getRelatedArtists,
  searchArtists,
} from './endpoints';

export const qk = {
  searchArtists: (query: string) =>
    ['spotify', 'searchArtists', query] as const,
  artist: (id: string) => ['spotify', 'artist', id] as const,
  topTracks: (id: string, market = 'US') =>
    ['spotify', 'artistTopTracks', id, market] as const,
  albums: (id: string, market = 'US', include = 'album,single') =>
    ['spotify', 'artistAlbums', id, market, include] as const,
  related: (id: string) => ['spotify', 'relatedArtists', id] as const,
};

export const qf = {
  searchArtists: (query: string) => () => searchArtists(query),
  artist: (id: string) => () => getArtist(id),
  topTracks:
    (id: string, market = 'US') =>
    () =>
      getArtistTopTracks(id, market),
  albums:
    (id: string, market = 'US', include = 'album,single') =>
    () =>
      getArtistAlbums(id, market, include),
  related: (id: string) => () => getRelatedArtists(id),
};
