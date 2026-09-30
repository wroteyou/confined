import { cn } from '@/lib/utils';

export function Spot({ className, children, as: Tag = 'div', ...props }: { as?: 'div' | 'a' | 'button' } & React.HTMLAttributes<HTMLElement> & { href?: string; target?: string; rel?: string }) {
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag onPointerMove={move} className={cn('spot rounded-2xl', className)} {...(props as any)}>
      {children}
    </Tag>
  );
}
