import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Db = DrizzleD1Database<typeof schema>;

export function getDb(env: CloudflareEnv): Db {
	return drizzle(env.D1, { schema });
}
