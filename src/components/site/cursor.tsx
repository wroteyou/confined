import { useEffect, useRef } from 'react';

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, rx = -100, ry = -100, big = 0, bigT = 0, press = 0, raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      bigT = (e.target as Element).closest?.('a,button,[role=tab],[role=option],input,label') ? 1 : 0;
    };
    // scale in the same transform, a separate scale() animates from the wrong origin
    const down = () => { press = 1; };
    const tick = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; big += (bigT - big) * 0.2; press *= 0.85;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) {
        ring.current.style.transform = `translate(${rx}px,${ry}px) scale(${(1 + big * 0.9) * (1 - press * 0.25)})`;
        ring.current.style.opacity = String(0.5 + big * 0.5);
      }
      raf = requestAnimationFrame(tick);
    };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', down);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      removeEventListener('pointermove', move);
      removeEventListener('pointerdown', down);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[10000] hidden [@media(pointer:fine)]:block">
      <div ref={ring} className="absolute -top-4 -left-4 size-8 rounded-full border border-glow/70 transition-[border-color] duration-1000 will-change-transform" />
      <div ref={dot} className="absolute -top-[3px] -left-[3px] size-1.5 rounded-full bg-glow will-change-transform" />
    </div>
  );
}
