import type { DrizzleD1Database } from "drizzle-orm/d1";

import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Db = DrizzleD1Database<typeof schema>;

export function getDb(): Db {
	return drizzle(env.D1, { schema });
}
