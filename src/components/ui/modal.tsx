import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

// small dialog: portal, backdrop/Esc/X close, scroll lock, focuses the close button and gives focus back
// shortcut: tab can leave the dialog, swap for a radix dialog if that ever matters
export function Modal({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const close = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.18 }}
          onMouseDown={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={label}
            className="relative my-auto w-full max-w-4xl overflow-hidden rounded-[18px] border border-white/10 bg-[#0a0a0a] shadow-2xl"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }} transition={{ duration: reduce ? 0 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <button ref={close} onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-black/50 text-white/80 backdrop-blur transition-colors hover:bg-black/70 hover:text-white">
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
