import React from 'react';
// from obsidianui

type Column = { title: string; links: { label: string; href: string; external?: boolean }[] };

const Footer: React.FC<{ columns: Column[]; wordmark: string; blurb: React.ReactNode; badge: string; credit: React.ReactNode }> = ({ columns, wordmark, blurb, badge, credit }) => {
  return (
    <footer className="relative text-white w-full min-h-[520px] flex flex-col overflow-hidden pt-20 px-6 md:px-12 lg:px-24 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-black">
      <div className="flex flex-col lg:flex-row justify-between w-full h-full pb-20 z-10 relative gap-12">

        <div className="flex flex-col max-w-xl">
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.06] text-zinc-400 text-[10px] font-medium tracking-[0.2em] uppercase">
              {badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.05] tracking-tight">
            {blurb}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col space-y-6">
              <h3 className="text-zinc-500 text-[11px] font-medium tracking-[0.2em] uppercase">{col.title}</h3>
              <ul className="flex flex-col space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}><FooterLink href={l.href} external={l.external}>{l.label}</FooterLink></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none flex justify-center overflow-hidden">
        <h1 className="text-[22vw] font-serif leading-none translate-y-[18%] tracking-tighter whitespace-nowrap wordmark-gradient">
          {wordmark}
        </h1>
      </div>

      <div className="mt-auto pb-8 z-10 text-center w-full relative">
        <p className="text-[10px] tracking-[0.2em] text-zinc-600 font-medium uppercase">{credit}</p>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, external, children }) => {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-zinc-300 hover:text-white text-sm tracking-wide transition-colors duration-200 ease-in-out block"
    >
      {children}
    </a>
  );
};

export default Footer;
