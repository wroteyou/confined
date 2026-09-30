import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { DISCORDS, FACTS, GITHUB, MY_TZ, NAME, TAGLINE, TELEGRAM } from '@/config';
import { useNowPlaying } from '@/context/now-playing';
import { useNow } from '@/hooks/use-now';
import { STATUS_COLOR, STATUS_TEXT } from '@/lib/discord';
import { bestPresence, DiscordCard } from '@/components/site/discord-card';
import { clock, mood } from '@/components/site/clock-compare';
import { copy } from '@/components/site/copy-button';
import { Icon } from '@/components/site/icon';
import { Scramble } from '@/components/site/scramble';
import { Spot } from '@/components/site/spot';
import { InteractiveHoverButton } from '@/components/block/interactive-hover-button';
import { Button } from '@/components/ui/button';

const ease = [0.2, 0.8, 0.2, 1] as const;
const rise = (delay: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease, delay: delay * 0.6 } });

function Fact({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div {...rise(delay)}>
      <Spot className="h-full p-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 font-medium">{children}</div>
      </Spot>
    </motion.div>
  );
}

export function Home() {
  const { presences, song } = useNowPlaying();
  const now = useNow(1000);
  const best = bestPresence(presences);
  const game = best?.activities.find(a => a.type === 0);
  const hour = +new Date(now).toLocaleString('en-US', { timeZone: MY_TZ, hour: 'numeric', hourCycle: 'h23' });

  return (
    <>
      <section className="pt-[6vh]">
        <motion.p {...rise(0)} className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-glow">01</span>hey
          <span className="h-px w-16 bg-white/15" />
        </motion.p>

        <h1 className="caret text-[clamp(72px,15vw,168px)] leading-[0.85] font-semibold tracking-[-0.06em]">
          <Scramble text={NAME} speed={40} delay={200} />
        </h1>

        <motion.p {...rise(0.25)} className="mt-6 flex flex-wrap gap-x-3 font-mono text-sm text-muted-foreground">
          {TAGLINE.map((t, i) => <span key={t}>{i > 0 && <span className="mr-3 opacity-40">/</span>}{t}</span>)}
        </motion.p>

        {song && (
          <motion.a {...rise(0.3)} href={song.url} target="_blank" rel="noopener noreferrer" className="group mt-5 inline-flex max-w-full items-center gap-2.5 text-[15px] text-muted-foreground">
            <span className="eq"><i /><i /><i /></span>
            <span className="truncate">listening to <b className="font-medium text-foreground transition-colors group-hover:text-glow">{song.name}</b> by {song.artist}</span>
          </motion.a>
        )}

        <motion.p {...rise(0.35)} className="mt-7 max-w-[620px] text-lg leading-relaxed text-muted-foreground [&_b]:font-medium [&_b]:text-foreground">
          studying <b>cs</b> &amp; learning <b>c++</b> rn. i mostly write <b>html</b>, <b>ts</b> &amp; <b>css</b>, and use <b>next.js</b> + <b>react</b> for frontends. if you need something made, message me on any of the platforms listed in{' '}
          <a href="#contact" className="text-foreground underline decoration-glow/60 underline-offset-4 transition hover:decoration-glow">contact</a>.
        </motion.p>

        <motion.div {...rise(0.45)} className="mt-9 flex flex-wrap items-center gap-2.5">
          <InteractiveHoverButton onClick={() => { location.hash = 'projects'; }} className="border-glow/40 bg-glow/10 text-sm">projects</InteractiveHoverButton>
          <Button variant="outline" className="rounded-full" onClick={() => copy(DISCORDS[0].handle, '@' + DISCORDS[0].handle)}>
            <Icon name="discord" />discord
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <a href={`https://t.me/${TELEGRAM}`} target="_blank" rel="noopener noreferrer"><Icon name="telegram" />telegram<ArrowUpRight className="opacity-50" /></a>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <a href={`https://github.com/${GITHUB}`} target="_blank" rel="noopener noreferrer"><Icon name="github" />github<ArrowUpRight className="opacity-50" /></a>
          </Button>
        </motion.div>
      </section>

      <section className="mt-20 grid items-start gap-3 lg:grid-cols-[1.35fr_1fr]">
        <motion.div {...rise(0.5)} className="space-y-3">
          {DISCORDS.map((d, i) => d.home && <DiscordCard key={d.id} presence={presences[i]} handle={d.handle} />)}
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <Fact label="status" delay={0.55}>
            <span className="size-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR[best?.discord_status ?? 'offline'] }} />
            <span className="truncate">{game ? game.name : STATUS_TEXT[best?.discord_status ?? 'offline']}</span>
          </Fact>
          {FACTS.map((f, i) => <Fact key={f.label} label={f.label} delay={0.6 + i * 0.05}>{f.value}</Fact>)}
          <Fact label="commissions" delay={0.7}><span className="size-2 rounded-full bg-emerald-400" />free</Fact>

          <motion.a {...rise(0.75)} href="#contact" className="col-span-2">
            <Spot className="p-5">
              <p className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">my time <span className="normal-case tracking-normal">compare yours →</span></p>
              <p className="font-mono text-4xl font-medium tabular-nums tracking-tight">{clock(MY_TZ, true, now)}</p>
              <p className="mt-1.5 font-mono text-xs text-muted-foreground">{mood(hour)}</p>
            </Spot>
          </motion.a>
        </div>
      </section>
    </>
  );
}
