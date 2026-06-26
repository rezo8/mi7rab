import type { CSSProperties } from "react";
import type { Door } from "./doors";

export type DoorState = "active" | "adjacent" | "far";

interface Props {
  door: Door;
  state: DoorState;
  onClick?: () => void;
}

// Outer arch (closed — clip path + fill)
const ARCH_D =
  "M 10,202 L 10,140 C 10,48 34,5 60,5 C 86,5 110,48 110,140 L 110,202 Z";

// Arch stroke only (open — border line)
const ARCH_STROKE_D =
  "M 10,202 L 10,140 C 10,48 34,5 60,5 C 86,5 110,48 110,140 L 110,202";

// Muqarnas: nested pointed arch outlines, inset 12px each tier
const TIERS = [
  "M 22,202 L 22,145 C 22,62 42,20 60,18 C 78,20 98,62 98,145 L 98,202",
  "M 33,202 L 33,151 C 33,80 49,38 60,34 C 71,38 87,80 87,151 L 87,202",
  "M 44,202 L 44,157 C 44,100 54,62 60,58 C 66,62 76,100 76,157 L 76,202",
];

// Crown niches at the apex
const CROWN = [
  "M 44,55 C 44,28 52,14 60,12 C 68,14 76,28 76,55",
  "M 50,70 C 50,48 55,38 60,36 C 65,38 70,48 70,70",
];

// Scallop niches at the base
const NICHES = [
  "M 34,168 C 34,158 38,152 43,152 C 48,152 52,158 52,168",
  "M 52,168 C 52,158 56,152 60,152 C 64,152 68,158 68,168",
  "M 68,168 C 68,158 72,152 77,152 C 82,152 86,158 86,168",
];

export function MihrabDoor({ door, state, onClick }: Props) {
  const { colors } = door;
  const isActive = state === "active";
  const uid = door.id;

  const archBorder = isActive ? colors.arch    : colors.archDim;
  const tileColor  = isActive ? colors.tile    : colors.tileDim;
  const crownColor = isActive ? colors.crown   : colors.crownDim;

  const svgStyle: CSSProperties = isActive
    ? { filter: `drop-shadow(0 0 28px ${colors.glow})` }
    : {};

  return (
    <button
      type="button"
      className={`mihrab-door mihrab-door--${state}`}
      onClick={onClick}
      disabled={isActive}
      aria-label={door.label}
      aria-pressed={isActive}
    >
      <svg
        viewBox="0 0 120 205"
        className="mihrab-door-svg"
        style={svgStyle}
        aria-hidden="true"
      >
        <defs>
          {/* Crosshatch tile — Islamic geometry suggestion */}
          <pattern
            id={`tile-${uid}`}
            x="0" y="0" width="18" height="18"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0"  y1="0"  x2="18" y2="18" stroke={tileColor} strokeWidth="0.4" opacity="0.6" />
            <line x1="18" y1="0"  x2="0"  y2="18" stroke={tileColor} strokeWidth="0.4" opacity="0.6" />
            <line x1="9"  y1="0"  x2="9"  y2="18" stroke={tileColor} strokeWidth="0.2" opacity="0.35" />
            <line x1="0"  y1="9"  x2="18" y2="9"  stroke={tileColor} strokeWidth="0.2" opacity="0.35" />
            <polygon
              points="9,1 12,9 9,17 6,9"
              fill="none" stroke={tileColor} strokeWidth="0.35" opacity="0.5"
            />
          </pattern>

          {/* Clip path: arch shape */}
          <clipPath id={`clip-${uid}`}>
            <path d={ARCH_D} />
          </clipPath>

          {/* Interior depth gradient — lighter near floor, dark at the vault */}
          <radialGradient id={`depth-${uid}`} cx="50%" cy="95%" r="65%">
            <stop offset="0%"   stopColor={colors.fill} stopOpacity="0" />
            <stop offset="100%" stopColor="#050808"     stopOpacity="1" />
          </radialGradient>

          {/* Active: glow filter on arch border */}
          {isActive && (
            <filter id={`glow-${uid}`} x="-30%" y="-10%" width="160%" height="120%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Outer frame */}
        <rect
          x="0" y="0" width="120" height="205"
          fill="#06090a"
          stroke={isActive ? `${colors.arch}30` : `${colors.archDim}40`}
          strokeWidth="1"
          rx="2"
        />

        {/* Arch fill */}
        <path d={ARCH_D} fill={colors.fill} />

        {/* Depth gradient overlay */}
        <path d={ARCH_D} fill={`url(#depth-${uid})`} opacity="0.7" />

        {/* Tile pattern — clipped to arch */}
        <rect
          x="0" y="0" width="120" height="205"
          fill={`url(#tile-${uid})`}
          clipPath={`url(#clip-${uid})`}
          opacity={isActive ? 0.65 : 0.4}
        />

        {/* Muqarnas tiers */}
        {[...TIERS].reverse().map((d, ri) => {
          const i = TIERS.length - 1 - ri;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={tileColor}
              strokeWidth={0.9 - i * 0.2}
              opacity={0.75 - i * 0.15}
            />
          );
        })}

        {/* Crown niches */}
        {CROWN.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={crownColor}
            strokeWidth={0.7 - i * 0.15}
            opacity={0.85}
          />
        ))}

        {/* Base scallop niches */}
        {NICHES.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={tileColor}
            strokeWidth="0.6"
            opacity="0.55"
          />
        ))}

        {/* Main arch border */}
        <path
          d={ARCH_STROKE_D}
          fill="none"
          stroke={archBorder}
          strokeWidth={isActive ? 1.8 : 1.3}
          filter={isActive ? `url(#glow-${uid})` : undefined}
        />

        {/* Active: inner halo wash */}
        {isActive && (
          <path
            d={ARCH_STROKE_D}
            fill="none"
            stroke={colors.arch}
            strokeWidth="8"
            opacity="0.08"
          />
        )}

        {/* Inner frame inset */}
        <rect
          x="4" y="4" width="112" height="197"
          fill="none"
          stroke={isActive ? `${colors.arch}1a` : `${colors.archDim}28`}
          strokeWidth="0.8"
          rx="1"
        />
      </svg>
    </button>
  );
}
