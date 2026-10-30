import { useEffect, useRef } from 'react';

const RAMP = ' .:-=+*cofinde#%@';
const CW = 10, CH = 18, FONT = 14; // cell size / glyph size
const LENS = 120;
const LEVELS = 48; // alpha buckets, so fillStyle changes ~48x per frame instead of per glyph

export function AsciiField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!, ctx = c.getContext('2d')!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, cols = 0, rows = 0, raf = 0, lastDust = -1e9, dust: [number, number, string][] = [];
    const m = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, lens: 0, on: false };
    const buckets: number[][] = Array.from({ length: LEVELS + 1 }, () => []);
    const glyphBuckets: string[][] = Array.from({ length: LEVELS + 1 }, () => []);

    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CW); rows = Math.ceil(h / CH);
      if (still) draw(0);
    };

    // luminance 0..1 at normalized (u, v): a few drifting blobs + a ripple, no allocations
    const field = (u: number, v: number, t: number) => {
      let l = 0;
      for (let i = 0; i < 4; i++) {
        const bx = 0.5 + 0.38 * Math.sin(t * (0.11 + i * 0.043) + i * 1.9);
        const by = 0.5 + 0.34 * Math.cos(t * (0.09 + i * 0.051) + i * 2.7);
        const dx = u - bx, dy = (v - by) * 0.6, r = 0.05 + i * 0.012;
        l += r / (r + dx * dx + dy * dy) * 0.22;
      }
      return Math.min(1, l * (0.8 + 0.2 * Math.sin(u * 9 + v * 7 + t * 0.6)));
    };

    const draw = (now: number) => {
      const t = still ? 12 : now / 1000;
      m.x += (m.tx - m.x) * 0.14; m.y += (m.ty - m.y) * 0.14;
      m.lens += ((m.on ? 1 : 0) - m.lens) * 0.12;
      const mu = m.x / w, mv = m.y / h;

      ctx.clearRect(0, 0, w, h);

      // faint perspective floor (m19), bottom third
      const fy = h * 0.72;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i <= 10; i++) {
        const k = Math.pow(i / 10, 2.2), y = fy + (h - fy) * k;
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      for (let i = -12; i <= 12; i++) {
        const x0 = w / 2 + i * (w / 24) * 0.25, x1 = w / 2 + i * (w / 24) * 1.6;
        ctx.moveTo(x0, fy); ctx.lineTo(x1, h);
      }
      ctx.stroke();

      // ascii cells
      for (const b of buckets) b.length = 0;
      for (const g of glyphBuckets) g.length = 0;
      const lensOn = m.lens > 0.01;
      for (let r = 0; r < rows; r++) {
        const y = r * CH + CH / 2, v = y / h;
        for (let cI = 0; cI < cols; cI++) {
          const x = cI * CW + CW / 2;
          let l = field(x / w, v, t);
          // soft pointer blob
          const pdx = (x / w - mu) * 1.6, pdy = v - mv;
          l += 0.5 / (1 + (pdx * pdx + pdy * pdy) * 400) * Math.min(1, m.lens + 0.3) * (m.x > -1e3 ? 1 : 0);
          let boost = 0;
          if (lensOn) {
            const dx = x - m.x, dy = y - m.y, d2 = dx * dx + dy * dy;
            if (d2 < LENS * LENS) { boost = (1 - Math.sqrt(d2) / LENS) * m.lens; l = l * (1 + boost * 1.2) + boost * 0.25; }
          }
          const gi = Math.min(RAMP.length - 1, (l * (RAMP.length - 1)) | 0);
          if (!gi) continue;
          const a = Math.min(0.9, 0.03 + (gi / (RAMP.length - 1)) * 0.2 + boost * 0.5);
          const k = Math.round((a / 0.9) * LEVELS);
          buckets[k].push(x, y);
          glyphBuckets[k].push(RAMP[gi]);
        }
      }
      ctx.font = `${FONT}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let k = 1; k <= LEVELS; k++) {
        const b = buckets[k];
        if (!b.length) continue;
        ctx.fillStyle = `rgba(255,255,255,${(k / LEVELS) * 0.9})`;
        const gl = glyphBuckets[k];
        for (let i = 0; i < gl.length; i++) ctx.fillText(gl[i], b[i * 2], b[i * 2 + 1]);
      }

      // shimmering dust, re-rolled every ~125ms
      if (now - lastDust > 125) {
        lastDust = now;
        dust = [];
        const n = (cols * rows * 0.007) | 0;
        for (let i = 0; i < n; i++) dust.push([(Math.random() * cols | 0) * CW + CW / 2, (Math.random() * rows | 0) * CH + CH / 2, '.:+*'[(Math.random() * 4) | 0]]);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      for (const [x, y, g] of dust) ctx.fillText(g, x, y);

      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const kick = () => { cancelAnimationFrame(raf); if (!still) raf = requestAnimationFrame(draw); };
    const move = (e: PointerEvent) => {
      if (m.x < -1e3) { m.x = e.clientX; m.y = e.clientY; }
      m.tx = e.clientX; m.ty = e.clientY; m.on = true;
      if (still) draw(0);
    };
    const leave = () => { m.on = false; };

    size();
    kick();
    addEventListener('resize', size);
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', kick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', size); removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', kick);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
