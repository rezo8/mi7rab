import { sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Strategy } from "@mihrab/shared";
import { db } from "../db";
import { strategies } from "../db/schema/app";

const router = new Hono();

/** GET /api/strategies/random — one card, drawn from Postgres. */
router.get("/random", async (c) => {
  const rows = await db.select().from(strategies).orderBy(sql`random()`).limit(1);
  const card = rows[0];
  if (!card) {
    return c.json(
      { error: "empty_deck", message: "No strategies are seeded yet. Run `pnpm db:seed`." },
      503,
    );
  }
  const body: Strategy = { id: card.id, text: card.text, deck: card.deck };
  return c.json(body);
});

/** GET /api/strategies — the full deck, ordered. */
router.get("/", async (c) => {
  const rows = await db.select().from(strategies).orderBy(strategies.id);
  const body: Strategy[] = rows.map((r) => ({ id: r.id, text: r.text, deck: r.deck }));
  return c.json(body);
});

export default router;
