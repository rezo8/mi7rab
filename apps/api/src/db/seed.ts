import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { strategies } from "./schema/app";

interface DeckFile {
  deck: string;
  authors: string;
  source: string;
  cards: string[];
}

const here = dirname(fileURLToPath(import.meta.url));
const deckPath = join(here, "../data/oblique-strategies.json");
const file = JSON.parse(readFileSync(deckPath, "utf8")) as DeckFile;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { strategies } });

const rows = file.cards.map((text) => ({ text, deck: file.deck }));

// Idempotent thanks to the unique (text, deck) index.
await db.insert(strategies).values(rows).onConflictDoNothing();

const [stats] = await db
  .select({ count: sql<number>`count(*)::int` })
  .from(strategies);

console.log(
  `✓ seeded "${file.deck}" (${file.cards.length} cards in file); strategies in DB: ${stats?.count ?? 0}`,
);

await pool.end();
