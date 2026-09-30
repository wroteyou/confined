import { useEffect, useState } from 'react';
import { MY_TZ } from '@/config';
import { useNowPlaying } from '@/context/now-playing';
import { useNow } from '@/hooks/use-now';
import { VisitorCount } from '@/components/block/visitor-count';
import { clock } from '@/components/site/clock-compare';

function usePing() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const run = async () => {
      const t = performance.now();
      try { await fetch('https://1.1.1.1/cdn-cgi/trace', { cache: 'no-store', mode: 'no-cors' }); setMs(Math.round(performance.now() - t)); } catch { setMs(null); }
    };
    run();
    const id = setInterval(run, 15000);
    return () => clearInterval(id);
  }, []);
  return ms;
}

export function StatusDock() {
  const { song } = useNowPlaying();
  const now = useNow(1000);
  const ping = usePing();
  return (
    <div className="glass fixed bottom-4 left-1/2 z-40 flex whitespace-nowrap max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 rounded-full p-1 font-mono text-[11px] text-muted-foreground">
      <span className="rounded-full bg-[rgb(var(--glow))] px-3 py-1.5 font-medium text-black transition-colors duration-1000">~/convict</span>
      {song && (
        <a href={song.url} target="_blank" rel="noopener noreferrer" className="hidden min-w-0 items-center gap-2 px-3 sm:flex">
          <span className="eq"><i /><i /><i /></span>
          <span className="max-w-48 truncate"><span className="text-foreground">{song.name}</span> by {song.artist}</span>
        </a>
      )}
      <span className="px-3">local <span className="text-foreground tabular-nums">{clock(MY_TZ, false, now)}</span></span>
      <span className="hidden px-3 md:inline">ping <span className="text-foreground">{ping === null ? '-' : ping + 'ms'}</span></span>
      <VisitorCount className="bg-transparent px-3 py-1.5 text-[11px]" />
    </div>
  );
}
