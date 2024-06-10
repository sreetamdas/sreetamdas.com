import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function getDB() {
	console.log("Getting DB");

	try {
		const { env } = getRequestContext();

		return drizzle(env.D1_DB, { schema });
	} catch (error) {
		console.error({ error });
		return;
	}
}
