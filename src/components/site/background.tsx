import { useEffect, useRef, useState } from 'react';
import { findVideo } from '@/lib/api';
import { ytCmd, ytListen } from '@/lib/yt';
import { useNowPlaying } from '@/context/now-playing';
import { Globe } from '@/components/site/globe';

export function Background() {
  const { song } = useNowPlaying();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoOn, setVideoOn] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setVideoOn(false);
    setVideoId(null);
    if (!song || location.protocol === 'file:') return; // yt won't embed on file:// (error 153)
    let alive = true;
    findVideo(`${song.artist} ${song.name} official video`).then(id => alive && setVideoId(id));
    return () => { alive = false; };
  }, [song?.name, song?.artist]);

  // only show it while yt says it's playing (blocked embeds never do). yt flashes its
  // play/pause overlay for a couple seconds on every start/resume, so wait that out too
  useEffect(() => {
    let timer = 0;
    const on = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      let d: any; try { d = JSON.parse(e.data); } catch { return; }
      if (d.event === 'onError') { clearTimeout(timer); setVideoOn(false); return; }
      const state = d.event === 'onStateChange' ? d.info : d.info?.playerState;
      if (typeof state !== 'number' || state === 3) return; // buffering is fine to keep showing
      if (state === 1) {
        if (!timer) timer = window.setTimeout(() => setVideoOn(true), 3000);
        return;
      }
      clearTimeout(timer); timer = 0;
      setVideoOn(false);
      if (state !== 0) ytCmd(frame.current.contentWindow, 'playVideo'); // stuck unstarted/paused/cued, kick it
    };
    // chrome pauses it in background tabs
    const back = () => document.visibilityState === 'visible' && ytCmd(frame.current?.contentWindow, 'playVideo');
    addEventListener('message', on);
    document.addEventListener('visibilitychange', back);
    return () => { clearTimeout(timer); removeEventListener('message', on); document.removeEventListener('visibilitychange', back); };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${videoOn ? 'opacity-0' : 'opacity-100'}`}>
        <Globe className="size-full" />
      </div>

      {song?.art && (
        <div
          key={song.art}
          className="absolute -inset-20 animate-in fade-in bg-cover bg-center opacity-25 blur-[90px] saturate-150 duration-[1500ms]"
          style={{ backgroundImage: `url("${song.art}")` }}
        />
      )}

      {videoId && (
        <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${videoOn ? 'opacity-100' : 'opacity-0'}`}>
          <iframe
            ref={frame}
            key={videoId}
            tabIndex={-1}
            title=""
            className="absolute top-1/2 left-1/2 h-[max(100vh,56.25vw)] w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2 scale-[1.2] border-0"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&disablekb=1&iv_load_policy=3&start=15&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`}
            allow="autoplay; encrypted-media"
            onLoad={() => ytListen(frame.current, 1)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/70 to-[#050505]/90" />
          {/* hides letterbox bars */}
          <div className="absolute inset-0 bg-[linear-gradient(#050505_0%,#050505_12%,transparent_28%,transparent_72%,#050505_88%,#050505_100%)]" />
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_-10%,rgb(var(--glow)/0.16),transparent_70%)] transition-[background] duration-1000" />
      <div className="absolute inset-0 bg-[radial-gradient(transparent_45%,rgba(0,0,0,0.55)_85%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
}
