import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/lib/domains/db/schema.ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CF_ACCOUNT_ID!,
		databaseId: process.env.CF_D1_DB_ID!,
		token: process.env.CF_D1_TOKEN!,
	},
	verbose: true,
	strict: true,
});
