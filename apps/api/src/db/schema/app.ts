import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

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
