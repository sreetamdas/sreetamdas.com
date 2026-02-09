import { defineConfig } from "drizzle-kit";

const accountId = process.env.CF_ACCOUNT_ID;
const databaseId = process.env.CF_D1_DB_ID;
const token = process.env.CF_D1_TOKEN;

if (!accountId || !databaseId || !token) {
	throw new Error(
		"Missing CF_ACCOUNT_ID/CF_D1_DB_ID/CF_D1_TOKEN for remote D1 Studio. " +
			"Set them in your env (do not commit).",
	);
}

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle/migrations",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId,
		databaseId,
		token,
	},
});
