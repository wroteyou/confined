import { useEffect, useState } from 'react';
import { animate, motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Heart } from 'lucide-react';
import { cover, lastfm } from '@/lib/api';
import { songPosition, useNowPlaying } from '@/context/now-playing';
import { useNow } from '@/hooks/use-now';
import { PageHeader } from '@/components/site/section';
import { LyricLine } from '@/components/site/lyric-line';
import { Spot } from '@/components/site/spot';
import SkeumorphicMusicCard from '@/components/block/skeumorphic-music-card';
import GooeyBlobs from '@/components/ui/loaders-gooey-blobs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const cache = new Map<string, Promise<any>>();
function useLastfm<T>(key: string, load: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: boolean }>({});
  useEffect(() => {
    let alive = true;
    if (!cache.has(key)) cache.set(key, load().catch(e => { cache.delete(key); throw e; }));
    cache.get(key)!.then(data => alive && setState({ data }), () => alive && setState({ error: true }));
    return () => { alive = false; };
  }, [key]);
  return state;
}

function Loading<T>({ state, children }: { state: { data?: T; error?: boolean }; children: (d: T) => React.ReactNode }) {
  if (state.error) return <p className="py-16 text-center font-mono text-xs text-muted-foreground">couldn't reach last.fm right now.</p>;
  if (!state.data) return <div className="grid place-items-center py-16"><GooeyBlobs /></div>;
  return <>{children(state.data)}</>;
}

const ago = (uts: number) => {
  const s = Date.now() / 1000 - uts;
  return s < 3600 ? `${Math.max(1, (s / 60) | 0)}m ago` : s < 86400 ? `${(s / 3600) | 0}h ago` : `${(s / 86400) | 0}d ago`;
};

function Row({ n, title, sub, end, href, art }: { n: React.ReactNode; title: string; sub: string; end: React.ReactNode; href: string; art?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[2.5rem_auto_1fr_auto] items-center gap-4 border-b border-white/[0.06] px-2 py-3 transition-all hover:bg-white/[0.03] hover:pl-4">
      <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-glow">{n}</span>
      {art ? <img src={art} alt="" loading="lazy" className="size-10 rounded-md object-cover" /> : <span className="size-10 rounded-md bg-white/[0.05]" />}
      <span className="min-w-0">
        <span className="block truncate font-medium">{title}</span>
        <span className="block truncate text-sm text-muted-foreground">{sub}</span>
      </span>
      <span className="font-mono text-xs text-muted-foreground">{end}</span>
    </a>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1], onUpdate: v => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString(); } });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref}>0</span>;
}

const Albums = () => (
  <Loading state={useLastfm('albums', () => lastfm('user.gettopalbums', '&period=1month&limit=16'))}>
    {(d: any) => (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {d.topalbums.album.filter((a: any) => cover(a.image)).map((a: any, i: number) => (
          <motion.a
            key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            className="group relative aspect-square overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]"
          >
            <img src={cover(a.image)} alt={a.name} loading="lazy" className="size-full object-cover grayscale-[35%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
            <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur">{String(i + 1).padStart(2, '0')}</span>
            <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 font-mono text-[11px] opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
              <span className="block truncate text-foreground">{a.name}</span>
              <span className="block truncate text-muted-foreground">{a.artist.name} · {a.playcount} plays</span>
            </span>
          </motion.a>
        ))}
      </div>
    )}
  </Loading>
);

const Tracks = () => (
  <Loading state={useLastfm('tracks', () => lastfm('user.gettoptracks', '&period=1month&limit=15'))}>
    {(d: any) => <div>{d.toptracks.track.map((t: any, i: number) => <Row key={t.url} n={String(i + 1).padStart(2, '0')} title={t.name} sub={t.artist.name} end={`${t.playcount}×`} href={t.url} />)}</div>}
  </Loading>
);

const Recent = () => (
  <Loading state={useLastfm('recent', () => lastfm('user.getrecenttracks', '&limit=20'))}>
    {(d: any) => (
      <div>
        {d.recenttracks.track.map((t: any, i: number) => {
          const live = t['@attr']?.nowplaying === 'true';
          return <Row key={t.url + i} n={live ? <span className="eq"><i /><i /><i /></span> : String(i + 1).padStart(2, '0')} title={t.name} sub={t.artist['#text']} art={cover(t.image)} end={live ? <span className="text-glow">now</span> : t.date ? ago(+t.date.uts) : ''} href={t.url} />;
        })}
      </div>
    )}
  </Loading>
);

const Loved = () => (
  <Loading state={useLastfm('loved', () => lastfm('user.getlovedtracks', '&limit=15'))}>
    {(d: any) => d.lovedtracks.track.length
      ? <div>{d.lovedtracks.track.map((t: any) => <Row key={t.url} n={<Heart className="size-3.5 fill-glow text-glow" />} title={t.name} sub={t.artist.name} end="↗" href={t.url} />)}</div>
      : <p className="py-16 text-center font-mono text-xs text-muted-foreground">no loved tracks yet.</p>}
  </Loading>
);

const Stats = () => (
  <Loading state={useLastfm('stats', () => lastfm('user.getinfo'))}>
    {({ user: u }: any) => {
      const days = Math.max(1, (Date.now() / 1000 - u.registered.unixtime) / 86400);
      const stats: [number, string][] = [[+u.playcount, 'scrobbles'], [+u.artist_count, 'artists'], [+u.album_count, 'albums'], [Math.round(u.playcount / days), 'plays / day']];
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([n, l]) => (
            <Spot key={l} className="p-5">
              <p className="text-4xl font-semibold tracking-tight tabular-nums"><CountUp to={n} /></p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{l}</p>
            </Spot>
          ))}
        </div>
      );
    }}
  </Loading>
);

function NowPlaying() {
  const { song, spotify, listening, toggleListen, setListening } = useNowPlaying();
  const now = useNow(1000);
  if (!song) {
    return (
      <Spot className="flex items-center gap-4 p-6">
        <span className="size-2 rounded-full bg-white/30" />
        <p className="font-mono text-sm text-muted-foreground">nothing playing rn. here's what's been on lately.</p>
      </Spot>
    );
  }
  const pos = songPosition(spotify, now);
  const progress = spotify && pos !== null ? Math.min(1, pos / (spotify.timestamps.end - spotify.timestamps.start)) : null;
  const resync = () => { setListening(false); setTimeout(() => setListening(true), 50); };

  return (
    <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
      <SkeumorphicMusicCard
        title={song.name} artist={song.artist} cover={song.art}
        playing={listening} progress={progress}
        onToggle={toggleListen} onBack={resync} onForward={() => window.open(song.url, '_blank', 'noopener,noreferrer')}
        className="mx-auto w-fit"
      />
      <div className="min-w-0">
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-glow"><span className="eq"><i /><i /><i /></span>now playing{spotify && !spotify.estimated && ' on spotify'}</p>
        <h2 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{song.name}</h2>
        <p className="mt-2 text-lg text-muted-foreground">by {song.artist}{spotify?.album && <> · <span className="font-serif italic">{spotify.album}</span></>}</p>
        <LyricLine className="mt-8 min-h-[2.6em] text-2xl leading-snug sm:text-3xl" />
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          {listening ? 'listening along. audio comes from youtube, synced to where i am.' : 'hit play to listen along with me.'}
        </p>
      </div>
    </div>
  );
}

export function Music() {
  const tabs = { albums: Albums, tracks: Tracks, recent: Recent, loved: Loved, stats: Stats };
  return (
    <>
      <PageHeader n="02" eyebrow="on repeat" title="music">what i've had on this month.</PageHeader>
      <NowPlaying />
      <Tabs defaultValue="albums" className="mt-16 gap-6">
        <TabsList className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {Object.keys(tabs).map(t => (
            <TabsTrigger key={t} value={t} className="rounded-lg font-mono text-xs data-[state=active]:!bg-glow/15 data-[state=active]:ring-1 data-[state=active]:ring-glow/30">{t}</TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(tabs).map(([t, View]) => <TabsContent key={t} value={t}><View /></TabsContent>)}
      </Tabs>
    </>
  );
}
