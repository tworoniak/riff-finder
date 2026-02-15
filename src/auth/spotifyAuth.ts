const AUTH_BASE = 'https://accounts.spotify.com/authorize';

const LS_KEY = 'riff_spotify_auth';

type StoredAuth = {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
};

function base64UrlEncode(bytes: ArrayBuffer) {
  const str = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(input: string) {
  const enc = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-256', enc);
}

function randomString(len = 64) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(LS_KEY);
}

export async function loginWithSpotify() {
  const clientId =
    import.meta.env.VITE_SPOTIFY_CLIENT_ID || import.meta.env.SPOTIFY_CLIENT_ID;
  // We don't actually need VITE_SPOTIFY_CLIENT_ID if exchange happens server-side,
  // but Spotify authorize URL needs the client_id. We'll read from VITE_ if you add it,
  // otherwise we can hardcode it in a config file later.
  if (!clientId)
    throw new Error(
      'Missing client id for authorize URL. Add VITE_SPOTIFY_CLIENT_ID.',
    );

  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  if (!redirectUri) throw new Error('Missing VITE_SPOTIFY_REDIRECT_URI');

  const verifier = randomString(64);
  sessionStorage.setItem('spotify_pkce_verifier', verifier);

  const challenge = base64UrlEncode(await sha256(verifier));

  // Scopes: keep minimal. These are safe + common for reading.
  const scope = ['user-read-email', 'user-read-private'].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope,
  });

  window.location.assign(`${AUTH_BASE}?${params.toString()}`);
}

export async function handleSpotifyCallback(code: string) {
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const verifier = sessionStorage.getItem('spotify_pkce_verifier');
  if (!verifier)
    throw new Error('Missing PKCE verifier. Try logging in again.');

  const r = await fetch('/api/spotify-exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`Spotify exchange failed: ${r.status} ${text}`);
  }

  const data = (await r.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };

  const expires_at = Date.now() + (data.expires_in - 60) * 1000;

  const stored: StoredAuth = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at,
  };

  localStorage.setItem(LS_KEY, JSON.stringify(stored));
  sessionStorage.removeItem('spotify_pkce_verifier');

  return stored;
}

export async function getValidAccessToken(): Promise<string | null> {
  const stored = getStoredAuth();
  if (!stored) return null;

  if (Date.now() < stored.expires_at) return stored.access_token;

  // Try refresh
  if (!stored.refresh_token) return null;

  const r = await fetch('/api/spotify-refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: stored.refresh_token }),
  });

  if (!r.ok) {
    clearStoredAuth();
    return null;
  }

  const data = (await r.json()) as { access_token: string; expires_in: number };

  const updated: StoredAuth = {
    ...stored,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };

  localStorage.setItem(LS_KEY, JSON.stringify(updated));
  return updated.access_token;
}
