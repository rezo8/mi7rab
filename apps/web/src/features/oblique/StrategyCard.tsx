import type { Strategy } from "@mihrab/shared";
import { useFitText } from "./useFitText";

interface Props {
  strategy?: Strategy;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  reducedMotion: boolean;
  fullscreen: boolean;
}

/** The lit recess: a fixed-shape niche holding one auto-fit aphorism. */
export function StrategyCard({
  strategy,
  isLoading,
  isError,
  isFetching,
  reducedMotion,
  fullscreen,
}: Props) {
  const { containerRef, textRef } = useFitText(strategy?.text ?? "", fullscreen ? 10 : 2.9);

  return (
    <article className="niche" aria-busy={isLoading || isFetching}>
      <div
        className="recess"
        ref={containerRef}
        data-fetching={isFetching && !isLoading ? "true" : undefined}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? (
          <div className="skeleton" aria-hidden="true">
            <span className="skeleton-line" style={{ width: "92%" }} />
            <span className="skeleton-line" style={{ width: "74%" }} />
            <span className="skeleton-line" style={{ width: "45%" }} />
          </div>
        ) : isError ? (
          <p className="aphorism aphorism--error" role="alert">
            The deck is just out of reach. Try drawing again.
          </p>
        ) : strategy ? (
          <blockquote
            ref={textRef}
            key={reducedMotion ? "static" : strategy.id}
            className="aphorism"
            data-enter={reducedMotion ? undefined : ""}
          >
            {strategy.text}
          </blockquote>
        ) : (
          <p className="aphorism aphorism--empty">No card surfaced. Draw again to turn the deck.</p>
        )}
      </div>

      <footer className="niche-attribution">
        Oblique Strategies · Brian Eno &amp; Peter Schmidt
      </footer>

      <div className="rhythm" aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </article>
  );
}
