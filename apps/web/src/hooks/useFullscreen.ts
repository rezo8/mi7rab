import { useCallback, useEffect, useState } from "react";

/** Toggle/track real browser fullscreen (for projecting mihrab on a wall). */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && document.fullscreenElement !== null,
  );

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen().catch(() => {
        /* denied or unsupported — ignore */
      });
    }
  }, []);

  return { isFullscreen, toggle };
}
