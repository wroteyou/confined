// from obsidianui
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

type NavItem = { name: string; href: string; n?: string };

export const Navbar1 = ({
  items,
  active,
  logo,
  right,
}: {
  items: NavItem[];
  active: string;
  logo: React.ReactNode;
  right?: React.ReactNode;
}) => {
  const { scrollY } = useScroll();
  const [isDown, setisDown] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) =>
    latest > 20 ? setisDown(true) : setisDown(false)
  );
  return (
    <motion.div
      animate={{ y: isDown ? 8 : 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="glass fixed top-3 inset-x-3 mx-auto max-w-5xl rounded-full z-50 flex h-14 items-center justify-between gap-3 px-3 sm:px-5"
    >
      <a href="#home" aria-label="home" className="hidden shrink-0 sm:block">{logo}</a>

      <nav aria-label="pages" className="flex min-w-0 gap-0.5 overflow-x-auto [scrollbar-width:none]">
        {items.map((item) => {
          const on = item.href === "#" + active;
          return (
            <a key={item.href} href={item.href} aria-current={on ? "page" : undefined} className="relative shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:text-[13px]">
              {on && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-glow/15 ring-1 ring-inset ring-glow/30"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className={`relative inline-flex items-baseline gap-1.5 transition-colors ${on ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {item.n && <span className={`hidden font-mono text-[10px] md:inline ${on ? "text-glow" : "opacity-50"}`}>{item.n}</span>}
                {item.name}
              </span>
            </a>
          );
        })}
      </nav>

      {right && <div className="hidden shrink-0 md:block">{right}</div>}
    </motion.div>
  );
};
