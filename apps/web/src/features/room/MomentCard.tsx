import type { CSSProperties } from "react";
import type { Door } from "./doors";

const ARCH_D =
  "M 10,202 L 10,140 C 10,48 34,5 60,5 C 86,5 110,48 110,140 L 110,202 Z";
const ARCH_STROKE_D =
  "M 10,202 L 10,140 C 10,48 34,5 60,5 C 86,5 110,48 110,140 L 110,202";
const TIER =
  "M 22,202 L 22,145 C 22,62 42,20 60,18 C 78,20 98,62 98,145 L 98,202";
const CROWN =
  "M 44,55 C 44,28 52,14 60,12 C 68,14 76,28 76,55";
const NICHES = [
  "M 34,168 C 34,158 38,152 43,152 C 48,152 52,158 52,168",
  "M 52,168 C 52,158 56,152 60,152 C 64,152 68,158 68,168",
  "M 68,168 C 68,158 72,152 77,152 C 82,152 86,158 86,168",
];

function BackPattern({ uid, color }: { uid: string; color: string }) {
  return (
    <>
      <defs>
        <pattern
          id={`bp-${uid}`}
          x="0" y="0" width="14" height="14"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="14" y2="14" stroke={color} strokeWidth="0.35" opacity="0.45" />
          <line x1="14" y1="0" x2="0" y2="14" stroke={color} strokeWidth="0.35" opacity="0.45" />
          <polygon points="7,1 10,7 7,13 4,7" fill="none" stroke={color} strokeWidth="0.25" opacity="0.3" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="120" height="205" fill={`url(#bp-${uid})`} />
    </>
  );
}

interface Props {
  door: Door;
  faceUp: boolean;
  style?: CSSProperties;
  onClick: () => void;
}

export function MomentCard({ door, faceUp, style, onClick }: Props) {
  const { colors } = door;
  const uid = `${door.id}-${faceUp ? "f" : "b"}-${Math.round(Math.random() * 1e6)}`;

  return (
    <div
      className="moment-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={style}
    >
      <svg viewBox="0 0 120 205" className="moment-card-svg" aria-hidden="true">
        <rect x="0" y="0" width="120" height="205" fill="#07090b" rx="2" />

        {faceUp ? (
          <>
            <path d={ARCH_D} fill="#000" />
            <path d={TIER} fill="none" stroke={colors.tile} strokeWidth="0.8" opacity="0.5" />
            <path d={CROWN} fill="none" stroke={colors.crown} strokeWidth="0.7" opacity="0.7" />
            {NICHES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={colors.tile} strokeWidth="0.55" opacity="0.45" />
            ))}
            <path d={ARCH_STROKE_D} fill="none" stroke={colors.arch} strokeWidth="1.5" />
            <path d={ARCH_STROKE_D} fill="none" stroke={colors.arch} strokeWidth="6" opacity="0.07" />
          </>
        ) : (
          <>
            <BackPattern uid={uid} color={colors.arch} />
            <path d={ARCH_D} fill={colors.arch} opacity="0.1" />
            <path d={TIER} fill="none" stroke={colors.tile} strokeWidth="0.9" opacity="0.6" />
            <path d={CROWN} fill="none" stroke={colors.crown} strokeWidth="0.75" opacity="0.8" />
            {NICHES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={colors.tile} strokeWidth="0.55" opacity="0.5" />
            ))}
            <path d={ARCH_STROKE_D} fill="none" stroke={colors.arch} strokeWidth="1.6" />
            <path d={ARCH_STROKE_D} fill="none" stroke={colors.arch} strokeWidth="7" opacity="0.06" />
          </>
        )}

        <rect x="4" y="4" width="112" height="197" fill="none" stroke={`${colors.arch}1a`} strokeWidth="0.8" rx="1" />
      </svg>
    </div>
  );
}
