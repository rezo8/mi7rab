export function ReadingStand() {
  return (
    <div className="room-stand" aria-hidden="true">
      <svg viewBox="0 0 200 168" className="room-stand-svg">
        <defs>
          {/* Page parchment gradient */}
          <linearGradient id="page-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#18130c" />
            <stop offset="100%" stopColor="#1d1710" />
          </linearGradient>
          <linearGradient id="page-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1d1710" />
            <stop offset="100%" stopColor="#18130c" />
          </linearGradient>

          {/* Warm candlelight glow on pages */}
          <radialGradient id="page-glow" cx="50%" cy="55%" r="55%">
            <stop offset="0%"   stopColor="#c9a24b" stopOpacity="0.09">
              <animate
                attributeName="stop-opacity"
                values="0.06;0.13;0.07;0.10;0.06"
                dur="4.2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#c9a24b" stopOpacity="0" />
          </radialGradient>

          {/* Wood grain gradient for stand */}
          <linearGradient id="wood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1e1108" />
            <stop offset="40%"  stopColor="#2c1a0b" />
            <stop offset="100%" stopColor="#1a0e05" />
          </linearGradient>
        </defs>

        {/* ── Book pages ──────────────────────────────────────── */}

        {/* Left page */}
        <path
          d="M 16,28 Q 56,24 99,27 L 99,120 Q 56,123 16,118 Z"
          fill="url(#page-left)"
          stroke="#2a1f12"
          strokeWidth="0.8"
        />
        {/* Right page */}
        <path
          d="M 99,27 Q 142,24 184,28 L 184,118 Q 142,123 99,120 Z"
          fill="url(#page-right)"
          stroke="#2a1f12"
          strokeWidth="0.8"
        />

        {/* Text lines — left page */}
        {[42, 52, 62, 72, 82, 92, 102, 112].map((y) => (
          <line
            key={`l${y}`}
            x1="24"  y1={y}
            x2="91"  y2={y + 0.4}
            stroke="#2e2318"
            strokeWidth="0.9"
            opacity="0.85"
          />
        ))}

        {/* Text lines — right page */}
        {[42, 52, 62, 72, 82, 92, 102, 112].map((y) => (
          <line
            key={`r${y}`}
            x1="109" y1={y}
            x2="176" y2={y + 0.4}
            stroke="#2e2318"
            strokeWidth="0.9"
            opacity="0.85"
          />
        ))}

        {/* Shorter last line (incomplete paragraph feel) */}
        <line x1="24"  y1="112" x2="62" y2="112.3" stroke="#2e2318" strokeWidth="0.9" opacity="0.85" />
        <line x1="109" y1="112" x2="148" y2="112.3" stroke="#2e2318" strokeWidth="0.9" opacity="0.85" />

        {/* Spine — gold line */}
        <line
          x1="99" y1="25"
          x2="99" y2="122"
          stroke="#c9a24b"
          strokeWidth="1.4"
          opacity="0.55"
        />
        {/* Spine shadow */}
        <rect x="96" y="27" width="3" height="93" fill="#080500" opacity="0.35" />

        {/* Candlelight glow overlay on pages */}
        <path
          d="M 16,28 Q 56,24 184,28 L 184,118 Q 142,123 16,118 Z"
          fill="url(#page-glow)"
        />

        {/* ── Stand ──────────────────────────────────────────── */}

        {/* Top support rail */}
        <rect
          x="20" y="120" width="160" height="7"
          rx="2"
          fill="url(#wood)"
          stroke="#110a02"
          strokeWidth="0.6"
        />

        {/* Left outer leg */}
        <line
          x1="42"  y1="127"
          x2="12"  y2="163"
          stroke="#1e1108" strokeWidth="4.5" strokeLinecap="round"
        />
        {/* Right outer leg */}
        <line
          x1="158" y1="127"
          x2="188" y2="163"
          stroke="#1e1108" strokeWidth="4.5" strokeLinecap="round"
        />
        {/* Cross brace: left-top → right-bottom */}
        <line
          x1="42"  y1="127"
          x2="188" y2="163"
          stroke="#1a0e04" strokeWidth="3" strokeLinecap="round" opacity="0.8"
        />
        {/* Cross brace: right-top → left-bottom */}
        <line
          x1="158" y1="127"
          x2="12"  y2="163"
          stroke="#1a0e04" strokeWidth="3" strokeLinecap="round" opacity="0.8"
        />

        {/* Bottom foot rail */}
        <line
          x1="8"   y1="163"
          x2="192" y2="163"
          stroke="#1e1108" strokeWidth="4" strokeLinecap="round"
        />
        {/* Foot rail highlight */}
        <line
          x1="10"  y1="161"
          x2="190" y2="161"
          stroke="#2c1a0b" strokeWidth="1" strokeLinecap="round" opacity="0.5"
        />
      </svg>
    </div>
  );
}
