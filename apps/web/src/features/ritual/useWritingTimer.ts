import { useCallback, useEffect, useRef, useState } from "react";

export const TIMER_SECONDS = 180; // 3 minutes

export type TimerPhase = "idle" | "running" | "done";

export interface WritingTimer {
  phase: TimerPhase;
  secondsLeft: number;
  onFirstInput: () => void;
  reset: () => void;
}

export function useWritingTimer(): WritingTimer {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const onFirstInput = useCallback(() => {
    setPhase((current) => {
      if (current !== "idle") return current;
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearTimer();
            setPhase("done");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return "running";
    });
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setSecondsLeft(TIMER_SECONDS);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return { phase, secondsLeft, onFirstInput, reset };
}
