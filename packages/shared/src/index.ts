/**
 * Shared API contract types between the mihrab backend (apps/api) and web (apps/web).
 * Keep this dependency-free — it is consumed as raw TypeScript source by both apps.
 */

/** A single Oblique Strategy card. */
export interface Strategy {
  id: number;
  text: string;
  /** Deck identifier, e.g. "eno-schmidt". */
  deck: string;
}

/** Standard JSON error body returned by the API. */
export interface ApiErrorBody {
  error: string;
  message?: string;
}
