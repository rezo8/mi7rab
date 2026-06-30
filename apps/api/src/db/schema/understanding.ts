import { integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { moments } from "./archive";

/** Long-form Understanding door essays — standalone, not FK'd to a single moment. */
export const understandingEssays = pgTable("understanding_essays", {
  id:        uuid("id").primaryKey().defaultRandom(),
  title:     text("title").notNull(),
  hook:      text("hook"),
  bodyMd:    text("body_md"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UnderstandingEssayRow = typeof understandingEssays.$inferSelect;
export type NewUnderstandingEssayRow = typeof understandingEssays.$inferInsert;

/** Many-to-many: links an Understanding essay to Knowledge moments it references. */
export const understandingEssayMoments = pgTable(
  "understanding_essay_moments",
  {
    essayId:  uuid("essay_id")
      .notNull()
      .references(() => understandingEssays.id, { onDelete: "cascade" }),
    momentId: uuid("moment_id")
      .notNull()
      .references(() => moments.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.essayId, t.momentId] })],
);
