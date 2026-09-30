type W = Window | null | undefined;

export const ytCmd = (w: W, func: string, args: unknown[] = []) =>
  w?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');

// yt ignores 'listening' until the player is ready, so keep asking for a bit
export function ytListen(frame: HTMLIFrameElement | null, id: number) {
  let n = 0;
  const t = setInterval(() => {
    if (++n > 20 || !frame?.isConnected) return clearInterval(t);
    frame.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id, channel: 'widget' }), '*');
  }, 500);
}
