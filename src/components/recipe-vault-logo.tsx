import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function RecipeVaultLogo({ size = 36, className = '', showText = false, ...props }: LogoProps) {
  const rawId = React.useId();
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '');
  const squircleGradId = `rv-squircle-${id}`;
  const terracottaGradId = `rv-terracotta-${id}`;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="RecipeVault Logo"
        {...props}
      >
        <defs>
          {/* Soft Sage Background Squircle Gradient */}
          <linearGradient id={squircleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4F8F4" />
            <stop offset="100%" stopColor="#E3EDE4" />
          </linearGradient>

          {/* Warm Terracotta Lacquer Stroke Gradient */}
          <linearGradient id={terracottaGradId} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#D9714B" />
            <stop offset="100%" stopColor="#B85430" />
          </linearGradient>
        </defs>

        {/* Squircle Foundation */}
        <rect
          width="64"
          height="64"
          rx="18"
          fill={`url(#${squircleGradId}) #EDF3EB`}
          stroke="#DCE6DE"
          strokeWidth="1.5"
        />

        {/* Outlined Chef Hat with Artisan Culinary Flairs */}
        <g>
          {/* Hat Crown / Clouds */}
          <path
            d="M22 36C18.686 36 16 33.314 16 30C16 27.2 17.9 24.84 20.59 24.16C20.98 18.47 25.74 14 31.5 14C37.26 14 42.02 18.47 42.41 24.16C45.1 24.84 47 27.2 47 30C47 33.314 44.314 36 41 36"
            stroke={`url(#${terracottaGradId}) #C4633F`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hat Headband Base */}
          <path
            d="M22 36V45C22 46.105 22.895 47 24 47H39C40.105 47 41 46.105 41 45V36"
            stroke={`url(#${terracottaGradId}) #C4633F`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Accent Line */}
          <line
            x1="22"
            y1="41.5"
            x2="41"
            y2="41.5"
            stroke={`url(#${terracottaGradId}) #C4633F`}
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Warm Golden Flavor Sparkle */}
          <circle cx="31.5" cy="27" r="1.75" fill="#D9A441" />
        </g>
      </svg>

      {showText && (
        <span className="font-serif text-2xl font-semibold tracking-tight text-foreground select-none">
          RecipeVault<span className="text-clay">.</span>
        </span>
      )}
    </div>
  );
}
