import { useEffect, useState } from 'react';

export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function usePoll(fn: () => void, ms: number, deps: unknown[] = []) {
  useEffect(() => {
    fn();
    const id = setInterval(fn, ms);
    // background tabs get their timers throttled, so catch up when you come back
    const back = () => document.visibilityState === 'visible' && fn();
    document.addEventListener('visibilitychange', back);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', back); };
  }, deps);
}
