import { Hono } from "hono";
import { eq, max } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { pages, profiles } from "../db/schema/ritual";
import type { UserProfile } from "@mihrab/shared";

const router = new Hono();

/** GET /api/profile — current user's profile + most recent page timestamp. */
router.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: "unauthorized" }, 401);

  const userId = session.user.id;

  // Ensure a profile row exists (idempotent on repeat calls).
  await db.insert(profiles).values({ userId }).onConflictDoNothing();

  const [profile] = await db
    .select({ hasEnteredBefore: profiles.hasEnteredBefore })
    .from(profiles)
    .where(eq(profiles.userId, userId));

  const [latestPage] = await db
    .select({ lastPageAt: max(pages.createdAt) })
    .from(pages)
    .where(eq(pages.userId, userId));

  return c.json({
    hasEnteredBefore: profile?.hasEnteredBefore ?? false,
    lastPageAt: latestPage?.lastPageAt?.toISOString() ?? null,
  } satisfies UserProfile);
});

export default router;
