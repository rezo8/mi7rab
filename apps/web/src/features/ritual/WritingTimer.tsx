import type { TimerPhase } from "./useWritingTimer";

interface Props {
  phase: TimerPhase;
  secondsLeft: number;
}

export function WritingTimer({ phase, secondsLeft }: Props) {
  if (phase === "idle") return null;

  if (phase === "done") {
    return (
      <p className="ritual-timer ritual-timer--done" aria-live="polite">
        time
      </p>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <p
      className="ritual-timer"
      aria-live="off"
      aria-label={`${String(minutes)} minutes ${String(seconds)} seconds remaining`}
    >
      {String(minutes)}:{String(seconds).padStart(2, "0")}
    </p>
  );
}
