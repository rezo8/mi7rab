import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useStrategy } from "@/features/oblique/useStrategy";
import { StrategyCard } from "@/features/oblique/StrategyCard";
import { DrawButton } from "@/features/oblique/DrawButton";
import { useProfile } from "./useProfile";
import { useWritingTimer } from "./useWritingTimer";
import { useRitual } from "./useRitual";
import { WritingArea } from "./WritingArea";
import { WritingTimer } from "./WritingTimer";
import { KeyRevealModal } from "./KeyRevealModal";
import { RoomScene } from "@/features/room/RoomScene";

type UiState = "loading" | "entered" | "strategy" | "writing";

const MAX_REDRAWS = 2;

export function RitualScreen() {
  const { data: session, isPending: sessionPending } = useSession();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  const { writtenToday, isPending: profilePending, invalidate } = useProfile();
  const { data: strategyData, isPending: stratPending, isError: stratError, isFetching: stratFetching, refetch: refetchStrategy } = useStrategy();

  const [uiState, setUiState] = useState<UiState>("loading");
  const [text, setText] = useState("");
  const [redraws, setRedraws] = useState(0);
  const [showMaxRedraws, setShowMaxRedraws] = useState(false);
  const [usedStrategyIds, setUsedStrategyIds] = useState<number[]>([]);
  const [wuduCollapsed, setWuduCollapsed] = useState(false);
  const ritualTrackedRef = useRef(false);
  const maxRedrawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useWritingTimer();
  const isDone = uiState === "writing" && timer.phase === "done";

  const ritual = useRitual({
    onSaved: () => {
      invalidate();
      timer.reset();
      setText("");
      setRedraws(0);
      setShowMaxRedraws(false);
      setUsedStrategyIds([]);
      setWuduCollapsed(false);
      ritualTrackedRef.current = false;
      setUiState("entered");
    },
  });

  // Capture the initial strategy ID when first entering a ritual session.
  useEffect(() => {
    if (!ritualTrackedRef.current && strategyData?.id != null && uiState === "strategy") {
      ritualTrackedRef.current = true;
      setUsedStrategyIds([strategyData.id]);
    }
  }, [strategyData?.id, uiState]);

  // Auth guard — redirect if not signed in.
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      void navigate({ to: "/sign-in" });
    }
  }, [sessionPending, session, navigate]);

  // Derive initial screen once the profile loads.
  useEffect(() => {
    if (profilePending || !session?.user) return;
    setUiState(writtenToday ? "entered" : "strategy");
  }, [profilePending, writtenToday, session?.user]);

  const handleFirstInput = useCallback(() => {
    if (uiState !== "strategy") return;
    setUiState("writing");
    timer.onFirstInput();
  }, [uiState, timer]);

  const handleRedraw = useCallback(async () => {
    if (redraws >= MAX_REDRAWS) {
      setShowMaxRedraws(true);
      if (maxRedrawTimerRef.current) clearTimeout(maxRedrawTimerRef.current);
      maxRedrawTimerRef.current = setTimeout(() => setShowMaxRedraws(false), 3500);
      return;
    }
    setShowMaxRedraws(false);
    setRedraws((r) => r + 1);
    const result = await refetchStrategy();
    if (result.data?.id != null) {
      setUsedStrategyIds((ids) => [...ids, result.data!.id]);
    }
  }, [redraws, refetchStrategy]);

  const handleDiscard = useCallback(() => {
    invalidate();
    timer.reset();
    setText("");
    setRedraws(0);
    setShowMaxRedraws(false);
    setUsedStrategyIds([]);
    setWuduCollapsed(false);
    ritualTrackedRef.current = false;
    setUiState("entered");
  }, [invalidate, timer]);

  const handleSave = useCallback(() => {
    void ritual.save(text, usedStrategyIds);
  }, [ritual, text, usedStrategyIds]);

  const handleStartAnother = useCallback(() => {
    timer.reset();
    setText("");
    setRedraws(0);
    setShowMaxRedraws(false);
    setUsedStrategyIds([]);
    setWuduCollapsed(false);
    ritualTrackedRef.current = false;
    void refetchStrategy();
    setUiState("strategy");
  }, [timer, refetchStrategy]);

  // Cleanup max-redraws timer on unmount.
  useEffect(() => {
    return () => {
      if (maxRedrawTimerRef.current) clearTimeout(maxRedrawTimerRef.current);
    };
  }, []);

  if (sessionPending || profilePending || uiState === "loading") return null;
  if (!session?.user) return null;

  // ── Entered (written today — the eight doors) ──────────────────────────
  if (uiState === "entered") {
    return <RoomScene onWriteAnother={handleStartAnother} />;
  }

  // ── Shared: strategy card mini-header (writing phase) ───────────────────
  const isWriting = uiState === "writing";

  return (
    <>
      <main
        id="main"
        className={isWriting || wuduCollapsed ? "page page--ritual" : "page"}
        data-phase={uiState}
      >
        <nav className="corner corner--right">
          <button type="button" className="link-quiet" onClick={() => void signOut()}>
            sign out
          </button>
        </nav>

        <p className="wordmark">mihrab</p>

        {/* Strategy card — stays visible throughout the ritual */}
        <StrategyCard
          strategy={strategyData}
          isLoading={stratPending}
          isError={stratError}
          isFetching={stratFetching}
          reducedMotion={reducedMotion}
          fullscreen={false}
        />

        {/* Wudu: visible until user clicks begin or focuses the textarea */}
        {!isWriting && !wuduCollapsed && (
          <>
            <section className="ritual-wudu" aria-label="Writing ritual">
              <p className="ritual-wudu-lead">
                Three minutes<br />
                of uninterrupted<br />
                writing.
              </p>
              <div className="ritual-wudu-columns">
                <div className="ritual-wudu-verse">
                  <p className="ritual-wudu-stanza">
                    Best done<br />
                    at the start of the day<br />
                    they say
                  </p>
                  <p className="ritual-wudu-stanza">
                    Not what you planned <br />
                    but what arrived <br />
                  </p>
                  <p className="ritual-wudu-stanza">
                    Maybe it spews <br />
                    Maybe it flows <br />
                    Maybe it falls <br />
                    Maybe it lands.
                  </p>
                  <p className="ritual-wudu-stanza">
                    Maybe it may be <br />
                    just what you were looking for.
                  </p>
                  <p className="ritual-wudu-stanza">
                    Only one way to find out <br />
                    Clock starts when you do
                  </p>
                </div>
                <div className="ritual-privacy" role="note">
                  <p className="ritual-privacy-heading">Privacy</p>
                  <p className="ritual-privacy-body">
                    Only your secret key can unlock your pages.<br />
                    Without it, they remain unreadable forever.
                  </p>
                  <p className="ritual-privacy-body">Do what you will with yours.</p>
                  <p className="ritual-privacy-body">Me?</p>
                  <p className="ritual-privacy-body">I ate mine.</p>
                </div>
              </div>
            </section>
            <label
              className="ritual-begin"
              htmlFor="ritual-text"
              onClick={() => setWuduCollapsed(true)}
            >
              begin.
            </label>
          </>
        )}

        {/* Below-card controls: timer + redraw (writing), save/discard (done) */}
        {isWriting && !isDone && (
          <div className="ritual-controls">
            <WritingTimer phase={timer.phase} secondsLeft={timer.secondsLeft} />
            <div className="ritual-draw-area">
              {showMaxRedraws ? (
                <p className="ritual-max-redraws">
                  you can't always get what you want.
                </p>
              ) : (
                <DrawButton onDraw={() => void handleRedraw()} isFetching={stratFetching} />
              )}
            </div>
          </div>
        )}

        {isDone && (
          <div className="ritual-actions">
            <p className="ritual-actions-text">
              Save your pages — they&apos;ll be encrypted and kept.
              <br />
              Or let them go — the writing still happened.
            </p>
            <button
              type="button"
              className="btn"
              disabled={ritual.isSaving}
              onClick={handleSave}
            >
              {ritual.isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="link-quiet"
              disabled={ritual.isSaving}
              onClick={handleDiscard}
            >
              Discard
            </button>
            {ritual.error && (
              <p className="form-error" role="alert">
                {ritual.error}
              </p>
            )}
          </div>
        )}

        {/* Writing area — grows to fill remaining space below */}
        <WritingArea
          value={text}
          onChange={setText}
          onFirstInput={handleFirstInput}
          onFocus={() => setWuduCollapsed(true)}
        />
      </main>

      {ritual.showKeyModal && ritual.pendingPhrase && (
        <KeyRevealModal
          phrase={ritual.pendingPhrase}
          onConfirm={() => void ritual.confirmKeyAndSave()}
          onDismiss={ritual.dismissKeyModal}
          isBusy={ritual.isSaving}
        />
      )}
    </>
  );
}
