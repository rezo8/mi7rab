import { Hono } from "hono";
import type { Strategy } from "@mihrab/shared";
import { db } from "../db";
import { strategies } from "../db/schema/app";
import { cached } from "../redis/cache";
import { rateLimit } from "../middleware/rate-limit";

const DECK_KEY = "strategies:deck";
const DECK_TTL_SECONDS = 60 * 60 * 24; // 24h

/** Read the full deck from Postgres. */
async function loadDeck(): Promise<Strategy[]> {
  const rows = await db.select().from(strategies).orderBy(strategies.id);
  return rows.map((r) => ({ id: r.id, text: r.text, deck: r.deck }));
}

/** The deck, cached in Redis (random card is then chosen in-app to spare the DB). */
const getDeck = () => cached<Strategy[]>(DECK_KEY, DECK_TTL_SECONDS, loadDeck);

const router = new Hono();

router.use("*", rateLimit(60, 60));

/** GET /api/strategies/random — one card drawn from the (cached) deck. */
router.get("/random", async (c) => {
  const deck = await getDeck();
  if (deck.length === 0) {
    return c.json(
      { error: "empty_deck", message: "No strategies are seeded yet. Run `pnpm db:seed`." },
      503,
    );
  }
  const card = deck[Math.floor(Math.random() * deck.length)]!;
  return c.json(card);
});

/** GET /api/strategies — the full deck, ordered. */
router.get("/", async (c) => {
  const deck = await getDeck();
  return c.json(deck);
});

export default router;
