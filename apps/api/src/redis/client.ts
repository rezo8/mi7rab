import { Redis } from "ioredis";
import { env } from "../env";

/**
 * Shared Redis client: Better Auth session storage, the strategies cache, and
 * rate limiting all use this one connection. `commandTimeout` keeps a slow/dead
 * Redis from hanging requests — callers (cache, rate-limit) degrade gracefully.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  commandTimeout: 2000,
});

redis.on("error", (err) => {
  console.error("[redis]", err.message);
});
