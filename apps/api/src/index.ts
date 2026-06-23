import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./env";
import strategies from "./routes/strategies";

export const app = new Hono();

// Sensible security headers on every response.
app.use("*", secureHeaders());

// CORS for the browser app — exact origin allowlist, credentials enabled (cookies).
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

app.route("/api/strategies", strategies);

export default app;
