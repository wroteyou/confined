import { motion } from 'motion/react';
import { Headphones } from 'lucide-react';
import { NAME, DOMAIN } from '@/config';
import { useNowPlaying } from '@/context/now-playing';
import { Scramble } from '@/components/site/scramble';

// the click doubles as the user gesture autoplay needs
export function Splash({ onEnter }: { onEnter: () => void }) {
  const { song, setListening } = useNowPlaying();
  const enter = (listen: boolean) => { if (listen) setListening(true); onEnter(); };

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.04 }}
      transition={{ duration: 0.7, ease: [0.7, 0, 0.3, 1] }}
      className="fixed inset-0 z-[80] grid cursor-pointer place-items-center bg-background/80 backdrop-blur-2xl"
      onClick={() => enter(false)}
      role="button" tabIndex={0} aria-label="enter site"
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && enter(false)}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          <Scramble text={DOMAIN} delay={200} />
        </p>
        <h1 className="caret text-7xl font-semibold tracking-[-0.05em] sm:text-9xl">
          <Scramble text={NAME} speed={45} />
        </h1>

        {song && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            {song.art && <img src={song.art} alt="" className="size-10 rounded-md" />}
            <span className="max-w-72 truncate text-left">
              <span className="eq mr-2 align-middle"><i /><i /><i /></span>
              <span className="text-foreground">{song.name}</span> by {song.artist}
            </span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-10 flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">click to enter</span>
          {song && (
            <button
              onClick={e => { e.stopPropagation(); enter(true); }}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-glow/15 px-4 py-2 font-mono text-xs text-foreground ring-1 ring-glow/40 transition hover:bg-glow/25"
            >
              <Headphones className="size-3.5" /> enter + listen along
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
