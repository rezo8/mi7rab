import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/**
 * Programmatic migrator — used on production boot (`node dist/db/migrate.js`)
 * before the server starts. Local dev uses `pnpm db:migrate` (drizzle-kit).
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: "./drizzle" });
await pool.end();
console.log("✓ migrations applied");
