import { useState } from "react";
import { env } from "@/lib/env";

/**
 * Optional ambient audio: a small embedded YouTube player tucked in the corner
 * to listen to while drawing cards. Press play once and it keeps going across
 * draws (the app never reloads). The track is chosen via VITE_YT_AUDIO_ID
 * (empty hides this entirely). Uses youtube-nocookie for a lighter privacy
 * footprint.
 *
 * Prod note: if the web app ever adopts a Content-Security-Policy, allow
 * `frame-src https://www.youtube-nocookie.com`.
 */
export function BackgroundAudio() {
  const id = env.youtubeAudioId;
  const [activated, setActivated] = useState(false); // mounts the iframe once, then keeps it
  const [open, setOpen] = useState(false);

  if (!id) return null;

  // Loop a single video via the "playlist" trick.
  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?loop=1&playlist=${id}&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className={`audio${open ? " audio--open" : ""}`}>
      {activated && (
        <div className="audio-player">
          <iframe
            title="mihrab ambient audio"
            src={src}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
      <button
        type="button"
        className="control"
        onClick={() => {
          setActivated(true);
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={open ? "Hide ambient audio" : "Ambient audio to play while you draw"}
        title="Ambient audio"
      >
        <NoteIcon />
      </button>
    </div>
  );
}

function NoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
      <path d="M8.5 18V6l11-2v12" />
    </svg>
  );
}
