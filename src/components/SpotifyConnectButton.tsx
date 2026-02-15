import {
  loginWithSpotify,
  clearStoredAuth,
  getStoredAuth,
} from '../auth/spotifyAuth';
import { useState } from 'react';

export function SpotifyConnectButton() {
  const [authed, setAuthed] = useState(!!getStoredAuth());

  return authed ? (
    <button
      className='rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-900'
      onClick={() => {
        clearStoredAuth();
        setAuthed(false);
      }}
    >
      Disconnect Spotify
    </button>
  ) : (
    <button
      className='rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-white'
      onClick={() => loginWithSpotify()}
    >
      Connect Spotify
    </button>
  );
}
