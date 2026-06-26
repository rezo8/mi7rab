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
        className={isWriting ? "page page--ritual" : "page"}
        data-phase={uiState}
      >
        <nav className="corner corner--right">
          <button type="button" className="link-quiet" onClick={() => void signOut()}>
            sign out
          </button>
        </nav>

        <p className="wordmark">mihrab</p>

        {/* Strategy phase: full card + wudu section */}
        {!isWriting && (
          <>
            <StrategyCard
              strategy={strategyData}
              isLoading={stratPending}
              isError={stratError}
              isFetching={stratFetching}
              reducedMotion={reducedMotion}
              fullscreen={false}
            />
            <section className="ritual-wudu" aria-labelledby="ritual-wudu-heading">
              <p className="ritual-wudu-heading" id="ritual-wudu-heading">
                Before you enter
              </p>
              <p className="ritual-wudu-body">
                Julia Cameron called them morning pages — three minutes of unfiltered writing
                at the start of the day. Not a draft. Not an essay. A braindump: whatever is
                in the mind, poured out without editing or judgement.
              </p>
              <p className="ritual-wudu-body">
                This is the cleansing. One must first empty the mind before entering. Write
                anything. The clock starts when you do.
              </p>
            </section>
          </>
        )}

        {/* Writing phase: compact strategy reference */}
        {isWriting && strategyData && (
          <p className="ritual-strategy-mini" aria-label="Your prompt">
            {strategyData.text}
          </p>
        )}

        {/* Writing area — present in both strategy and writing phases */}
        <WritingArea value={text} onChange={setText} onFirstInput={handleFirstInput} />

        {/* Timer — visible once writing begins */}
        {isWriting && !isDone && (
          <WritingTimer phase={timer.phase} secondsLeft={timer.secondsLeft} />
        )}

        {/* Draw button — up to 3 redraws during writing (before timer is done) */}
        {isWriting && !isDone && (
          <div className="ritual-draw-area">
            {showMaxRedraws ? (
              <p className="ritual-max-redraws">
                no, you can't always get what you want.
              </p>
            ) : (
              <DrawButton onDraw={() => void handleRedraw()} isFetching={stratFetching} />
            )}
          </div>
        )}

        {/* Post-timer: save or discard */}
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
