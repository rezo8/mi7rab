import { check, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const VALID_DOOR_IDS = [
  "knowledge", "understanding", "grief", "joy",
  "safety", "chaos", "strength", "hope",
] as const;

export type DoorId = (typeof VALID_DOOR_IDS)[number];

export const SOURCE_TYPES = ["link", "book", "article", "video", "audio", "file", "quote"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

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
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

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
