import type { Presence } from '@/lib/api';

export const avatarUrl = (u: Presence['discord_user']) =>
  u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=160`
    : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;

export const assetUrl = (appId: string | undefined, key?: string) =>
  !key ? '' :
  key.startsWith('mp:') ? `https://media.discordapp.net/${key.slice(3)}` :
  key.startsWith('spotify:') ? `https://i.scdn.co/image/${key.slice(8)}` :
  `https://cdn.discordapp.com/app-assets/${appId}/${key}.png`;

export const VERB: Record<number, string> = { 0: 'playing', 1: 'streaming', 2: 'listening to', 3: 'watching', 5: 'competing in' };
export const RANK = { online: 0, idle: 1, dnd: 2, offline: 3 } as const;
export const STATUS_COLOR = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' } as const;
export const STATUS_TEXT = { online: 'online', idle: 'idle', dnd: 'do not disturb', offline: 'offline' } as const;

export const elapsed = (ms: number) => {
  const s = Math.max(0, (ms / 1000) | 0), h = (s / 3600) | 0, m = ((s % 3600) / 60) | 0;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0');
};

export const icon = (s: string) => (s.startsWith('http') ? s : `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${s}.svg`);
