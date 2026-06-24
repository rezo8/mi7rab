/**
 * Browser-visible config. Only VITE_*-prefixed vars exist here.
 * In dev, VITE_API_URL is empty: the Vite proxy serves /api same-origin so the
 * auth cookies work without CORS. In prod, set it to the absolute API origin.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  // Optional ambient audio: a YouTube video/playlist id for the corner
  // mini-player. Default: Brian Eno — "Neroli (Thinking Music)". Set
  // VITE_YT_AUDIO_ID to change it, or "" to hide the player entirely.
  youtubeAudioId: import.meta.env.VITE_YT_AUDIO_ID ?? "Dl9rkLybDHw",
} as const;
