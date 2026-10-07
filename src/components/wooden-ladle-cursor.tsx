import React, { useEffect, useState, useRef } from 'react';

export function WoodenLadleCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  const posRef = useRef({ x: -100, y: -100 });
  const cursorNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only enable if device supports hover/fine pointer (ignore touch mobile screens)
    if (typeof window === 'undefined') return;
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
      if (!isVisible) setIsVisible(true);
      if (!rAFId) {
        rAFId = requestAnimationFrame(updateCursorPosition);
      }
    };

    const handleMouseDown = () => {
      setIsPressing(true);
    };

    const handleMouseUp = () => {
      setIsPressing(false);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (cursorNodeRef.current) {
        cursorNodeRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      setIsVisible(true);
    };

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
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Natural Reversed Culinary Ladle Banging Physics:
  // - The user holds the handle pommel up-right (pivot at 45px 47px).
  // - The scoop head is at bottom-left (12px 14px), directly over the target element.
  // - Resting position: 0deg.
  // - Hovering over a clickable button: gentle windup/lift (+6deg, lifting the head slightly).
  // - On MouseDown (Clicking / Banging): The handle rotates COUNTER-CLOCKWISE (-15deg),
  //   which swings the entire ladle down and forward, driving the ladle head directly down (+6px translateY, -15deg)
  //   slamming/banging right onto the button surface with maximum natural momentum!
  // - On MouseUp: springs smoothly back up to resting posture.
  const rotation = isPressing ? -15 : isHoveringClickable ? 6 : 0;
  const headTranslateY = isPressing ? 5 : isHoveringClickable ? -3 : 0;

  return (
    <div
      ref={cursorNodeRef}
      className="wooden-ladle-cursor-overlay"
      aria-hidden="true"
    >
      <div
        className="ladle-pivot-wrapper"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: '45px 47px',
          transition: isPressing
            ? 'transform 70ms cubic-bezier(0.18, 0.89, 0.32, 1.28)'
            : 'transform 190ms cubic-bezier(0.34, 1.56, 0.64, 1)',
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

            {/* Depth & drop shadow */}
            <filter id="ladle-shadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.8" floodColor="#1F150D" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter="url(#ladle-shadow)">
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

            {/* THE LADLE HEAD / BOWL - Bangs directly down onto the clicked button */}
            <g
              style={{
                transform: `translateY(${headTranslateY}px)`,
                transition: isPressing
                  ? 'transform 70ms cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                  : 'transform 190ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
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
                opacity="0.35"
              />
            </g>
          </g>

          {/* Bang / Boink Impact Shockwaves right under the ladle head when banging the button */}
          {isPressing && (
            <g className="boink-impact-stars" transform={`translate(12, ${14 + headTranslateY})`}>
              {/* Expanding Ripple Ring */}
              <circle cx="0" cy="0" r="8" stroke="#F59E0B" strokeWidth="1.5" fill="none" opacity="0.9" />
              <circle cx="0" cy="0" r="13" stroke="#E07A2B" strokeWidth="0.8" strokeDasharray="2 3" fill="none" opacity="0.7" />
              {/* Flavor spark impact stars */}
              <circle cx="-6" cy="-6" r="1.6" fill="#FFE8C2" />
              <circle cx="7" cy="-4" r="1.4" fill="#F59E0B" />
              <circle cx="5" cy="7" r="1.5" fill="#E07A2B" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
