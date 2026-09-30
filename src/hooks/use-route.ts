import { useEffect, useState } from 'react';

export const PAGES = ['home', 'music', 'projects', 'skills', 'links', 'contact'] as const;
export type Page = (typeof PAGES)[number];

const read = (): Page => {
  const h = location.hash.slice(1) as Page;
  return PAGES.includes(h) ? h : 'home';
};

export function useRoute() {
  const [page, setPage] = useState<Page>(read);
  useEffect(() => {
    const on = () => { setPage(read()); window.scrollTo({ top: 0 }); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  useEffect(() => { document.title = page === 'home' ? 'convict' : `convict / ${page}`; }, [page]);
  return page;
}
