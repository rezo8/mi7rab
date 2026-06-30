import { Hono } from "hono";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { actors, momentActors, momentImages, moments, momentTags, tags } from "../db/schema/archive";
import { understandingEssayMoments, understandingEssays } from "../db/schema/understanding";
import type { ActorItem, MomentImage, MomentSummary, TagItem, UnderstandingEssayDetail, UnderstandingEssaySummary } from "@mihrab/shared";

const router = new Hono();

// ---------------------------------------------------------------------------
// Helpers (same pattern as moments route)
// ---------------------------------------------------------------------------

async function tagsForMoments(momentIds: string[]): Promise<Map<string, TagItem[]>> {
  if (momentIds.length === 0) return new Map();
  const rows = await db
    .select({ momentId: momentTags.momentId, id: tags.id, name: tags.name, slug: tags.slug })
    .from(momentTags)
    .innerJoin(tags, eq(tags.id, momentTags.tagId))
    .where(inArray(momentTags.momentId, momentIds))
    .orderBy(tags.name);
  const map = new Map<string, TagItem[]>();
  for (const row of rows) {
    const list = map.get(row.momentId) ?? [];
    list.push({ id: row.id, name: row.name, slug: row.slug });
    map.set(row.momentId, list);
  }
  return map;
}

async function actorsForMoments(momentIds: string[]): Promise<Map<string, ActorItem[]>> {
  if (momentIds.length === 0) return new Map();
  const rows = await db
    .select({ momentId: momentActors.momentId, id: actors.id, name: actors.name, slug: actors.slug, type: actors.type, role: momentActors.role })
    .from(momentActors)
    .innerJoin(actors, eq(actors.id, momentActors.actorId))
    .where(inArray(momentActors.momentId, momentIds))
    .orderBy(momentActors.role, actors.name);
  const map = new Map<string, ActorItem[]>();
  for (const row of rows) {
    const list = map.get(row.momentId) ?? [];
    list.push({ id: row.id, name: row.name, slug: row.slug, type: row.type, role: row.role as ActorItem["role"] });
    map.set(row.momentId, list);
  }
  return map;
}

async function imagesForMoments(momentIds: string[]): Promise<Map<string, MomentImage[]>> {
  if (momentIds.length === 0) return new Map();
  const rows = await db
    .select()
    .from(momentImages)
    .where(inArray(momentImages.momentId, momentIds))
    .orderBy(asc(momentImages.sortOrder));
  const map = new Map<string, MomentImage[]>();
  for (const row of rows) {
    const list = map.get(row.momentId) ?? [];
    list.push({ id: row.id, fileKey: row.fileKey, caption: row.caption, isCover: row.isCover, rightsStatus: row.rightsStatus, sortOrder: row.sortOrder });
    map.set(row.momentId, list);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET /api/understanding — list all essays (no body_md, lightweight). */
router.get("/", async (c) => {
  const rows = await db
    .select()
    .from(understandingEssays)
    .orderBy(asc(understandingEssays.sortOrder));

  const result: UnderstandingEssaySummary[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    hook: r.hook,
    sortOrder: r.sortOrder,
  }));

  return c.json(result);
});

/** GET /api/understanding/:id — full essay with body_md and linked moments. */
router.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [essay] = await db
    .select()
    .from(understandingEssays)
    .where(eq(understandingEssays.id, id));

  if (!essay) return c.json({ error: "not_found" }, 404);

  // Fetch linked moment ids
  const linkRows = await db
    .select({ momentId: understandingEssayMoments.momentId })
    .from(understandingEssayMoments)
    .where(eq(understandingEssayMoments.essayId, id));

  const momentIds = linkRows.map((r) => r.momentId);

  let linkedMoments: MomentSummary[] = [];
  if (momentIds.length > 0) {
    const momentRows = await db
      .select()
      .from(moments)
      .where(inArray(moments.id, momentIds))
      .orderBy(asc(moments.sortOrder));

    const ids = momentRows.map((r) => r.id);
    const [tagMap, actorMap, imageMap] = await Promise.all([
      tagsForMoments(ids),
      actorsForMoments(ids),
      imagesForMoments(ids),
    ]);

    linkedMoments = momentRows.map((r) => {
      const images = imageMap.get(r.id) ?? [];
      return {
        id: r.id,
        doorId: r.doorId,
        title: r.title,
        description: r.description,
        occurredAt: r.occurredAt,
        location: r.location,
        coverImageKey: images.find((img) => img.isCover)?.fileKey ?? null,
        sortOrder: r.sortOrder,
        tags: tagMap.get(r.id) ?? [],
        actors: actorMap.get(r.id) ?? [],
        images,
        createdAt: r.createdAt.toISOString(),
      };
    });
  }

  const detail: UnderstandingEssayDetail = {
    id: essay.id,
    title: essay.title,
    hook: essay.hook,
    bodyMd: essay.bodyMd,
    sortOrder: essay.sortOrder,
    linkedMoments,
  };

  return c.json(detail);
});

export default router;
