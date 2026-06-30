import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "@hono/node-server/serve-static";
import { env } from "./env";
import { auth } from "./auth";
import strategies from "./routes/strategies";
import profile from "./routes/profile";
import pages from "./routes/pages";
import moments from "./routes/moments";
import tags from "./routes/tags";
import storage from "./routes/storage";
import understanding from "./routes/understanding";

export const app = new Hono();

// Sensible security headers on every response.
app.use("*", secureHeaders());

// TODO: lock down to env.CORS_ORIGINS allowlist once the domain is stable
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

// Better Auth owns all /api/auth/* routes (sign-up, sign-in, session, sign-out…).
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/strategies", strategies);
app.route("/api/profile", profile);
app.route("/api/pages", pages);
app.route("/api/moments", moments);
app.route("/api/tags", tags);
app.route("/api/storage", storage);
app.route("/api/understanding", understanding);

if (env.NODE_ENV === "production") {
  // Hashed asset files — browsers can cache these aggressively
  app.use("/assets/*", serveStatic({ root: "./web-dist" }));
  // SPA fallback — client-side router handles all non-API paths
  app.use("*", serveStatic({ path: "./web-dist/index.html" }));
}

export default app;
