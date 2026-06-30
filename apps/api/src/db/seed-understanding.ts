/**
 * Seed script for the Understanding door — 3 essays (lenses).
 * Idempotent: deletes and reinserts all Understanding essays.
 *
 * Usage (from apps/api/):
 *   pnpm db:seed-understanding
 */

import "dotenv/config";
import { db, pool } from "./index";
import { understandingEssays } from "./schema/understanding";

interface EssayDef {
  title: string;
  hook: string | null;
  bodyMd: string | null;
  sortOrder: number;
}

const ESSAYS: EssayDef[] = [
  {
    sortOrder: 1,
    title: "The Structure & Its Engine",
    hook: null,
    bodyMd: null,
  },
  {
    sortOrder: 2,
    title: "The Apparatus of Unseeing",
    hook: null,
    bodyMd: null,
  },
  {
    sortOrder: 3,
    title: "The Spectacle",
    hook: null,
    bodyMd: null,
  },
];

async function main() {
  console.log("Seeding Understanding door…\n");

  console.log("  Clearing existing Understanding essays…");
  const deleted = await db.delete(understandingEssays).returning({ id: understandingEssays.id });
  console.log(`  ${deleted.length} essays cleared.`);

  console.log("  Inserting 3 essays…");
  for (const def of ESSAYS) {
    await db.insert(understandingEssays).values({
      title: def.title,
      hook: def.hook,
      bodyMd: def.bodyMd,
      sortOrder: def.sortOrder,
    });
    console.log(`    [${def.sortOrder}] ${def.title}`);
  }

  console.log("\nUnderstanding door seeded successfully.");
  console.log("(hook and body_md are null — fill them in when the essays are written.)");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => pool.end());
