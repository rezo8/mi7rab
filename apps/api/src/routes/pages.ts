import { Hono } from "hono";
import { z } from "zod";
import { asc, and, eq, inArray } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { pages, profiles } from "../db/schema/ritual";
import { strategies } from "../db/schema/strategies";
import type { SavePageBody, SavedPage, PageSummary, PageDetail } from "@mihrab/shared";

const savePageSchema = z.object({
  ciphertext: z.string().min(1),
  iv: z.string().min(1),
  strategyIds: z.array(z.number().int().positive()).optional(),
});

const router = new Hono();

/** POST /api/pages — save an encrypted page for the current user. */
router.post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: "unauthorized" }, 401);

  const userId = session.user.id;

  const body = await c.req.json<SavePageBody>();
  const result = savePageSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "invalid_body", message: "ciphertext and iv are required non-empty strings" },
      400,
    );
  }

  const { ciphertext, iv, strategyIds } = result.data;

  const [page] = await db
    .insert(pages)
    .values({ userId, ciphertext, iv, strategyIds: strategyIds ?? [] })
    .returning({ id: pages.id, createdAt: pages.createdAt });

  // Mark that this user has now set up their key and saved at least one page.
  await db
    .insert(profiles)
    .values({ userId, hasEnteredBefore: true })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { hasEnteredBefore: true },
    });

  return c.json(
    { id: page!.id, createdAt: page!.createdAt.toISOString() } satisfies SavedPage,
    201,
  );
});

/** GET /api/pages — list all pages for the current user, oldest first. */
router.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: "unauthorized" }, 401);

  const rows = await db
    .select({ id: pages.id, createdAt: pages.createdAt })
    .from(pages)
    .where(eq(pages.userId, session.user.id))
    .orderBy(asc(pages.createdAt));

  return c.json(
    rows.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString() })) satisfies PageSummary[],
  );
});

/** GET /api/pages/:id — fetch a single page (ciphertext + all strategy texts) for the current user. */
router.get("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: "unauthorized" }, 401);

  const [row] = await db
    .select({
      id: pages.id,
      ciphertext: pages.ciphertext,
      iv: pages.iv,
      createdAt: pages.createdAt,
      strategyIds: pages.strategyIds,
    })
    .from(pages)
    .where(and(eq(pages.id, c.req.param("id")), eq(pages.userId, session.user.id)));

  if (!row) return c.json({ error: "not_found" }, 404);

  let strategyTexts: string[] = [];
  const ids = row.strategyIds ?? [];
  if (ids.length > 0) {
    const strategyRows = await db
      .select({ id: strategies.id, text: strategies.text })
      .from(strategies)
      .where(inArray(strategies.id, ids));
    const byId = new Map(strategyRows.map((s) => [s.id, s.text]));
    strategyTexts = ids.map((id) => byId.get(id)).filter((t): t is string => t != null);
  }

  return c.json({
    id: row.id,
    ciphertext: row.ciphertext,
    iv: row.iv,
    createdAt: row.createdAt.toISOString(),
    strategyTexts,
  } satisfies PageDetail);
});

export default router;
