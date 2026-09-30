import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '@/config';
import { Eyebrow, PageHeader, Reveal } from '@/components/site/section';
import { Spot } from '@/components/site/spot';

function Featured() {
  const p = PROJECTS[0];
  const x = useMotionValue(0), y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const move = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div style={{ perspective: 1200 }}>
      <motion.a
        href={p.href} target={p.external ? '_blank' : undefined} rel="noopener noreferrer"
        onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="group block"
      >
        <Spot className="grid overflow-hidden md:grid-cols-[1.15fr_1fr]">
          <div className="relative grid min-h-64 place-items-center overflow-hidden border-b border-white/[0.07] md:border-r md:border-b-0">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgb(255_255_255/0.03)_0_1px,transparent_1px_11px)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgb(var(--glow)/0.35),transparent_65%)]" />
            <span className="absolute top-4 left-4 font-mono text-[11px] text-muted-foreground">{p.year}</span>
            <p style={{ transform: 'translateZ(50px)' }} className="relative text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
              {p.name}<span className="text-glow transition-colors duration-1000">.wtf</span>
            </p>
          </div>
          <div className="flex flex-col p-6 sm:p-7">
            <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{p.description}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.tags.map(t => <span key={t} className="rounded-md border border-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{t}</span>)}
            </div>
            <p className="mt-8 flex items-center justify-between pt-2 font-mono text-sm md:mt-auto">
              <span className="flex items-center gap-1 transition-colors group-hover:text-glow">visit <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              <span className="text-muted-foreground">{new URL(p.href).host}</span>
            </p>
          </div>
        </Spot>
      </motion.a>
    </div>
  );
}

export function Projects() {
  return (
    <>
      <motion.a
        href="#contact" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="group mb-12 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 font-mono text-xs text-muted-foreground"
      >
        <span className="size-2 rounded-full bg-emerald-400" />
        <b className="font-medium text-foreground">commissions open</b>free rn
        <span className="ml-auto text-glow transition-transform group-hover:translate-x-1">dm me →</span>
      </motion.a>

      <PageHeader n="03" eyebrow="my work" title="projects">stuff i've made.</PageHeader>
      <Reveal><Featured /></Reveal>

      <Eyebrow>more</Eyebrow>
      <div className="border-t border-white/[0.06]">
        {PROJECTS.slice(1).map((p, i) => (
          <Reveal key={p.name} delay={i * 0.05}>
            <a href={p.href} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-white/[0.06] px-2 py-5 transition-all hover:bg-white/[0.03] hover:pl-5">
              <span className="font-mono text-xs text-muted-foreground group-hover:text-glow">{String(i + 2).padStart(2, '0')}</span>
              <span>
                <span className="block text-lg font-medium">{p.name}</span>
                <span className="block font-mono text-xs text-muted-foreground">{p.description}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">{p.year}<ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-glow" /></span>
            </a>
          </Reveal>
        ))}
      </div>
    </>
  );
}
