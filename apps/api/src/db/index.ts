import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env";
import * as strategiesSchema from "./schema/strategies";
import * as ritualSchema from "./schema/ritual";
import * as archiveSchema from "./schema/archive";
import * as authSchema from "./schema/auth";
import * as understandingSchema from "./schema/understanding";

/** Shared connection pool. node-postgres plays nicely with managed poolers. */
export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, {
  schema: { ...strategiesSchema, ...ritualSchema, ...archiveSchema, ...authSchema, ...understandingSchema },
});

export type Db = typeof db;
