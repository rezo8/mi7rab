import { boolean, check, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

const VALID_DOOR_IDS = [
  "knowledge", "understanding", "grief", "joy",
  "safety", "chaos", "strength", "hope",
] as const;

export type DoorId = (typeof VALID_DOOR_IDS)[number];

/**
 * Application tables (hand-written). Better Auth's tables live in the generated
 * `auth.ts` alongside this file. The Oblique Strategies deck is the first table —
 * it proves the Postgres + Drizzle + migrate + seed pipeline end to end.
 */
export const strategies = pgTable(
  "strategies",
  {
    id: serial("id").primaryKey(),
    text: text("text").notNull(),
    deck: text("deck").notNull().default("eno-schmidt"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Makes seeding idempotent: re-running the seed inserts nothing new.
    uniqueIndex("strategies_text_deck_uq").on(t.text, t.deck),
  ],
);

export type StrategyRow = typeof strategies.$inferSelect;
export type NewStrategyRow = typeof strategies.$inferInsert;

/** One row per user; tracks whether they've set up their encryption key. */
export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  hasEnteredBefore: boolean("has_entered_before").notNull().default(false),
});

export type ProfileRow = typeof profiles.$inferSelect;

/** Encrypted morning pages. ciphertext and iv are base64-encoded. */
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ciphertext: text("ciphertext").notNull(),
  iv: text("iv").notNull(),
  strategyIds: integer("strategy_ids").array().notNull().default(sql`'{}'::integer[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PageRow = typeof pages.$inferSelect;

// ---------------------------------------------------------------------------
// Shared cultural archive
// ---------------------------------------------------------------------------

const DOOR_CHECK = sql`door_id IN ('knowledge','understanding','grief','joy','safety','chaos','strength','hope')`;

/** A cultural moment tied to one of the eight doors. */
export const moments = pgTable(
  "moments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doorId: text("door_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    occurredAt: text("occurred_at"),
    location: text("location"),
    coverImageKey: text("cover_image_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  () => [check("moments_door_id_check", DOOR_CHECK)],
);

export type MomentRow = typeof moments.$inferSelect;
export type NewMomentRow = typeof moments.$inferInsert;

const SOURCE_TYPES = ["link", "book", "article", "video", "audio", "file", "quote"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/** A source attached to a moment — link, scanned file, quote, etc. */
export const momentSources = pgTable("moment_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  momentId: uuid("moment_id")
    .notNull()
    .references(() => moments.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("link"),
  label: text("label").notNull(),
  url: text("url"),
  fileKey: text("file_key"),
  metadata: jsonb("metadata"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MomentSourceRow = typeof momentSources.$inferSelect;
export type NewMomentSourceRow = typeof momentSources.$inferInsert;

/** Global tag vocabulary — shared across all doors. */
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
  },
);

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;

/** Many-to-many junction between moments and tags. */
export const momentTags = pgTable(
  "moment_tags",
  {
    momentId: uuid("moment_id")
      .notNull()
      .references(() => moments.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.momentId, t.tagId] })],
);
