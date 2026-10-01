import { Gamepad2, Headphones, Square, Play } from 'lucide-react';
import type { Activity, Presence } from '@/lib/api';
import { assetUrl, avatarUrl, elapsed, STATUS_COLOR, STATUS_TEXT, VERB } from '@/lib/discord';
import { useNowPlaying } from '@/context/now-playing';
import { useNow } from '@/hooks/use-now';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LyricLine } from '@/components/site/lyric-line';
import { CopyButton } from '@/components/site/copy-button';
import { Spot } from '@/components/site/spot';

function Timer({ start, end }: { start?: number; end?: number }) {
  const now = useNow(1000);
  if (start && end) {
    const p = Math.min(1, (now - start) / (end - start));
    return (
      <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span>{elapsed(now - start)}</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[rgb(var(--glow))] transition-[width] duration-1000 ease-linear" style={{ width: p * 100 + '%' }} />
        </div>
        <span>{elapsed(end - start)}</span>
      </div>
    );
  }
  return start ? <p className="mt-1 font-mono text-[11px] text-muted-foreground">{elapsed(now - start)} elapsed</p> : null;
}

function ActivityRow({ a }: { a: Activity }) {
  const big = assetUrl(a.application_id, a.assets?.large_image);
  const small = assetUrl(a.application_id, a.assets?.small_image);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] p-3 ring-1 ring-white/[0.06]">
      <div className="relative shrink-0">
        {big
          ? <img src={big} alt="" title={a.assets?.large_text} className="size-14 rounded-lg object-cover" />
          : <div className="grid size-14 place-items-center rounded-lg bg-white/[0.06] text-muted-foreground"><Gamepad2 className="size-6" /></div>}
        {small && <img src={small} alt="" title={a.assets?.small_text} className="absolute -right-1.5 -bottom-1.5 size-6 rounded-full border-[3px] border-[#111113]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[rgb(var(--glow))]">{VERB[a.type] ?? 'playing'}</p>
        <p className="truncate font-semibold">{a.name}</p>
        {a.details && <p className="truncate text-sm text-muted-foreground">{a.details}</p>}
        {a.state && <p className="truncate text-sm text-muted-foreground">{a.state}</p>}
        <Timer start={a.timestamps?.start} />
      </div>
    </div>
  );
}

// spotify is only linked to one account but show the song on both
function SongRow() {
  const { song, spotify, listening, toggleListen } = useNowPlaying();
  if (!song) return null;
  return (
    <div className="rounded-xl bg-white/[0.035] p-3 ring-1 ring-white/[0.06]">
      <div className="flex items-center gap-3">
        {song.art
          ? <img src={song.art} alt="" className="size-14 shrink-0 rounded-lg object-cover " />
          : <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-white/[0.06]"><Headphones className="size-6" /></div>}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[rgb(var(--glow))]">
            <span className="eq"><i /><i /><i /></span>listening to{spotify && !spotify.estimated && ' spotify'}
          </p>
          <a href={song.url} target="_blank" rel="noopener noreferrer" className="block truncate font-semibold hover:underline">{song.name}</a>
          <p className="truncate text-sm text-muted-foreground">by {song.artist}{spotify?.album && ` · ${spotify.album}`}</p>
          {spotify && <Timer start={spotify.timestamps.start} end={spotify.timestamps.end} />}
        </div>
      </div>
      <LyricLine className="mt-3 border-t border-white/[0.06] pt-3 text-[15px]" />
      <Button variant="outline" size="sm" className="mt-3" onClick={toggleListen} aria-pressed={listening}>
        {listening ? <><Square className="size-3.5" />stop listening</> : <><Play className="size-3.5" />listen along</>}
      </Button>
      {listening && !spotify && <p className="mt-2 text-xs text-muted-foreground">no position from spotify, so it starts from the top</p>}
    </div>
  );
}

export function DiscordCard({ presence, handle }: { presence: Presence | null; handle: string }) {
  if (!presence) {
    return (
      <Spot className="flex items-center gap-4 p-5">
        <div className="size-16 animate-pulse rounded-full bg-white/[0.06]" />
        <div><p className="font-semibold">@{handle}</p><p className="text-sm text-muted-foreground">loading…</p></div>
      </Spot>
    );
  }
  const u = presence.discord_user, st = presence.discord_status;
  const guild = u.primary_guild?.identity_enabled && u.primary_guild.tag ? u.primary_guild : null;
  const custom = presence.activities.find(a => a.type === 4);
  const acts = presence.activities.filter(a => a.type !== 4 && a.name !== 'Spotify');
  const on = (['desktop', 'mobile', 'web'] as const).filter(k => presence[`active_on_discord_${k}`]);

  return (
    <Spot className="flex flex-col gap-4 overflow-hidden p-5">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar className="size-16">
            <AvatarImage src={avatarUrl(u)} alt="" />
            <AvatarFallback>{u.username[0]}</AvatarFallback>
          </Avatar>
          {u.avatar_decoration_data?.asset && (
            <img src={`https://cdn.discordapp.com/avatar-decoration-presets/${u.avatar_decoration_data.asset}.png?passthrough=true`} alt="" className="pointer-events-none absolute -inset-[12%] size-[124%] max-w-none" />
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="absolute -right-0.5 -bottom-0.5 size-[18px] rounded-full border-[3.5px] border-[#101012]" style={{ background: STATUS_COLOR[st] }} />
            </TooltipTrigger>
            <TooltipContent>{STATUS_TEXT[st]}</TooltipContent>
          </Tooltip>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="truncate">{u.global_name || u.username}</span>
            {guild && (
              <Badge variant="secondary" className="gap-1 rounded-md font-mono">
                {guild.badge && <img src={`https://cdn.discordapp.com/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=16`} alt="" className="size-3" />}
                {guild.tag}
              </Badge>
            )}
          </p>
          <p className="font-mono text-xs text-muted-foreground">@{u.username}{on.length > 0 && ` · ${on.join(', ')}`}</p>
        </div>
      </div>

      {custom && (custom.state || custom.emoji) && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {custom.emoji?.id
            ? <img src={`https://cdn.discordapp.com/emojis/${custom.emoji.id}.${custom.emoji.animated ? 'gif' : 'png'}?size=32`} alt="" className="size-[18px]" />
            : custom.emoji?.name}
          {custom.state}
        </p>
      )}

      {acts.map((a, i) => <ActivityRow key={a.name + i} a={a} />)}
      {st !== 'offline' && <SongRow />}

      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: STATUS_COLOR[st] }} />{STATUS_TEXT[st]}</span>
        <CopyButton text={u.username}>copy @</CopyButton>
      </div>
    </Spot>
  );
}

export const bestPresence = (ps: (Presence | null)[]) => {
  const order = { online: 0, idle: 1, dnd: 2, offline: 3 };
  return ps.filter((p): p is Presence => !!p).sort((a, b) => order[a.discord_status] - order[b.discord_status])[0] ?? null;
};
