import { STACK } from '@/config';
import { Eyebrow, PageHeader } from '@/components/site/section';
import { Icon } from '@/components/site/icon';
import { Spot } from '@/components/site/spot';

const all = Object.values(STACK).flat();

function Strip({ items, rev }: { items: [string, string, string?][]; rev?: boolean }) {
  return (
    <div className="marquee-wrap overflow-hidden [mask:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className={`marquee gap-3 py-1.5 ${rev ? 'rev' : ''}`} style={{ '--dur': '55s' } as React.CSSProperties}>
        {[...items, ...items].map(([name, icon], i) => (
          <span key={i} aria-hidden={i >= items.length} className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-glow">
            <Icon name={icon} />{name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const half = Math.ceil(all.length / 2);
  return (
    <>
      <PageHeader n="04" eyebrow="tech stack" title="skills">what i use.</PageHeader>

      <div className="-mx-5 space-y-2 sm:mx-0">
        <Strip items={all.slice(0, half)} />
        <Strip items={all.slice(half)} rev />
      </div>

      {Object.entries(STACK).map(([group, items], g) => (
        <section key={group}>
          <Eyebrow n={String(g + 1).padStart(2, '0')}>{group}<span className="text-muted-foreground/50">{items.length}</span></Eyebrow>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {items.map(([name, icon, tag]) => (
              <Spot key={name} className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground">
                <Icon name={icon} className="size-[18px] transition-colors group-hover:text-glow" />{name}
                {tag && <span className="ml-auto rounded-md bg-glow/15 px-1.5 py-0.5 font-mono text-[10px] text-glow">{tag}</span>}
              </Spot>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
