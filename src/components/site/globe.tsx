import { useEffect, useRef } from 'react';

type V = [number, number, number];
type Arc = { a: V; b: V; w: number; t: number; speed: number };

const LAND = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json';
const HOME: [number, number] = [40.7, -74]; // new york
const CITIES: [number, number][] = [
  [51.5, -0.1], [35.7, 139.7], [50.1, 8.7], [1.35, 103.8], [-23.5, -46.6], [34, -118.2], [-33.9, 151.2],
  [19, 72.8], [52.4, 4.9], [37.6, 127], [-26.2, 28], [43.7, -79.4], [25.2, 55.3], [55.8, 37.6], [-34.6, -58.4],
];

const vec = (lat: number, lon: number): V => {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};
const slerp = (a: V, b: V, w: number, t: number): V => {
  const s = Math.sin(w), p = Math.sin((1 - t) * w) / s, q = Math.sin(t * w) / s;
  return [a[0] * p + b[0] * q, a[1] * p + b[1] * q, a[2] * p + b[2] * q];
};

// topojson -> land mask (equirectangular, 2px per degree)
async function landMask() {
  const topo = await fetch(LAND).then(r => r.json());
  const { scale: [kx, ky], translate: [dx, dy] } = topo.transform;
  const arcs: [number, number][][] = topo.arcs.map((arc: number[][]) => {
    let x = 0, y = 0;
    return arc.map(([ax, ay]) => { x += ax; y += ay; return [x * kx + dx, y * ky + dy] as [number, number]; });
  });
  const c = document.createElement('canvas');
  c.width = 720; c.height = 360;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.beginPath();
  for (const g of topo.objects.land.geometries) {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
    for (const poly of polys) for (const ring of poly) {
      ring.forEach((i: number, n: number) => {
        const pts = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
        pts.forEach(([lon, lat], k) => {
          const x = (lon + 180) * 2, y = (90 - lat) * 2;
          n === 0 && k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
      });
      ctx.closePath();
    }
  }
  ctx.fill('evenodd');
  const px = ctx.getImageData(0, 0, 720, 360).data;
  return (lat: number, lon: number) => px[(((90 - lat) * 2) | 0) * 720 * 4 + (((lon + 180) * 2) | 0) * 4 + 3] > 0;
}

export function Globe({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!, ctx = c.getContext('2d')!;
    let w = 0, h = 0, raf = 0, alive = true, last = 0, lastSpawn = 0;
    let yaw = 1.2, tYaw = 0, pitch = 0.35, tPitch = 0.35;
    let rgb = [255, 106, 43];
    let dots: V[] = [];
    let arcs: Arc[] = [];
    const pings: { v: V; t: number }[] = [];

    // fibonacci sphere, filtered to land once the map loads
    const sphere = (keep: (lat: number, lon: number) => boolean, n: number) => {
      const out: V[] = [], g = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), x = Math.cos(i * g) * r, z = Math.sin(i * g) * r;
        if (keep((Math.asin(y) * 180) / Math.PI, (Math.atan2(x, z) * 180) / Math.PI)) out.push([x, y, z]);
      }
      return out;
    };
    dots = sphere(() => true, 1400);
    landMask().then(isLand => { if (alive) dots = sphere(isLand, 9000); }).catch(() => {});

    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const readGlow = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--glow').trim().split(/\s+/).map(Number);
      if (v.length === 3 && v.every(n => !isNaN(n))) rgb = v;
    };
    const spawn = () => {
      const pick = () => CITIES[(Math.random() * CITIES.length) | 0];
      const from = Math.random() < 0.5 ? HOME : pick();
      let to = pick();
      while (to === from) to = pick();
      const a = vec(...from), b = vec(...to);
      const w = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      arcs.push({ a, b, w, t: 0, speed: 0.35 + Math.random() * 0.25 });
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const [r, g, b] = rgb;
      const R = Math.min(w, h) * (w < 768 ? 0.46 : 0.42);
      const cx = w < 768 ? w / 2 : w * 0.7, cy = h * 0.55;

      tYaw += dt * 0.08;
      yaw += (tYaw - yaw) * 0.05;
      pitch += (tPitch - pitch) * 0.05;
      const cy_ = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const rot = ([x, y, z]: V): V => {
        const x1 = x * cy_ + z * sy, z1 = -x * sy + z * cy_;
        return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
      };
      const proj = (v: V) => [cx + v[0] * R, cy - v[1] * R] as const;

      ctx.clearRect(0, 0, w, h);

      // atmosphere
      const atm = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.35);
      atm.addColorStop(0, `rgba(${r},${g},${b},0.14)`);
      atm.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = atm;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, 'rgba(30,30,34,0.92)');
      body.addColorStop(1, 'rgba(5,5,5,0.92)');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots, lit from the top left
      for (const d of dots) {
        const v = rot(d);
        if (v[2] < 0) continue;
        const light = Math.max(0, -v[0] * 0.45 + v[1] * 0.45 + v[2] * 0.75);
        const [x, y] = proj(v), s = 0.9 + v[2] * 1.1;
        ctx.fillStyle = `rgba(255,255,255,${0.08 + light * 0.55})`;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }

      // arcs
      if (now - lastSpawn > 900 && arcs.length < 10) { spawn(); lastSpawn = now; }
      ctx.lineCap = 'round';
      arcs = arcs.filter(arc => {
        arc.t += dt * arc.speed;
        const head = Math.min(1, arc.t), tail = Math.max(0, arc.t - 0.45);
        if (tail >= 1) return false;
        if (arc.t >= 1 && arc.t - dt * arc.speed < 1) pings.push({ v: arc.b, t: 0 });
        const lift = 0.12 + arc.w * 0.12;
        const at = (t: number) => { const p = slerp(arc.a, arc.b, arc.w, t), k = 1 + lift * Math.sin(Math.PI * t); return rot([p[0] * k, p[1] * k, p[2] * k]); };
        const steps = 36;
        let prev = at(tail);
        for (let i = 1; i <= steps; i++) {
          const t = tail + ((head - tail) * i) / steps, v = at(t);
          if (v[2] > -0.15 && prev[2] > -0.15) {
            const f = i / steps;
            ctx.strokeStyle = `rgba(${r},${g},${b},${f * 0.9})`;
            ctx.lineWidth = 0.6 + f * 1.6;
            ctx.beginPath(); ctx.moveTo(...proj(prev)); ctx.lineTo(...proj(v)); ctx.stroke();
          }
          prev = v;
        }
        if (arc.t < 1 && prev[2] > -0.15) {
          const [x, y] = proj(prev);
          ctx.fillStyle = `rgba(255,255,255,0.95)`;
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
        return true;
      });

      // landing pings + home
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.t += dt;
        if (p.t > 1.4) { pings.splice(i, 1); continue; }
        const v = rot(p.v);
        if (v[2] < 0) continue;
        const [x, y] = proj(v);
        ctx.strokeStyle = `rgba(${r},${g},${b},${1 - p.t / 1.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 2 + p.t * 16, 0, Math.PI * 2); ctx.stroke();
      }
      const home = rot(vec(...HOME));
      if (home[2] > 0) {
        const [x, y] = proj(home);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.5 + Math.sin(now / 400) * 0.3})`;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    // cursor tilts and nudges the spin
    const move = (e: PointerEvent) => {
      tPitch = 0.35 + (e.clientY / h - 0.5) * 0.5;
      tYaw += (e.movementX || 0) * 0.002;
    };
    const glowTimer = setInterval(readGlow, 1000);
    size(); readGlow();
    addEventListener('resize', size);
    addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      alive = false;
      cancelAnimationFrame(raf); clearInterval(glowTimer);
      removeEventListener('resize', size); removeEventListener('pointermove', move);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
