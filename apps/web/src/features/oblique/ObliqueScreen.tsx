import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { useStrategy } from "./useStrategy";
import { StrategyCard } from "./StrategyCard";
import { DrawButton } from "./DrawButton";

const SHUFFLE_MS = 90_000; // auto-advance interval

export function ObliqueScreen() {
  const reducedMotion = usePrefersReducedMotion();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { data, isPending, isError, isFetching, refetch } = useStrategy();
  const { data: session } = useSession();

  const [isPaused, setIsPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // bumps reset the countdown/timer
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Advance to the next card and reset the countdown (manual or automatic).
  const advance = useCallback(() => {
    setCycle((c) => c + 1);
    void refetch();
  }, [refetch]);

  const togglePause = useCallback(() => {
    const resuming = isPausedRef.current;
    setIsPaused(!isPausedRef.current);
    if (resuming) setCycle((c) => c + 1); // resume → fresh 90s
  }, []);

  // Auto-shuffle every 90s unless paused; restarts whenever the card changes.
  useEffect(() => {
    if (isPaused) return;
    const id = window.setTimeout(advance, SHUFFLE_MS);
    return () => window.clearTimeout(id);
  }, [isPaused, cycle, advance]);

  // Projection-friendly keys: f = fullscreen, p = pause, n / → = next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "p") {
        e.preventDefault();
        togglePause();
      } else if (e.key === "n" || e.key === "ArrowRight") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen, togglePause, advance]);

  return (
    <main id="main" className={`page${isFullscreen ? " page--fullscreen" : ""}`}>
      <nav className="corner corner--left">
        <button
          type="button"
          className="control"
          onClick={toggleFullscreen}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}
        >
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </nav>

      <nav className="corner corner--right">
        {session?.user ? (
          <button type="button" className="link-quiet" onClick={() => void signOut()}>
            sign out
          </button>
        ) : (
          <Link to="/sign-in" className="link-quiet">
            sign in
          </Link>
        )}
      </nav>

      <p className="wordmark">mihrab</p>

      <StrategyCard
        strategy={data}
        isLoading={isPending}
        isError={isError}
        isFetching={isFetching}
        reducedMotion={reducedMotion}
        fullscreen={isFullscreen}
      />

      <div className="page-foot">
        <div className="controls">
          <button
            type="button"
            className="control"
            onClick={togglePause}
            aria-pressed={isPaused}
            aria-label={isPaused ? "Resume auto-shuffle" : "Pause auto-shuffle"}
            title={isPaused ? "Resume (p)" : "Pause auto-shuffle (p)"}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
          <DrawButton onDraw={advance} isFetching={isFetching} />
        </div>

        <div className="countdown" data-paused={isPaused ? "true" : undefined} aria-hidden="true">
          <span
            key={cycle}
            className="countdown-fill"
            style={{
              animationDuration: `${SHUFFLE_MS}ms`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>

        <p className="attrib">Oblique Strategies · Brian Eno &amp; Peter Schmidt</p>
      </div>
    </main>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 5l11 7-11 7z" />
    </svg>
  );
}
