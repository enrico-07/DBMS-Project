import React, { useEffect, useState } from 'react';

export function ChopstickCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPressing, setIsPressing] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable if device supports hover/fine pointer (ignore touch mobile screens)
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsPressing(true);
    const handleMouseUp = () => setIsPressing(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickable = !!target.closest(
        'a, button, [role="button"], input, select, textarea, [data-clickable], .cursor-pointer, .pantry-chip, .recipe-card, .collection-item, label, [role="radio"]'
      );
      setIsHoveringClickable(clickable);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Chopstick rotation angles:
  // When idle: left stick ~ -14deg, right stick ~ +10deg (open gap between tips)
  // When hovering clickable: slightly eager (-10deg, +6deg)
  // When pressed/dragging: pinched closed! (tips meet together at 0deg / +1deg)
  const leftAngle = isPressing ? -1.5 : isHoveringClickable ? -9 : -14;
  const rightAngle = isPressing ? 1.5 : isHoveringClickable ? 6 : 11;
  const scale = isPressing ? 0.94 : isHoveringClickable ? 1.05 : 1;

  return (
    <div
      className="chopstick-cursor-overlay"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <defs>
          {/* Wood grain gradient for handcrafted lacquer chopsticks */}
          <linearGradient id="chopstick-wood-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C3E1B" />
            <stop offset="25%" stopColor="#9C5B28" />
            <stop offset="65%" stopColor="#C68642" />
            <stop offset="100%" stopColor="#E2B176" />
          </linearGradient>

          <linearGradient id="chopstick-wood-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#553014" />
            <stop offset="30%" stopColor="#8A4E20" />
            <stop offset="70%" stopColor="#B97838" />
            <stop offset="100%" stopColor="#DFAB6E" />
          </linearGradient>

          {/* Polished Brass / Gold ferrule & inlays */}
          <linearGradient id="gold-ferrule" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Soft drop shadow */}
          <filter id="chopstick-shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="1.8" floodColor="#2C231B" floodOpacity="0.32" />
          </filter>
        </defs>

        <g filter="url(#chopstick-shadow)">
          {/* LEFT CHOPSTICK */}
          {/* Pivot around tip at (16, 16) */}
          <g
            style={{
              transformOrigin: '16px 16px',
              transform: `rotate(${leftAngle}deg)`,
              transition: 'transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Tapered body: from fine tip (16,16) to wide rounded handle (46, 46) */}
            <path
              d="M 15.5 16.5 L 43.5 44.5 C 45 46 47 44 45.5 42.5 L 17.5 14.5 Z"
              fill="url(#chopstick-wood-left)"
              stroke="#3D200E"
              strokeWidth="0.75"
            />
            {/* Artisan gold grip bands on handle */}
            <line x1="37" y1="36" x2="41" y2="40" stroke="url(#gold-ferrule)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="40" y1="39" x2="44" y2="43" stroke="url(#gold-ferrule)" strokeWidth="1.2" strokeLinecap="round" />
            {/* Fine natural bamboo tip */}
            <circle cx="16.5" cy="15.5" r="1.3" fill="#FFE8C2" stroke="#6C3E1B" strokeWidth="0.5" />
          </g>

          {/* RIGHT CHOPSTICK */}
          {/* Pivot around tip at (16, 16) */}
          <g
            style={{
              transformOrigin: '16px 16px',
              transform: `rotate(${rightAngle}deg)`,
              transition: 'transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Tapered body */}
            <path
              d="M 16.5 15.5 L 47 41.5 C 48.5 42.8 50 40.8 48.5 39.5 L 18 13.5 Z"
              fill="url(#chopstick-wood-right)"
              stroke="#2E1609"
              strokeWidth="0.75"
            />
            {/* Artisan gold grip bands on handle */}
            <line x1="39" y1="34" x2="44" y2="38" stroke="url(#gold-ferrule)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="42.5" y1="37" x2="47" y2="41" stroke="url(#gold-ferrule)" strokeWidth="1.2" strokeLinecap="round" />
            {/* Fine natural bamboo tip */}
            <circle cx="17.2" cy="14.8" r="1.3" fill="#FFE8C2" stroke="#553014" strokeWidth="0.5" />
          </g>
        </g>

        {/* Pinch Morsel / Sparkle when grabbing or clicking */}
        {isPressing && (
          <g className="pinch-sparkle" transform="translate(16, 16)">
            <circle cx="0" cy="0" r="2.8" fill="#D9A441" />
            <circle cx="0" cy="0" r="1.4" fill="#FFFDF9" />
          </g>
        )}
      </svg>
    </div>
  );
}
