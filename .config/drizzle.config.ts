import { defineConfig } from "drizzle-kit";
import path from "node:path";

const projectRoot = process.cwd();

export default defineConfig({
	schema: path.join(projectRoot, "src/db/schema.ts"),
	out: path.join(projectRoot, "drizzle/migrations"),
	dialect: "sqlite",
});
