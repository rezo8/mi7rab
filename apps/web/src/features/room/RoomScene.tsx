import { useCallback, useEffect, useState } from "react";
import { signOut } from "@/lib/auth/auth-client";
import { DOORS } from "./doors";
import { MihrabDoor } from "./MihrabDoor";
import { ReadingStand } from "./ReadingStand";
import { PagesModal } from "./PagesModal";

interface Props {
  onWriteAnother: () => void;
}

const N = DOORS.length;
const wrap = (i: number) => ((i % N) + N) % N;

// TODO: falling stars — slow particle rain from ceiling, toggled by VITE_FALLING_STARS=true.
// Each door could have a distinct particle shape/density. Gate: check import.meta.env.VITE_FALLING_STARS === "true".
export function RoomScene({ onWriteAnother }: Props) {
  const [active, setActive] = useState(0);
  const [showPages, setShowPages] = useState(false);

  const goLeft  = useCallback(() => setActive((i) => wrap(i - 1)), []);
  const goRight = useCallback(() => setActive((i) => wrap(i + 1)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  goLeft();
      if (e.key === "ArrowRight") goRight();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goLeft, goRight]);

  type SlotState = "active" | "adjacent" | "far";
  // Five visible slots: [-2, -1, 0, +1, +2] from active
  const slots: { door: (typeof DOORS)[0]; state: SlotState; offset: number }[] =
    [-2, -1, 0, 1, 2].map((offset) => ({
      door: DOORS[wrap(active + offset)]!,
      state:
        offset === 0
          ? "active"
          : Math.abs(offset) === 1
            ? "adjacent"
            : "far",
      offset,
    }));

  return (
    <main
      id="main"
      className="page page--room"
      style={{ "--room-tint": DOORS[active]!.colors.arch } as React.CSSProperties}
    >
      <nav className="corner corner--right">
        <button type="button" className="link-quiet" onClick={() => void signOut()}>
          sign out
        </button>
      </nav>

      <p className="wordmark" lang="ar" dir="rtl">مِحراب</p>

      {/* Active door label — above the scene */}
      <div className="room-door-info" aria-live="polite" aria-atomic="true">
        <p className="room-door-name" lang="ar" dir="rtl">
          {DOORS[active]!.labelAr}
        </p>
        <p className="room-door-counter">
          {active + 1} <span className="room-door-counter-sep">/</span> {N}
        </p>
      </div>

      {/* Scene: doors behind, stand in front — same grid cell */}
      <div className="room-scene">
        <div className="room-carousel" role="navigation" aria-label="The eight doors">
        <button
          type="button"
          className="room-door-arrow"
          onClick={goLeft}
          aria-label="Previous door"
        >
          ‹
        </button>

        <div className="room-doors-row">
          {slots.map(({ door, state, offset }) => {
            const onClick =
              offset === -1 ? goLeft
              : offset ===  1 ? goRight
              : offset === -2 ? () => setActive(wrap(active - 2))
              : offset ===  2 ? () => setActive(wrap(active + 2))
              : undefined;
            return (
              <MihrabDoor
                key={door.id}
                door={door}
                state={state}
                onClick={onClick}
              />
            );
          })}
        </div>

        <button
          type="button"
          className="room-door-arrow"
          onClick={goRight}
          aria-label="Next door"
        >
          ›
        </button>
        </div>

        <button
          type="button"
          className="room-stand-btn"
          onClick={() => setShowPages(true)}
          aria-label="Open your saved pages"
        >
          <ReadingStand />
        </button>
      </div>

      <button type="button" className="room-write-another" onClick={onWriteAnother}>
        write another page
      </button>

      {showPages && <PagesModal onClose={() => setShowPages(false)} />}
    </main>
  );
}
