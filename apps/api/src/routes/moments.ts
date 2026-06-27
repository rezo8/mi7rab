import { Hono } from "hono";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { actors, momentImages, moments, momentActors, momentSources, momentTags, tags } from "../db/schema/archive";
import type { ActorItem, MomentDetail, MomentImage, MomentSource, MomentSummary, TagItem } from "@mihrab/shared";

const router = new Hono();

/** Fetch tag rows for a set of moment ids, returns a map of momentId → TagItem[]. */
async function tagsForMoments(momentIds: string[]): Promise<Map<string, TagItem[]>> {
  if (momentIds.length === 0) return new Map();

  const rows = await db
    .select({
      momentId: momentTags.momentId,
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
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

/** Fetch actor rows for a set of moment ids, returns a map of momentId → ActorItem[]. */
async function actorsForMoments(momentIds: string[]): Promise<Map<string, ActorItem[]>> {
  if (momentIds.length === 0) return new Map();

  const rows = await db
    .select({
      momentId: momentActors.momentId,
      id: actors.id,
      name: actors.name,
      slug: actors.slug,
      type: actors.type,
      role: momentActors.role,
    })
    .from(momentActors)
    .innerJoin(actors, eq(actors.id, momentActors.actorId))
    .where(inArray(momentActors.momentId, momentIds))
    .orderBy(momentActors.role, actors.name);

  const map = new Map<string, ActorItem[]>();
  for (const row of rows) {
    const list = map.get(row.momentId) ?? [];
    list.push({ id: row.id, name: row.name, slug: row.slug, type: row.type, role: row.role as ActorItem["role"] }); // role is validated at write time
    map.set(row.momentId, list);
  }
  return map;
}

/** Fetch supplementary image rows for a set of moment ids, returns a map of momentId → MomentImage[]. */
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

/**
 * GET /api/moments
 * Query params:
 *   door  — filter by door id (e.g. "grief")
 *   tag   — filter by tag slug
 */
router.get("/", async (c) => {
  const doorParam = c.req.query("door") ?? null;
  const tagParam  = c.req.query("tag")  ?? null;

  let tagId: string | null = null;
  if (tagParam) {
    const [row] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, tagParam));
    if (!row) return c.json([] satisfies MomentSummary[]);
    tagId = row.id;
  }

  const filters = [
    doorParam ? eq(moments.doorId, doorParam) : null,
    tagId ? inArray(moments.id, db.select({ id: momentTags.momentId }).from(momentTags).where(eq(momentTags.tagId, tagId))) : null,
  ].filter((f) => f !== null);

  const rows = await db
    .select()
    .from(moments)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(moments.sortOrder), asc(moments.createdAt));

  const ids = rows.map((r) => r.id);
  const [tagMap, actorMap, imageMap] = await Promise.all([
    tagsForMoments(ids),
    actorsForMoments(ids),
    imagesForMoments(ids),
  ]);

  const result: MomentSummary[] = rows.map((r) => {
    const images = imageMap.get(r.id) ?? [];
    return {
      id: r.id,
      doorId: r.doorId,
      title: r.title,
      description: r.description,
      occurredAt: r.occurredAt,
      location: r.location,
      coverImageKey: images.find(img => img.isCover)?.fileKey ?? null,
      sortOrder: r.sortOrder,
      tags: tagMap.get(r.id) ?? [],
      actors: actorMap.get(r.id) ?? [],
      images,
      createdAt: r.createdAt.toISOString(),
    };
  });

  return c.json(result);
});

/** GET /api/moments/:id — full moment detail with sources, tags, and actors. */
router.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [moment] = await db.select().from(moments).where(eq(moments.id, id));
  if (!moment) return c.json({ error: "not_found" }, 404);

  const [sourcesRaw, tagMap, actorMap, imageMap] = await Promise.all([
    db
      .select()
      .from(momentSources)
      .where(eq(momentSources.momentId, id))
      .orderBy(asc(momentSources.sortOrder)),
    tagsForMoments([id]),
    actorsForMoments([id]),
    imagesForMoments([id]),
  ]);

  const sources: MomentSource[] = sourcesRaw.map((s) => ({
    id: s.id,
    type: s.type,
    label: s.label,
    url: s.url,
    fileKey: s.fileKey,
    metadata: s.metadata,
    sortOrder: s.sortOrder,
  }));

  const images = imageMap.get(id) ?? [];
  const detail: MomentDetail = {
    id: moment.id,
    doorId: moment.doorId,
    title: moment.title,
    description: moment.description,
    occurredAt: moment.occurredAt,
    location: moment.location,
    coverImageKey: images.find(img => img.isCover)?.fileKey ?? null,
    sortOrder: moment.sortOrder,
    tags: tagMap.get(id) ?? [],
    actors: actorMap.get(id) ?? [],
    images,
    sources,
    createdAt: moment.createdAt.toISOString(),
  };

  return c.json(detail);
});

export default router;
