import { motion } from 'motion/react';

const ease = [0.2, 0.8, 0.2, 1] as const;

export function PageHeader({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mb-12">
      <p className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        <span className="text-glow transition-colors duration-1000">{n}</span>
        {eyebrow}
        <span className="h-px flex-1 bg-white/[0.07]" />
      </p>
      <h1 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{title}</h1>
      {children && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{children}</p>}
    </motion.header>
  );
}

export function Eyebrow({ n, children }: { n?: string; children: React.ReactNode }) {
  return (
    <h2 className="mt-14 mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
      {n && <span className="text-glow">{n}</span>}
      {children}
      <span className="h-px flex-1 bg-white/[0.06]" />
    </h2>
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
