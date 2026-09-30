
// last.fm (connect spotify at last.fm/settings/applications)
export const LASTFM_USER = 'x9pu';
export const LASTFM_KEY = import.meta.env.VITE_LASTFM_KEY ?? '';

// optional, falls back to piped
export const YT_KEY = import.meta.env.VITE_YT_KEY ?? '';

// both have to be in discord.gg/lanyard
export const DISCORDS = [
  { handle: 'asdfkhj', id: '244862352913072128', home: true },
  { handle: 'x__x__xx', id: '449694606725218306', home: false },
];

export const MY_TZ = 'America/New_York';
export const VIEWS_KEY = 'confined.wtf/views'; // abacus.jasoncameron.dev counter

export const NAME = 'convict';
export const DOMAIN = 'confined.wtf';
export const TAGLINE = ['cybersec', 'networking', 'compsci'];
export const TELEGRAM = 'funddeposit';
export const GITHUB = 'wroteyou';
export const EMAIL = 'convict@confined.wtf';

export const FACTS = [
  { label: 'focus', value: 'c++' },
  { label: 'stack', value: 'html · ts · css' },
];

export type Project = { name: string; year: string; description: string; tags: string[]; href: string; external?: boolean };
export const PROJECTS: Project[] = [
  { name: 'confined', year: '2026', description: 'this site. my biolink, and my projects in one place.', tags: ['react', 'tailwind', 'obsidianui', 'last.fm'], href: 'https://confined.wtf' },
  { name: 'wroteyou', year: 'github', description: "everything else i've put up", tags: ['github'], href: 'https://github.com/wroteyou', external: true },
];

// [name, simple-icons slug or full icon url, optional tag]
const VSCODE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-plain.svg';
const CACHY = 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/cachyos.svg';
export const STACK: Record<string, [string, string, string?][]> = {
  languages: [['HTML', 'html5'], ['TypeScript', 'typescript'], ['CSS', 'css3'], ['C++', 'cplusplus', 'learning'], ['JavaScript', 'javascript'], ['Python', 'python'], ['Lua', 'lua'], ['Markdown', 'markdown']],
  'frameworks & libs': [['Next.js', 'nextdotjs'], ['React', 'react'], ['Tailwind', 'tailwindcss'], ['Vite', 'vite'], ['Node.js', 'nodedotjs'], ['Motion', 'framer'], ['Three.js', 'threedotjs']],
  'tools & platforms': [['Git', 'git'], ['GitHub', 'github'], ['VS Code', VSCODE], ['Roblox Studio', 'robloxstudio']],
  datastores: [['PostgreSQL', 'postgresql'], ['MongoDB', 'mongodb'], ['SQLite', 'sqlite']],
  devops: [['Docker', 'docker'], ['Vercel', 'vercel'], ['Cloudflare', 'cloudflare']],
  "distros i've used": [['CachyOS', CACHY, 'current'], ['Arch', 'archlinux'], ['Tumbleweed', 'opensuse'], ['Debian', 'debian'], ['Artix', 'artixlinux'],
    ['Fedora', 'fedora'], ['Ubuntu', 'ubuntu'], ['Mint', 'linuxmint'], ['Gentoo', 'gentoo'], ['Void', 'voidlinux'], ['Manjaro', 'manjaro']],
};
