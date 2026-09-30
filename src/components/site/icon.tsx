import { icon } from '@/lib/discord';
import { cn } from '@/lib/utils';

export function Icon({ name, className }: { name: string; className?: string }) {
  return <span aria-hidden className={cn('si size-4', className)} style={{ '--i': `url(${icon(name)})` } as React.CSSProperties} />;
}
