import { Hono } from "hono";
import { db } from "../db";
import { tags } from "../db/schema/archive";
import type { TagItem } from "@mihrab/shared";

const router = new Hono();

/** GET /api/tags — full tag vocabulary, alphabetical. */
router.get("/", async (c) => {
  const rows = await db.select().from(tags).orderBy(tags.name);
  return c.json(rows satisfies TagItem[]);
});

export default router;
