import { MY_TZ } from '@/config';
import { useNow } from '@/hooks/use-now';
import { Spot } from '@/components/site/spot';

const yourTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const clock = (tz: string, sec = false, now = Date.now()) =>
  new Date(now).toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', ...(sec && { second: '2-digit' }) });
const zone = (tz: string) => `${tz.split('/').pop()!.replace(/_/g, ' ').toLowerCase()} · ${new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')!.value}`;
// utc offset in hours, dst aware
const offset = (tz: string) => {
  const d = new Date(); d.setMilliseconds(0);
  return (new Date(d.toLocaleString('en-US', { timeZone: tz })).getTime() - new Date(d.toLocaleString('en-US', { timeZone: 'UTC' })).getTime()) / 36e5;
};
const dayHour = (tz: string, now: number) => {
  const [h, m] = new Date(now).toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).split(':').map(Number);
  return h + m / 60;
};

export const mood = (hour: number) =>
  hour < 8 ? "i'm probably asleep" : hour < 12 ? "it's morning for me" : hour < 18 ? "i'm probably around" : "it's evening for me";

function DayStrip({ label, tz, now, me }: { label: string; tz: string; now: number; me?: boolean }) {
  const h = dayHour(tz, now);
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
      <span className="w-8 shrink-0 uppercase tracking-widest">{label}</span>
      <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-white/[0.04] ring-1 ring-white/[0.06]">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_7px)]" />
        <div className="absolute inset-y-0 left-[91.6%] right-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_7px)]" />
        {[6, 12, 18].map(t => <span key={t} className="absolute inset-y-0 w-px bg-white/[0.08]" style={{ left: `${(t / 24) * 100}%` }} />)}
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-glow/25 transition-[width] duration-1000" style={{ width: `${(h / 24) * 100}%` }} />
        <span className={`absolute inset-y-0.5 w-[3px] -translate-x-1/2 rounded-full ${me ? 'bg-glow' : 'bg-white'}`} style={{ left: `${(h / 24) * 100}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right tabular-nums text-foreground">{clock(tz, false, now)}</span>
    </div>
  );
}

export function ClockCompare() {
  const now = useNow(1000);
  const diff = offset(yourTz) - offset(MY_TZ);

  return (
    <Spot className="overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-white/[0.07]">
        {[['my time', MY_TZ], ['your time', yourTz]].map(([label, tz]) => (
          <div key={label} className="p-5 sm:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-mono text-3xl font-medium tabular-nums tracking-tight sm:text-5xl">{clock(tz, true, now)}</p>
            <p className="mt-1.5 font-mono text-xs text-muted-foreground">{zone(tz)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-white/[0.07] px-5 py-4 sm:px-6">
        <DayStrip label="me" tz={MY_TZ} now={now} me />
        <DayStrip label="you" tz={yourTz} now={now} />
      </div>
      <p className="flex items-center gap-2.5 border-t border-white/[0.07] px-5 py-3 font-mono text-xs text-muted-foreground sm:px-6">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        {diff === 0 ? "we're in the same timezone" : <>you're <span className="text-glow">{+Math.abs(diff).toFixed(2)}h {diff > 0 ? 'ahead of' : 'behind'}</span> me</>}, {mood(dayHour(MY_TZ, now))}
      </p>
    </Spot>
  );
}
