import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env";
import * as appSchema from "./schema/app";
import * as authSchema from "./schema/auth";

/** Shared connection pool. node-postgres plays nicely with managed poolers. */
export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema: { ...appSchema, ...authSchema } });

export type Db = typeof db;
