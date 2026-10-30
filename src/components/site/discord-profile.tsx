import { useEffect, useState } from 'react';
import { Gamepad2, Headphones, MessageCircle, Square, Play } from 'lucide-react';
import { dstnProfile, type Activity, type DstnProfile, type Presence } from '@/lib/api';
import { assetUrl, avatarUrl, FLAG_LABELS, elapsed, STATUS_COLOR, STATUS_TEXT, VERB } from '@/lib/discord';
import { TAGLINE } from '@/config';
import { useNowPlaying } from '@/context/now-playing';
import { useNow } from '@/hooks/use-now';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@/components/site/icon';
import { LyricLine } from '@/components/site/lyric-line';
import { CopyButton } from '@/components/site/copy-button';

// discord ids are snowflakes, the top bits are ms since 2015-01-01
const since = (id: string) => new Date(Number((BigInt(id) >> 22n) + 1420070400000n)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function Bar({ start, end }: { start?: number; end?: number }) {
  const now = useNow(1000);
  if (start && end) {
    return (
      <div className="mt-3">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear" style={{ width: Math.min(1, (now - start) / (end - start)) * 100 + '%' }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground"><span>{elapsed(now - start)}</span><span>{elapsed(end - start)}</span></div>
      </div>
    );
  }
  return start ? <p className="mt-1 font-mono text-[11px] text-muted-foreground">{elapsed(now - start)} elapsed</p> : null;
}

const Label = ({ children }: { children: React.ReactNode }) => <p className="mb-1.5 text-[13px] font-semibold">{children}</p>;
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl bg-white/[0.035] p-3.5 ring-1 ring-white/[0.08]">
    <p className="mb-3 text-xs font-semibold">{title}</p>
    {children}
  </div>
);

function ActivityRow({ a }: { a: Activity }) {
  const big = assetUrl(a.application_id, a.assets?.large_image);
  const small = assetUrl(a.application_id, a.assets?.small_image);
  return (
    <Panel title={(VERB[a.type] ?? 'playing').replace(/^./, c => c.toUpperCase())}>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {big
            ? <img src={big} alt="" title={a.assets?.large_text} className="size-16 rounded-lg object-cover" />
            : <div className="grid size-16 place-items-center rounded-lg bg-white/[0.06] text-muted-foreground"><Gamepad2 className="size-6" /></div>}
          {small && <img src={small} alt="" title={a.assets?.small_text} className="absolute -right-1.5 -bottom-1.5 size-6 rounded-full border-[3px] border-[#0a0a0a]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.name}</p>
          {a.details && <p className="truncate text-sm text-muted-foreground">{a.details}</p>}
          {a.state && <p className="truncate text-sm text-muted-foreground">{a.state}</p>}
          <Bar start={a.timestamps?.start} />
        </div>
      </div>
    </Panel>
  );
}

// spotify is only linked to one account but show the song on both
function SongRow() {
  const { song, spotify, listening, toggleListen } = useNowPlaying();
  if (!song) return null;
  const onSpotify = song.url.includes('spotify.com');
  return (
    <Panel title="Listening">
      <div className="flex items-center gap-3">
        {song.art
          ? <img src={song.art} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
          : <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-white/[0.06]"><Headphones className="size-6" /></div>}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{song.name}</p>
          <p className="truncate text-sm text-muted-foreground">by {song.artist}</p>
          {spotify?.album && <p className="truncate text-sm text-muted-foreground">on {spotify.album}</p>}
        </div>
      </div>
      {spotify && <Bar start={spotify.timestamps.start} end={spotify.timestamps.end} />}
      <LyricLine className="mt-3 border-t border-white/[0.06] pt-3 text-[15px]" />
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" className="flex-1 rounded-lg bg-white/[0.06]" asChild>
          <a href={song.url} target="_blank" rel="noopener noreferrer"><Icon name={onSpotify ? 'spotify' : 'lastdotfm'} />{onSpotify ? 'Play on Spotify' : 'Open on Last.fm'}</a>
        </Button>
        <Button variant="secondary" className="rounded-lg" onClick={toggleListen} aria-pressed={listening}>
          {listening ? <><Square className="size-3.5" />stop</> : <><Play className="size-3.5" />listen along</>}
        </Button>
      </div>
      {listening && !spotify && <p className="mt-2 text-xs text-muted-foreground">no position from spotify, so it starts from the top</p>}
    </Panel>
  );
}

export function DiscordProfile({ presence }: { presence: Presence }) {
  const hasSong = !!useNowPlaying().song;
  const u = presence.discord_user, st = presence.discord_status;
  const [prof, setProf] = useState<DstnProfile | null>(null);
  const [decoBad, setDecoBad] = useState(false);
  useEffect(() => { dstnProfile(u.id).then(setProf); }, [u.id]);

  const guild = u.primary_guild?.identity_enabled && u.primary_guild.tag ? u.primary_guild : null;
  const custom = presence.activities.find(a => a.type === 4);
  const acts = presence.activities.filter(a => a.type !== 4 && a.name !== 'Spotify');
  const on = (['desktop', 'mobile', 'web'] as const).filter(k => presence[`active_on_discord_${k}`]);
  const live = st !== 'offline';

  const bio = prof?.user_profile?.bio || prof?.user?.bio;
  const pronouns = prof?.user_profile?.pronouns;
  const banner = prof?.user_profile?.banner || prof?.user?.banner;
  const accounts = prof?.connected_accounts ?? [];
  // lookup failed: fall back to the flags lanyard already sends, as text chips
  const badges = prof
    ? prof.badges.map(b => ({ key: b.id, label: b.description, src: `https://cdn.discordapp.com/badge-icons/${b.icon}.png`, href: b.link }))
    : FLAG_LABELS.filter(([bit]) => ((u.public_flags ?? 0) & bit) !== 0).map(([bit, label]) => ({ key: String(bit), label, src: '', href: undefined }));

  return (
    <div className="@container">
      <div className="grid @2xl:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-5 pb-5 @2xl:border-r @2xl:border-white/[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 18% 14%, rgba(255,255,255,0.09), transparent 55%)' }}>
          {banner && (
            <div className="h-24" style={{ background: `center / cover url(https://cdn.discordapp.com/banners/${u.id}/${banner}.${banner.startsWith('a_') ? 'gif' : 'png'}?size=600)` }} />
          )}
          <div className={banner ? '-mt-14 px-5' : 'px-5 pt-6'}>
            <div className="relative mb-3 size-20">
              <Avatar className="size-20">
                <AvatarImage src={avatarUrl(u)} alt="" />
                <AvatarFallback>{u.username[0]}</AvatarFallback>
              </Avatar>
              {u.avatar_decoration_data?.asset && !decoBad && (
                <img src={`https://cdn.discordapp.com/avatar-decoration-presets/${u.avatar_decoration_data.asset}.png?passthrough=true`} alt="" className="pointer-events-none absolute -inset-[12%] size-[124%] max-w-none" onError={() => setDecoBad(true)} />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute right-0 bottom-0 size-[22px] rounded-full border-4 border-[#0a0a0a]" style={{ background: STATUS_COLOR[st] }} />
                </TooltipTrigger>
                <TooltipContent>{STATUS_TEXT[st]}</TooltipContent>
              </Tooltip>
            </div>
            <p className="truncate text-xl font-bold tracking-tight">{u.global_name || u.username}</p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
              <span>{u.username}</span>
              {pronouns && <span>· {pronouns}</span>}
              {badges.map(b => (
                <Tooltip key={b.key}>
                  <TooltipTrigger asChild>
                    {b.src
                      ? <a href={b.href} target="_blank" rel="noopener noreferrer" className="grid shrink-0 place-items-center"><img src={b.src} alt={b.label} className="size-5" /></a>
                      : <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px]">{b.label}</span>}
                  </TooltipTrigger>
                  <TooltipContent>{b.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            {guild && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                {guild.badge && <img src={`https://cdn.discordapp.com/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=16`} alt="" className="size-3.5" />}
                {guild.tag}
              </p>
            )}
            {custom && (custom.state || custom.emoji) && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                {custom.emoji?.id
                  ? <img src={`https://cdn.discordapp.com/emojis/${custom.emoji.id}.${custom.emoji.animated ? 'gif' : 'png'}?size=32`} alt="" className="size-[18px]" />
                  : custom.emoji?.name}
                {custom.state}
              </p>
            )}
            {on.length > 0 && <div className="mt-2 flex gap-1.5">{on.map(k => <Badge key={k} variant="outline" className="rounded-md font-mono text-[10px]">{k}</Badge>)}</div>}
          </div>

          <div className="flex items-center gap-2 px-5">
            <Button variant="secondary" className="rounded-lg bg-white/[0.12]" asChild>
              <a href={`https://discord.com/users/${u.id}`} target="_blank" rel="noopener noreferrer"><MessageCircle />Message</a>
            </Button>
            <CopyButton text={u.username} variant="default" className="rounded-lg border border-white/10 bg-black text-white hover:bg-black/70">copy @</CopyButton>
          </div>

          <div className="px-5"><Label>About Me</Label><p className="whitespace-pre-line text-sm text-muted-foreground">{bio || TAGLINE.join(' · ')}</p></div>
          <div className="px-5"><Label>Member Since</Label><p className="text-sm text-muted-foreground">{since(u.id)}</p></div>
          {accounts.length > 0 && (
            <div className="px-5">
              <Label>Connections</Label>
              <ul className="space-y-1">
                {accounts.map(c => (
                  <li key={c.type + c.id} className="flex items-center gap-3 py-1 text-sm font-semibold">
                    <span className="grid size-8 place-items-center rounded-lg bg-white/[0.06]"><Icon name={c.type} /></span>
                    <span className="flex-1 truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.08] p-5 @2xl:border-t-0">
          <p className="w-fit border-b-2 border-white pb-2 text-sm font-semibold">Activity</p>
          <p className="mt-1 text-[13px] font-semibold">Current activity</p>
          {acts.map((a, i) => <ActivityRow key={a.name + i} a={a} />)}
          {live && <SongRow />}
          {(!live || (!acts.length && !hasSong)) && (
            <p className="rounded-xl bg-white/[0.035] p-4 text-sm text-muted-foreground ring-1 ring-white/[0.08]">nothing going on right now</p>
          )}
        </div>
      </div>
    </div>
  );
}
