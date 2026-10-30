import { motion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

export function PageHeader({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mb-12">
      <p className="mb-5 flex items-center gap-3 font-mono text-[12px] tracking-[0.02em] text-muted-foreground">
        <i className="live-dot" />
        <span className="text-foreground">{n}</span>
        <span>./{eyebrow.replace(/ /g, '_')}</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </p>
      <h1 className="text-5xl tracking-[-0.055em] sm:text-7xl">{title.slice(0, Math.ceil(title.length / 2))}<span className="text-[#3f3f46]">{title.slice(Math.ceil(title.length / 2))}</span></h1>
      {children && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{children}</p>}
    </motion.header>
  );
}

export function Eyebrow({ n, children }: { n?: string; children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="bars-divider mt-14" />
      <h2 className="mt-4 mb-5 flex items-center gap-3 font-mono text-[12px] !font-medium tracking-[0.02em] text-muted-foreground">
        <span className="text-foreground">$</span>
        {n && <span className="text-foreground">{n}</span>}
        {children}
        <span className="h-px flex-1 bg-white/[0.08]" />
      </h2>
    </>
  );
}

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
