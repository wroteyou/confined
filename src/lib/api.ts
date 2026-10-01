import { LASTFM_KEY, LASTFM_USER, VIEWS_KEY, YT_KEY } from '@/config';

const getJSON = <T = any>(url: string, timeout = 8000): Promise<T> =>
  fetch(url, { signal: AbortSignal.timeout(timeout) }).then(r => (r.ok ? r.json() : Promise.reject(r.status)));

// last.fm
export const lastfm = <T = any>(method: string, extra = '') =>
  getJSON<T>(`https://ws.audioscrobbler.com/2.0/?method=${method}&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json${extra}`);
export const cover = (imgs?: { '#text': string }[]) => imgs?.at(-1)?.['#text'] || '';

const duration = (artist: string, track: string) =>
  lastfm('track.getinfo', `&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`).then(d => +d.track?.duration || 0, () => 0);

// for when discord isn't reporting spotify. last.fm stamps scrobbles with when the track
// started, so the current one started when the previous one ended
// `seenAt` is when this tab saw the song change, used if the previous track got skipped
export async function estimateTiming(name: string, artist: string, seenAt: number | null) {
  const [cur, prev] = (await lastfm('user.getrecenttracks', '&limit=2')).recenttracks.track;
  if (cur?.['@attr']?.nowplaying !== 'true' || cur.name !== name) return null;
  const [prevLen, len] = await Promise.all([prev?.date ? duration(prev.artist['#text'], prev.name) : 0, duration(artist, name)]);
  if (!len) return null;
  const ok = (start: number) => Date.now() - start > -5000 && Date.now() - start < len;
  const start = prev?.date && prevLen ? +prev.date.uts * 1000 + prevLen : NaN;
  if (ok(start)) return { start, end: start + len };
  return seenAt && ok(seenAt) ? { start: seenAt, end: seenAt + len } : null;
}

// lanyard
export const lanyard = (id: string) =>
  getJSON<{ success: boolean; data: Presence }>(`https://api.lanyard.rest/v1/users/${id}`).then(j => (j.success ? j.data : null)).catch(() => null);

export type Activity = {
  type: number; name: string; details?: string; state?: string; application_id?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string };
  timestamps?: { start?: number; end?: number };
};
export type Spotify = { track_id: string; song: string; artist: string; album: string; album_art_url: string; timestamps: { start: number; end: number }; estimated?: boolean };
export type Presence = {
  discord_user: {
    id: string; username: string; global_name?: string; avatar?: string;
    avatar_decoration_data?: { asset: string } | null;
    primary_guild?: { tag?: string; badge?: string; identity_guild_id?: string; identity_enabled?: boolean } | null;
  };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: Activity[];
  listening_to_spotify: boolean;
  spotify: Spotify | null;
  active_on_discord_desktop?: boolean; active_on_discord_mobile?: boolean; active_on_discord_web?: boolean;
};

// views
// unique: each browser only bumps it once, after that it just reads
export async function hitViews() {
  let seen = false;
  try { seen = !!localStorage.getItem('counted'); } catch {}
  const { value } = await getJSON<{ value: number }>(`https://abacus.jasoncameron.dev/${seen ? 'get' : 'hit'}/${VIEWS_KEY}`);
  try { localStorage.setItem('counted', '1'); } catch {}
  return value;
}

// youtube search, cached in localstorage
const PIPED = ['https://api.piped.private.coffee', 'https://pipedapi.kavin.rocks'];
export async function findVideo(q: string): Promise<string | null> {
  const key = 'yt:' + q.toLowerCase();
  try { const c = localStorage.getItem(key); if (c) return c; } catch {}
  let id: string | null = null;
  if (YT_KEY) {
    try {
      const d = await getJSON(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&videoEmbeddable=true&maxResults=1&q=${encodeURIComponent(q)}&key=${YT_KEY}`);
      id = d.items?.[0]?.id?.videoId ?? null;
    } catch {}
  }
  for (const api of PIPED) {
    if (id) break;
    try {
      const d = await getJSON(`${api}/search?q=${encodeURIComponent(q)}&filter=videos`, 6000);
      id = d.items?.find((v: any) => v.type === 'stream')?.url?.split('v=')[1] ?? null;
    } catch {}
  }
  try { if (id) localStorage.setItem(key, id); } catch {}
  return id;
}

// lrclib
export type LyricLine = { t: number; text: string };
export type Lyrics = { lines: LyricLine[] | null; instrumental: boolean };
export const cleanTitle = (s: string) =>
  s.replace(/\s*[-–]\s*(\d{4}\s*)?(remaster|live|mono|stereo|version|edit|mix).*$/i, '').replace(/\s*[([](feat|with|ft)\.?[^)\]]*[)\]]/i, '').trim();
export async function fetchLyrics(track: string, artist: string): Promise<Lyrics | null> {
  let d: any = null;
  for (const [t, a] of [[track, artist], [cleanTitle(track), artist.split(/[,&]/)[0].trim()]]) {
    try { d = await getJSON(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}`); break; } catch {}
  }
  if (!d) try { d = (await getJSON<any[]>(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle(track) + ' ' + artist)}`))[0]; } catch {}
  if (!d) return null;
  const lines = d.syncedLyrics
    ? (d.syncedLyrics as string).split('\n').map(l => l.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s?(.*)$/)).filter(Boolean)
        .map(m => ({ t: (+m![1] * 60 + +m![2]) * 1000, text: m![3] }))
    : null;
  return { lines, instrumental: !!d.instrumental };
}
