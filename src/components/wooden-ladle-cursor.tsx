import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ClickBurst {
  id: number;
}

export function WoodenLadleCursor() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  const posRef = useRef({ x: -100, y: -100 });
  const cursorNodeRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);

    // Only enable if device supports hover/fine pointer (ignore touch mobile screens)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    let rAFId: number | null = null;
    const updateCursorPosition = () => {
      if (cursorNodeRef.current) {
        cursorNodeRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      rAFId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
        document.documentElement.classList.add('has-ladle-cursor');
      }

      if (!rAFId) {
        rAFId = requestAnimationFrame(updateCursorPosition);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsPressing(true);

      // Trigger tactile dynamic seasoning splash / ripple
      const burstId = Date.now();
      setBursts(prev => [...prev.slice(-2), { id: burstId }]);

      window.setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== burstId));
      }, 420);
    };

    const handleMouseUp = () => {
      setIsPressing(false);
    };

    const handleWindowBlur = () => {
      setIsPressing(false);
      setIsVisible(false);
      isVisibleRef.current = false;
      document.documentElement.classList.remove('has-ladle-cursor');
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsPressing(false);
      isVisibleRef.current = false;
      document.documentElement.classList.remove('has-ladle-cursor');
    };

    const handleMouseEnter = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (cursorNodeRef.current) {
        cursorNodeRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      isVisibleRef.current = true;
      setIsVisible(true);
      document.documentElement.classList.add('has-ladle-cursor');
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickable = !!target.closest(
        'a, button, [role="button"], input, select, textarea, [data-clickable], .cursor-pointer, .pantry-chip, .recipe-card, .collection-item, label, [role="radio"], [data-close-button], [data-button], [data-action], [data-sonner-toast] button'
      );
      setIsHoveringClickable(prev => (prev !== clickable ? clickable : prev));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleOver, { passive: true });
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('blur', handleWindowBlur);
      document.documentElement.classList.remove('has-ladle-cursor');
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  // Natural Culinary Ladle Tapping & Hover Physics:
  // - Hotspot & Pivot Anchor: Spoon bowl center at (13px, 14px), directly pinned on the mouse click coordinate (clientX, clientY).
  // - Resting posture: 0deg, scale 1.
  // - Hovering clickable element: handle raises up slightly (-7deg, scale 1.04) in ready-to-tap anticipation, while bowl stays anchored on the target.
  // - Clicking / Tap Strike: handle taps firmly down (+4deg, scale 0.90) right onto the screen surface, with the bowl staying locked on the exact click pixel!
  // - Release: snappy elastic rebound back to resting/hover.
  const transform = isPressing
    ? 'rotate(4deg) scale(0.90)'
    : isHoveringClickable
    ? 'rotate(-7deg) scale(1.04)'
    : 'rotate(0deg) scale(1)';

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const cursorOverlay = (
    <div
      ref={cursorNodeRef}
      className={`wooden-ladle-cursor-overlay ${isPressing ? 'is-pressing' : ''} ${isHoveringClickable ? 'is-hovering' : ''}`}
      aria-hidden="true"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 2147483647,
      }}
    >
      {/* Animated Expanding Flavor Ripples on Click */}
      {bursts.map(b => (
        <React.Fragment key={b.id}>
          <div className="ladle-click-ripple" />
          <div className="ladle-click-spark" style={{ '--spark-x': '-12px', '--spark-y': '-10px' } as React.CSSProperties} />
          <div className="ladle-click-spark" style={{ '--spark-x': '14px', '--spark-y': '-8px' } as React.CSSProperties} />
          <div className="ladle-click-spark" style={{ '--spark-x': '10px', '--spark-y': '12px' } as React.CSSProperties} />
          <div className="ladle-click-spark" style={{ '--spark-x': '-8px', '--spark-y': '11px' } as React.CSSProperties} />
        </React.Fragment>
      ))}

      <div
        className="ladle-pivot-wrapper"
        style={{
          transform,
          transformOrigin: '13px 14px',
          transition: isPressing
            ? 'transform 60ms cubic-bezier(0.1, 0.9, 0.2, 1)'
            : 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich Hand-Carved Cherry/Teak Wood Gradients */}
            <linearGradient id="ladle-wood-deep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A2810" />
              <stop offset="30%" stopColor="#7B4219" />
              <stop offset="65%" stopColor="#9C5B28" />
              <stop offset="100%" stopColor="#C47E3D" />
            </linearGradient>

            <linearGradient id="ladle-bowl-inner" x1="15%" y1="20%" x2="85%" y2="80%">
              <stop offset="0%" stopColor="#552C0D" />
              <stop offset="45%" stopColor="#7E471C" />
              <stop offset="80%" stopColor="#A86830" />
              <stop offset="100%" stopColor="#D49354" />
            </linearGradient>

            <linearGradient id="ladle-handle" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#A3632E" />
              <stop offset="40%" stopColor="#81461B" />
              <stop offset="80%" stopColor="#5E3110" />
              <stop offset="100%" stopColor="#3C1C07" />
            </linearGradient>

            <linearGradient id="ladle-brass-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          <g>
            {/* LONG TURNED WOODEN HANDLE */}
            {/* Anchored at (45, 47) held by hand */}
            <path
              d="M 18 19 L 45 46 C 46.8 47.8 45.2 49.8 43.2 48.2 L 16.5 21 Z"
              fill="url(#ladle-handle)"
              stroke="#3D1D08"
              strokeWidth="0.8"
            />

            {/* Artisan Brass ferrule grip bands near pommel */}
            <line x1="39" y1="38" x2="43.5" y2="42.5" stroke="url(#ladle-brass-ring)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="42.5" y1="41.5" x2="45.5" y2="44.5" stroke="url(#ladle-brass-ring)" strokeWidth="1.2" strokeLinecap="round" />

            {/* Hanging lanyard hole on handle pommel */}
            <circle cx="43.5" cy="46.5" r="1.3" fill="#261205" stroke="#81461B" strokeWidth="0.5" />

            {/* THE LADLE HEAD / BOWL - Anchored directly on the clicked element */}
            <g id="ladle-bowl-head">
              {/* Outer Rim */}
              <ellipse
                cx="13"
                cy="14"
                rx="9"
                ry="7.5"
                transform="rotate(-25 13 14)"
                fill="url(#ladle-wood-deep)"
                stroke="#3A1C07"
                strokeWidth="1.1"
              />

              {/* Carved Hollow Interior of the Ladle */}
              <ellipse
                cx="12.5"
                cy="13.5"
                rx="6.8"
                ry="5.4"
                transform="rotate(-25 12.5 13.5)"
                fill="url(#ladle-bowl-inner)"
              />

              {/* Gentle Carved Grain & Rim Highlight */}
              <path
                d="M 6.5 11 C 7.5 8 13.5 7.5 17 9.5"
                stroke="#E8B482"
                strokeWidth="0.9"
                strokeLinecap="round"
                fill="none"
                opacity="0.75"
              />

              {/* Warm Broth / Soup Glimmer */}
              <ellipse
                cx="13.2"
                cy="14"
                rx="3.5"
                ry="2.4"
                transform="rotate(-20 13.2 14)"
                fill="#D9A441"
                opacity="0.4"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );

  return createPortal(cursorOverlay, document.body);
}
