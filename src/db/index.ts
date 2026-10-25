import "@tanstack/react-start/server-only";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

export type Db = DrizzleD1Database;

export function getDb(): Db {
	return drizzle(env.D1);
}
