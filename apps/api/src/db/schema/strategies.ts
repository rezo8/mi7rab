import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
