// from obsidianui

import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useState } from 'react';

interface SkeumorphicMusicCardProps {
  title: string;
  artist: string;
  cover: string;
  playing?: boolean;
  progress?: number | null; // 0..1, null when unknown
  onToggle?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

const ControlButton = ({
  onClick,
  children,
  label,
  size = 'small'
}: {
  onClick?: () => void;
  children: React.ReactNode;
  label: string;
  size?: 'small' | 'large';
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const press = () => setIsPressed(true), release = () => setIsPressed(false);
  return (
    <div
      className="rounded-full p-[3px] border-[1px] border-white/5"
      style={{
        background: 'linear-gradient(135deg, #1c1c21 0%, #0d0d10 100%)',
        boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.06), inset -1px -1px 2px rgba(0,0,0,0.6)'
      }}
    >
      <button
        aria-label={label}
        title={label}
        onClick={onClick}
        onMouseDown={press}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={press}
        onTouchEnd={release}
        style={{
          boxShadow: isPressed
            ? 'inset 3px 3px 7px rgba(0,0,0,0.7), inset -1px -1px 3px rgba(255,255,255,0.05)'
            : '-3px -3px 7px rgba(255,255,255,0.045), 3px 3px 9px rgba(0,0,0,0.75)',
          background: isPressed
            ? 'linear-gradient(135deg, #131316 0%, #1b1b20 100%)'
            : 'linear-gradient(135deg, #26262c 0%, #151518 100%)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)'
        }}
        className={`grid place-items-center rounded-full transition-all duration-75 text-zinc-300 hover:text-white ${
          size === 'large' ? 'p-4' : 'p-2'
        }`}
      >
        {children}
      </button>
    </div>
  );
};

const ProgressBar = ({ value }: { value: number | null }) => (
  <div
    style={{
      boxShadow: 'inset 2px 2px 3px rgba(0,0,0,0.6), inset -1px -1px 3px rgba(255,255,255,0.04)',
      background: 'linear-gradient(135deg, #0c0c0e 0%, #16161a 100%)'
    }}
    className="h-2 rounded-full overflow-hidden"
  >
    <div
      style={{
        width: `${Math.round((value ?? 0) * 1000) / 10}%`,
        background: 'linear-gradient(135deg, rgb(var(--glow) / 0.75) 0%, rgb(var(--glow)) 100%)',
        boxShadow: '0 0 12px rgb(var(--glow) / 0.6)'
      }}
      className="h-full rounded-full transition-[width] duration-1000 ease-linear"
    />
  </div>
);

const SkeumorphicMusicCard = ({ title, artist, cover, playing = false, progress = null, onToggle, onBack, onForward, footer, className = '' }: SkeumorphicMusicCardProps) => {
  return (
    <div
      style={{
        boxShadow: 'inset -8px -8px 15px rgba(255,255,255,0.03), inset 8px 8px 15px rgba(0,0,0,0.6), 0 40px 80px -40px rgba(0,0,0,0.9)',
        background: 'linear-gradient(135deg, #17171b 0%, #0b0b0d 100%)'
      }}
      className={`p-5 rounded-[30px] border-[1px] border-white/5 ${className}`}
    >
      <div
        style={{
          boxShadow:
            'inset 2px 2px 5px rgba(255,255,255,0.05), inset -2px -2px 5px rgba(0,0,0,0.5), 5px 5px 15px rgba(0,0,0,0.4)',
          background: 'linear-gradient(135deg, #202025 0%, #121215 100%)'
        }}
        className="relative w-full max-w-80 p-6 rounded-[20px] flex flex-col items-center border-[1px] border-white/5"
      >
        <div
          style={{
            boxShadow: '-2px -2px 5px rgba(255,255,255,0.04), 5px 5px 20px rgba(0,0,0,0.8), 0 0 60px -10px rgb(var(--glow) / 0.45)'
          }}
          className="w-40 h-40 rounded-xl overflow-hidden bg-zinc-900"
        >
          {cover && <img src={cover} alt={title} className="w-full h-full object-cover" />}
        </div>

        <div className="mt-6 w-full text-center">
          <h3 className="truncate text-lg font-semibold text-zinc-100">{title}</h3>
          <p className="truncate text-sm text-zinc-400">{artist}</p>
        </div>

        <div className="w-full mt-6 px-2">
          <ProgressBar value={progress} />
        </div>

        <div className="flex items-center justify-center gap-5 w-full px-2 mt-3">
          <ControlButton label="resync" onClick={onBack}>
            <SkipBack size={22} />
          </ControlButton>

          <ControlButton label={playing ? 'stop listening along' : 'listen along'} onClick={onToggle} size="large">
            {playing ? <Pause size={24} /> : <Play size={24} />}
          </ControlButton>

          <ControlButton label="open song" onClick={onForward}>
            <SkipForward size={22} />
          </ControlButton>
        </div>

        {footer && <div className="mt-4 w-full">{footer}</div>}
      </div>
    </div>
  );
};

export default SkeumorphicMusicCard;
