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

/** User profile — `lastPageAt` is a UTC ISO string or null if no pages saved yet. */
export interface UserProfile {
  hasEnteredBefore: boolean;
  lastPageAt: string | null;
}

/** Body sent when saving an encrypted page. */
export interface SavePageBody {
  ciphertext: string;
  iv: string;
  strategyIds?: number[];
}

/** Response from a successful page save. */
export interface SavedPage {
  id: string;
  createdAt: string;
}

/** A page summary returned in the list endpoint. */
export interface PageSummary {
  id: string;
  createdAt: string;
}

/** Full page detail (includes ciphertext) returned by the single-page endpoint. */
export interface PageDetail {
  id: string;
  ciphertext: string;
  iv: string;
  createdAt: string;
  strategyTexts: string[];
}

// ---------------------------------------------------------------------------
// Shared cultural archive
// ---------------------------------------------------------------------------

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

export interface MomentSource {
  id: string;
  type: string;
  label: string;
  url: string | null;
  fileKey: string | null;
  metadata: unknown;
  sortOrder: number;
}

export interface ActorItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  role: "criminal" | "victim" | "documenter" | "adjudicator" | "supplier";
}

export interface MomentImage {
  id: string;
  fileKey: string;
  caption: string | null;
  isCover: boolean;
  rightsStatus: string;
  sortOrder: number;
}

export interface MomentSummary {
  id: string;
  doorId: string;
  title: string;
  description: string | null;
  occurredAt: string | null;
  location: string | null;
  /** Derived from images — the fileKey of the image with isCover=true, or null. */
  coverImageKey: string | null;
  sortOrder: number;
  tags: TagItem[];
  actors: ActorItem[];
  images: MomentImage[];
  createdAt: string;
}

export interface MomentDetail extends MomentSummary {
  sources: MomentSource[];
}

// ---------------------------------------------------------------------------
// Understanding door
// ---------------------------------------------------------------------------

export interface UnderstandingEssaySummary {
  id: string;
  title: string;
  hook: string | null;
  sortOrder: number;
}

export interface UnderstandingEssayDetail extends UnderstandingEssaySummary {
  bodyMd: string | null;
  linkedMoments: MomentSummary[];
}
