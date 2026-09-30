import { ArrowUpRight, Copy } from 'lucide-react';
import { DISCORDS, DOMAIN, EMAIL, GITHUB, TELEGRAM } from '@/config';
import { PageHeader, Reveal } from '@/components/site/section';
import { copy } from '@/components/site/copy-button';
import { Icon } from '@/components/site/icon';
import { Spot } from '@/components/site/spot';

type L = { icon: string; name: string; sub: string; href?: string; copy?: string };
const LINKS: L[] = [
  { icon: 'github', name: 'github', sub: `github.com/${GITHUB}`, href: `https://github.com/${GITHUB}` },
  { icon: 'telegram', name: 'telegram', sub: `t.me/${TELEGRAM}`, href: `https://t.me/${TELEGRAM}` },
  { icon: 'https://cdn.jsdelivr.net/npm/lucide-static/icons/mail.svg', name: 'email', sub: EMAIL, href: `mailto:${EMAIL}` },
  ...DISCORDS.map(d => ({ icon: 'discord', name: 'discord', sub: `@${d.handle}`, copy: d.handle })),
  { icon: 'linktree', name: DOMAIN, sub: 'this site', href: `https://${DOMAIN}` },
];

export function Links() {
  return (
    <>
      <PageHeader n="05" eyebrow="links" title="links">where else you can find me.</PageHeader>
      <div className="space-y-2.5">
        {LINKS.map((l, i) => {
          const inner = (
            <>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.07] transition group-hover:bg-glow/15 group-hover:ring-glow/40">
                <Icon name={l.icon} className="size-5 transition-colors group-hover:text-glow" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-medium">{l.name}</span>
                <span className="block truncate font-mono text-xs text-muted-foreground">{l.sub}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {l.copy ? <>copy <Copy className="size-3.5" /></> : <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              </span>
            </>
          );
          const cls = 'group flex w-full items-center gap-4 p-3 pr-5 text-left transition-transform hover:translate-x-1';
          return (
            <Reveal key={l.sub} delay={i * 0.06}>
              {l.copy
                ? <Spot as="button" className={cls} onClick={() => copy(l.copy!, '@' + l.copy)}>{inner}</Spot>
                : <Spot as="a" className={cls} href={l.href} {...(l.href?.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}>{inner}</Spot>}
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
