import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DISCORDS } from '@/config';
import { cleanTitle, cover, estimateTiming, fetchLyrics, findVideo, lanyard, lastfm, type Lyrics, type Presence, type Spotify } from '@/lib/api';
import { usePoll } from '@/hooks/use-now';
import { ytCmd, ytListen } from '@/lib/yt';

export type Song = { name: string; artist: string; url: string; art: string };

type Ctx = {
  presences: (Presence | null)[];
  song: Song | null;
  spotify: Spotify | null;   // timing for `song`: live from discord, held over, or estimated from last.fm
  lyrics: Lyrics | null;
  listening: boolean;        // listen along on?
  toggleListen: () => void;
  setListening: (on: boolean) => void;
};
const NowPlaying = createContext<Ctx>(null!);
export const useNowPlaying = () => useContext(NowPlaying);

export const songPosition = (sp: Spotify | null, now = Date.now()) => (sp ? now - sp.timestamps.start : null);

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [presences, setPresences] = useState<(Presence | null)[]>(() => DISCORDS.map(() => null));
  const [song, setSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [listening, setListening] = useState(false);

  const [estimate, setEstimate] = useState<Spotify | null>(null);
  const lastLive = useRef<Spotify | null>(null);
  const seenAt = useRef<number | null>(null);

  const anySpotify = presences.find(p => p?.listening_to_spotify)?.spotify ?? null;
  const isSong = (sp: Spotify | null): sp is Spotify => !!song && !!sp && sp.song.toLowerCase().includes(cleanTitle(song.name).toLowerCase());
  const live = isSong(anySpotify) ? anySpotify : null;
  if (live) lastLive.current = live;
  // going invisible / switching accounts drops spotify mid song, but the timing doesn't change
  const held = !live && isSong(lastLive.current) && Date.now() < lastLive.current.timestamps.end ? lastLive.current : null;
  const spotify = live ?? held ?? estimate;

  usePoll(() => { Promise.all(DISCORDS.map(d => lanyard(d.id))).then(setPresences); }, 15000);

  // last.fm's nowplaying flag flickers, so fall back to spotify and wait for 2 misses
  const misses = useRef(0);
  const spotifyRef = useRef(anySpotify);
  spotifyRef.current = anySpotify;
  usePoll(() => {
    lastfm('user.getrecenttracks', '&limit=1').then(d => {
      const t = d.recenttracks.track[0];
      const sp = spotifyRef.current;
      let next: Song | null = null;
      if (t?.['@attr']?.nowplaying === 'true') next = { name: t.name, artist: t.artist['#text'], url: t.url, art: cover(t.image) };
      else if (sp) next = { name: sp.song, artist: sp.artist.replace(/;/g, ','), url: 'https://open.spotify.com/track/' + sp.track_id, art: sp.album_art_url };
      if (next) {
        misses.current = 0;
        setSong(s => {
          if (s?.name === next!.name && s.artist === next!.artist) return s;
          seenAt.current = s ? Date.now() - 5000 : null; // only a real change counts, not the first load. polls are 10s apart
          return next;
        });
      }
      else if (++misses.current >= 2) setSong(null);
    }).catch(() => {});
  }, 10000);

  useEffect(() => {
    setEstimate(null);
    if (!song) return;
    let alive = true;
    estimateTiming(song.name, song.artist, seenAt.current).then(t => alive && t && setEstimate({
      track_id: '', song: song.name, artist: song.artist, album: '', album_art_url: song.art, timestamps: t, estimated: true,
    }), () => {});
    return () => { alive = false; };
  }, [song?.name, song?.artist]);

  useEffect(() => {
    setLyrics(null);
    if (!song) return;
    let alive = true;
    fetchLyrics(song.name, song.artist).then(l => alive && setLyrics(l));
    return () => { alive = false; };
  }, [song?.name, song?.artist]);

  useEffect(() => {
    const root = document.documentElement;
    if (!song?.art) { root.style.removeProperty('--glow'); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 16;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 16, 16);
        const px = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < px.length; i += 4) {
          const max = Math.max(px[i], px[i + 1], px[i + 2]), min = Math.min(px[i], px[i + 1], px[i + 2]);
          if (max - min > 40 && max > 70) { r += px[i]; g += px[i + 1]; b += px[i + 2]; n++; }
        }
        if (!n) return;
        const k = Math.max(1, 200 / Math.max(r / n, g / n, b / n)); // dark covers get brightened so text stays readable
        root.style.setProperty('--glow', [r, g, b].map(c => Math.min(255, (c / n) * k) | 0).join(' '));
      } catch {} // tainted canvas, keep default
    };
    img.src = song.art;
  }, [song?.art]);

  useEffect(() => { if (!song) setListening(false); }, [song]);
  const toggleListen = useCallback(() => setListening(v => !v), []);

  return (
    <NowPlaying.Provider value={{ presences, song, spotify, lyrics, listening, toggleListen, setListening }}>
      {children}
      {listening && song && <ListenAlongPlayer song={song} spotify={spotify} />}
    </NowPlaying.Provider>
  );
}

// listen along: hidden yt player, resynced if it drifts >2s

function ListenAlongPlayer({ song, spotify }: { song: Song; spotify: Spotify | null }) {
  const [id, setId] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const spRef = useRef(spotify);
  spRef.current = spotify;
  const lastSeek = useRef(0);

  useEffect(() => {
    setId(null);
    let alive = true;
    findVideo(`${song.artist} ${song.name} official audio`).then(v => alive && setId(v));
    return () => { alive = false; };
  }, [song.name, song.artist]);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      let d: any; try { d = JSON.parse(e.data); } catch { return; }
      if (d.event === 'onError') { setId(null); return; }
      const t = d.info?.currentTime, pos = songPosition(spRef.current);
      if (typeof t === 'number' && pos !== null && Math.abs(t - pos / 1000) > 2 && Date.now() - lastSeek.current > 5000) {
        lastSeek.current = Date.now();
        ytCmd(frame.current.contentWindow, 'seekTo', [pos / 1000 + 0.5, true]);
      }
    };
    addEventListener('message', on);
    return () => removeEventListener('message', on);
  }, []);

  // memo'd or every render changes src and reloads the iframe
  const start = useMemo(() => Math.floor((songPosition(spRef.current) ?? 0) / 1000), [id]);

  if (!id) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed bottom-0 left-0 -z-10 size-[200px] opacity-0">
      <iframe
        ref={frame}
        className="size-[200px] border-0"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&controls=0&playsinline=1&enablejsapi=1&start=${start}&origin=${encodeURIComponent(location.origin)}`}
        allow="autoplay; encrypted-media"
        onLoad={() => ytListen(frame.current, 2)}
      />
    </div>
  );
}
