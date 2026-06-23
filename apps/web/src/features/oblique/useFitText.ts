import { useLayoutEffect, useRef } from "react";

const MIN_REM = 1.35; // floor — the longest cards

/**
 * Sizes the aphorism's font to fill the fixed-height niche without overflowing:
 * big for short / 2-line cards, smaller for long ones, so the card stays a
 * constant shape across every draw. `maxRem` is the ceiling (raised in
 * fullscreen for wall projection). Re-fits on text, ceiling, or resize change.
 */
export function useFitText(text: string, maxRem = 2.9) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLQuoteElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    const fit = () => {
      const avail = container.clientHeight;
      if (avail <= 0) return;
      // Binary-search the largest font size that fits the fixed box height.
      let lo = MIN_REM;
      let hi = Math.max(MIN_REM, maxRem);
      for (let i = 0; i < 9; i++) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = `${mid}rem`;
        if (el.scrollHeight <= avail) lo = mid;
        else hi = mid;
      }
      el.style.fontSize = `${lo}rem`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text, maxRem]);

  return { containerRef, textRef };
}
