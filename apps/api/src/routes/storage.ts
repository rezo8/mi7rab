import { Hono } from "hono";
import { auth } from "../auth";
import { getSignedDownloadUrl } from "../lib/storage";

const router = new Hono();

/**
 * GET /api/storage/:key/url
 * Returns a signed download URL (1-hour TTL) for a GCS object.
 * Requires authentication — images are never publicly exposed.
 * :key is the fileKey path (e.g. "knowledge/sykes-picot.webp").
 */
router.get("/:door/:filename/url", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: "unauthorized" }, 401);

  const fileKey = `${c.req.param("door")}/${c.req.param("filename")}`;

  try {
    const url = await getSignedDownloadUrl(fileKey);
    return c.json({ url, expiresIn: 3600 });
  } catch (err) {
    console.error("signed URL error:", err);
    return c.json({ error: "storage_unavailable" }, 503);
  }
});

export default router;
