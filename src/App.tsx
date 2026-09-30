import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { DOMAIN, EMAIL, GITHUB, NAME, TELEGRAM } from '@/config';
import { PAGES, useRoute, type Page } from '@/hooks/use-route';
import { Background } from '@/components/site/background';
import { CommandMenu } from '@/components/site/command-menu';
import { Cursor } from '@/components/site/cursor';
import { Splash } from '@/components/site/splash';
import { StatusDock } from '@/components/site/status-dock';
import { Navbar1 } from '@/components/block/playground-navbar';
import { ClickSpark } from '@/components/block/click-spark';
import Footer from '@/components/block/footer';
import { Kbd } from '@/components/ui/kbd';
import { Toaster } from '@/components/ui/sonner';
import { Home } from '@/pages/home';
import { Music } from '@/pages/music';
import { Projects } from '@/pages/projects';
import { Skills } from '@/pages/skills';
import { Links } from '@/pages/links';
import { Contact } from '@/pages/contact';

const VIEWS: Record<Page, () => React.ReactNode> = { home: Home, music: Music, projects: Projects, skills: Skills, links: Links, contact: Contact };
const NAV = PAGES.map((p, i) => ({ name: p, href: '#' + p, n: String(i + 1).padStart(2, '0') }));
const MOD = /mac|iphone|ipad/i.test(navigator.userAgent) ? '⌘' : 'ctrl';

export default function App() {
  const page = useRoute();
  const View = VIEWS[page];
  const [menu, setMenu] = useState(false);
  const [entered, setEntered] = useState(() => { try { return !!sessionStorage.getItem('entered'); } catch { return false; } });
  const enter = () => { setEntered(true); try { sessionStorage.setItem('entered', '1'); } catch {} };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setMenu(v => !v); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea/i.test((e.target as Element).tagName) || menu) return;
      if (e.key === '/') { e.preventDefault(); setMenu(true); return; }
      const p = PAGES[+e.key - 1];
      if (p) location.hash = p;
    };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [menu]);

  return (
    <>
      <Background />
      <Cursor />
      <ClickSpark sparkColor="#ffffff" sparkRadius={22} sparkCount={10} />

      <Navbar1
        items={NAV}
        active={page}
        logo={
          <span className="flex items-center gap-2.5 font-mono text-[13px] text-muted-foreground">
            <span className="size-2.5 rounded-[3px] bg-glow transition-colors duration-1000" />
            <b className="font-medium text-foreground">{NAME}</b>@{DOMAIN}
          </span>
        }
        right={
          <button onClick={() => setMenu(true)} className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pr-1 pl-3 text-xs text-muted-foreground transition hover:text-foreground">
            <Search className="size-3.5" />menu<Kbd>{MOD} K</Kbd>
          </button>
        }
      />

      <main className="mx-auto min-h-screen max-w-5xl px-5 pt-32 pb-32 sm:pt-40">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <View />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer
        badge={DOMAIN}
        blurb={<>need something made?<br />commissions are free rn.</>}
        columns={[
          { title: 'pages', links: PAGES.map(p => ({ label: p, href: '#' + p })) },
          { title: 'elsewhere', links: [
            { label: 'github', href: `https://github.com/${GITHUB}`, external: true },
            { label: 'telegram', href: `https://t.me/${TELEGRAM}`, external: true },
            { label: 'email', href: `mailto:${EMAIL}` },
          ] },
        ]}
        wordmark={NAME}
        credit={<>© {new Date().getFullYear()} {NAME} · press {MOD} K for the menu</>}
      />

      <StatusDock />
      <CommandMenu open={menu} onOpenChange={setMenu} />
      <Toaster position="top-center" />
      <AnimatePresence>{!entered && <Splash onEnter={enter} />}</AnimatePresence>
    </>
  );
}
