import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleSpotifyCallback } from '../auth/spotifyAuth';

function safeErrorParam(msg: string) {
  return encodeURIComponent(msg.slice(0, 300));
}

export default function CallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const ranRef = useRef(false);

  const { code, err } = useMemo(() => {
    return {
      code: params.get('code'),
      err: params.get('error'),
    };
  }, [params]);

  useEffect(() => {
    if (ranRef.current) return; // ✅ prevents StrictMode double-run from double-exchanging
    if (err || !code) return;

    ranRef.current = true;

    (async () => {
      try {
        await handleSpotifyCallback(code);
        navigate('/discover', { replace: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        navigate(`/callback?error=${safeErrorParam(msg)}`, { replace: true });
      }
    })();
  }, [code, err, navigate]);

  if (err) {
    return (
      <div className='space-y-4'>
        <h1 className='text-2xl font-semibold'>Spotify connection failed</h1>
        <div className='rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200'>
          {err}
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className='space-y-4'>
        <h1 className='text-2xl font-semibold'>Spotify callback</h1>
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300'>
          Missing <code>code</code> parameter. Try connecting again.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>Connecting Spotify…</h1>
      <div className='text-zinc-300'>Finishing authentication.</div>
    </div>
  );
}
