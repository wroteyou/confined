import { AnimatePresence, motion } from 'motion/react';
import { songPosition, useNowPlaying } from '@/context/now-playing';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';

// needs the spotify position from discord to know which line we're on
export function LyricLine({ className }: { className?: string }) {
  const { lyrics, spotify } = useNowPlaying();
  const now = useNow(250);
  if (!lyrics) return null;
  if (lyrics.instrumental) return <p className={cn('text-muted-foreground', className)}>♪ instrumental</p>;
  const pos = songPosition(spotify, now);
  if (!lyrics.lines || pos === null) return null;

  let i = -1;
  while (i + 1 < lyrics.lines.length && lyrics.lines[i + 1].t <= pos) i++;
  const text = i >= 0 ? lyrics.lines[i].text : '';

  return (
    <div className={cn('relative min-h-[1.5em] overflow-hidden', className)} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.3 }}
          className={text ? 'font-semibold text-foreground' : 'text-muted-foreground'}
        >
          {text || '♪'}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
