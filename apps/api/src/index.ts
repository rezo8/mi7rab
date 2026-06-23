import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./env";
import { auth } from "./auth";
import strategies from "./routes/strategies";

export const app = new Hono();

// Sensible security headers on every response.
app.use("*", secureHeaders());

// CORS for the browser app — exact origin allowlist, credentials enabled (cookies).
// Must be registered before the routes it protects (covers /api/auth/* too).
app.use(
  "/api/*",
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

// Better Auth owns all /api/auth/* routes (sign-up, sign-in, session, sign-out…).
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/strategies", strategies);

export default app;
