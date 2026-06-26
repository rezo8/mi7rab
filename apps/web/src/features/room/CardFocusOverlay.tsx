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

interface Props {
  door: Door;
  onDismiss: () => void;
}

export function CardFocusOverlay({ door, onDismiss }: Props) {
  const { colors } = door;

  return (
    <div
      className="card-focus-backdrop"
      onClick={onDismiss}
    >
      <div
        className="card-focus-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card face */}
        <div className="card-focus-card">
          <svg viewBox="0 0 120 205" className="card-focus-svg" aria-hidden="true">
            <rect x="0" y="0" width="120" height="205" fill="#07090b" rx="2" />
            {/* Black image placeholder — future: image fills arch */}
            <path d={ARCH_D} fill="#000" />
            <path d={TIER} fill="none" stroke={colors.tile} strokeWidth="0.8" opacity="0.5" />
            <path d={CROWN} fill="none" stroke={colors.crown} strokeWidth="0.7" opacity="0.7" />
            {NICHES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={colors.tile} strokeWidth="0.55" opacity="0.45" />
            ))}
            <path d={ARCH_STROKE_D} fill="none" stroke={colors.arch} strokeWidth="1.5" />
            <path d={ARCH_STROKE_D} fill="none" stroke={colors.arch} strokeWidth="6" opacity="0.08" />
            <rect x="4" y="4" width="112" height="197" fill="none" stroke={`${colors.arch}1a`} strokeWidth="0.8" rx="1" />
          </svg>
        </div>

        {/* Moment content */}
        <div className="card-focus-content">
          <p className="card-focus-title">—</p>

          <div className="card-focus-field">
            <span className="card-focus-label">reference</span>
            <span className="card-focus-value card-focus-value--empty">—</span>
          </div>

          <div className="card-focus-field">
            <span className="card-focus-label">description</span>
            <span className="card-focus-value card-focus-value--empty">—</span>
          </div>

          <div className="card-focus-links">
            <span className="card-focus-label">extend</span>
            <div className="card-focus-links-row">
              <span className="card-focus-link-placeholder">—</span>
            </div>
          </div>

          <button
            type="button"
            className="link-quiet card-focus-dismiss"
            onClick={onDismiss}
          >
            ← back to {door.labelAr}
          </button>
        </div>
      </div>
    </div>
  );
}
