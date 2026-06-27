import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

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
