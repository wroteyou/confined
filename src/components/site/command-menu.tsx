import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Copy, CornerDownLeft, Hash, Headphones, Mail, Search, Square } from 'lucide-react';
import { DISCORDS, EMAIL, GITHUB, TELEGRAM } from '@/config';
import { PAGES } from '@/hooks/use-route';
import { useNowPlaying } from '@/context/now-playing';
import { copy } from '@/components/site/copy-button';
import { Icon } from '@/components/site/icon';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

type Cmd = { group: string; label: string; hint?: string; icon: React.ReactNode; run: () => void };

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { song, listening, toggleListen } = useNowPlaying();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  const cmds = useMemo<Cmd[]>(() => [
    ...PAGES.map((p, n) => ({ group: 'pages', label: p, hint: String(n + 1), icon: <Hash />, run: () => { location.hash = p; } })),
    ...(song ? [
      { group: 'music', label: listening ? 'stop listening' : `listen along to ${song.name}`, icon: listening ? <Square /> : <Headphones />, run: toggleListen },
      { group: 'music', label: `open ${song.name}`, icon: <ArrowUpRight />, run: () => open_(song.url) },
    ] : []),
    ...DISCORDS.map(d => ({ group: 'copy', label: `discord @${d.handle}`, icon: <Copy />, run: () => copy(d.handle, '@' + d.handle) })),
    { group: 'copy', label: `telegram @${TELEGRAM}`, icon: <Copy />, run: () => copy(TELEGRAM, '@' + TELEGRAM) },
    { group: 'copy', label: `email ${EMAIL}`, icon: <Copy />, run: () => copy(EMAIL) },
    { group: 'open', label: 'email', icon: <Mail />, run: () => { location.href = `mailto:${EMAIL}`; } },
    { group: 'open', label: 'telegram', icon: <Icon name="telegram" />, run: () => open_(`https://t.me/${TELEGRAM}`) },
    { group: 'open', label: 'github', icon: <Icon name="github" />, run: () => open_(`https://github.com/${GITHUB}`) },
  ], [song, listening, toggleListen]);

  const hits = cmds.filter(c => `${c.group} ${c.label}`.toLowerCase().includes(q.toLowerCase().trim()));
  const pick = (c?: Cmd) => { if (!c) return; onOpenChange(false); c.run(); };

  useEffect(() => { if (open) { setQ(''); setI(0); } }, [open]);
  useEffect(() => setI(0), [q]);
  useEffect(() => { list.current?.querySelector(`[data-i="${i}"]`)?.scrollIntoView({ block: 'nearest' }); }, [i]);

  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI(v => (v + 1) % Math.max(1, hits.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI(v => (v - 1 + hits.length) % Math.max(1, hits.length)); }
    else if (e.key === 'Enter') pick(hits[i]);
    else if (e.key === 'Escape') onOpenChange(false);
  };

  let lastGroup = '';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          onMouseDown={e => e.target === e.currentTarget && onOpenChange(false)}
        >
          <motion.div
            role="dialog" aria-label="command menu"
            initial={{ opacity: 0, scale: 0.96, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]/95 shadow-[0_40px_120px_-20px_rgb(0_0_0),0_0_80px_-30px_rgb(var(--glow)/0.5)]"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={key}
                placeholder="where to?" aria-label="search commands"
                className="h-13 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
              />
              <Kbd>esc</Kbd>
            </div>
            <div ref={list} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {hits.length === 0 && <p className="px-3 py-8 text-center font-mono text-xs text-muted-foreground">nothing for "{q}"</p>}
              {hits.map((c, n) => {
                const head = c.group !== lastGroup && (lastGroup = c.group);
                return (
                  <div key={c.group + c.label}>
                    {head && <p className="px-3 pt-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{c.group}</p>}
                    <button
                      role="option" aria-selected={n === i} data-i={n}
                      onMouseMove={() => setI(n)} onClick={() => pick(c)}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors [&_svg]:size-4', n === i ? 'bg-glow/15 text-foreground' : 'text-muted-foreground')}
                    >
                      <span className={cn('grid size-4 place-items-center', n === i && 'text-glow')}>{c.icon}</span>
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && <Kbd>{c.hint}</Kbd>}
                      {n === i && <CornerDownLeft className="text-muted-foreground" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const open_ = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
