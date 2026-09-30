import { useEffect, useState } from 'react';

const CHARS = '!<>-_\\/[]{}=+*^?#01';

export function Scramble({ text, speed = 30, delay = 0, className }: { text: string; speed?: number; delay?: number; className?: string }) {
  const [out, setOut] = useState(text.replace(/\S/g, ' '));
  useEffect(() => {
    let frame = 0, id = 0;
    const start = setTimeout(() => {
      id = window.setInterval(() => {
        frame++;
        const done = frame / 3; // chars locked in so far
        setOut(text.split('').map((c, i) => (c === ' ' || i < done ? c : CHARS[(Math.random() * CHARS.length) | 0])).join(''));
        if (done >= text.length) clearInterval(id);
      }, speed);
    }, delay);
    return () => { clearTimeout(start); clearInterval(id); };
  }, [text, speed, delay]);
  return <span className={className} aria-label={text}><span aria-hidden>{out}</span></span>;
}
