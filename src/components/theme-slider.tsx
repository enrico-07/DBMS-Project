import { Sun, Sunset, Moon } from 'lucide-react';
import { useVault, type ThemeMode } from '@/components/vault-provider';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  timeLabel: string;
  icon: typeof Sun;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'morning',
    label: 'Morning',
    timeLabel: 'Dawn Sunshine (6 AM–12 PM)',
    icon: Sun,
  },
  {
    id: 'sunset',
    label: 'Sunset',
    timeLabel: 'Warm Pantry (12 PM–7 PM)',
    icon: Sunset,
  },
  {
    id: 'night',
    label: 'Night',
    timeLabel: 'Peaceful Rest (7 PM–6 AM)',
    icon: Moon,
  },
];

export function ThemeSlider({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { theme, setTheme } = useVault();
  const activeIndex = THEME_OPTIONS.findIndex(o => o.id === theme);
  const safeIndex = activeIndex >= 0 ? activeIndex : 1;

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
      setTheme(THEME_OPTIONS[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
      setTheme(THEME_OPTIONS[prevIndex].id);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Color scheme mode"
      className={`theme-slider-track ${compact ? 'compact' : ''} ${className}`}
    >
      {/* Animated Sliding Pill Thumb */}
      <div
        className={`theme-slider-thumb theme-thumb-${theme}`}
        style={{
          transform: `translateX(${safeIndex * 100}%)`,
        }}
        aria-hidden="true"
      />

      {THEME_OPTIONS.map((opt, idx) => {
        const Icon = opt.icon;
        const isActive = opt.id === theme;

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            aria-label={`${opt.label} mode (${opt.timeLabel})`}
            title={`${opt.label} Mode · ${opt.timeLabel}`}
            className={`theme-slider-btn ${isActive ? 'active' : ''}`}
            onClick={() => setTheme(opt.id)}
            onKeyDown={e => handleKeyDown(e, idx)}
          >
            <Icon
              size={13}
              className={`theme-slider-icon ${isActive ? 'active-icon' : ''}`}
            />
            {!compact && (
              <span className="theme-slider-text">{opt.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
