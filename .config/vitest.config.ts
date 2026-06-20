import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
	root: projectRoot,
	plugins: [
		cloudflareTest({
			wrangler: {
				configPath: fileURLToPath(new URL("../wrangler.test.jsonc", import.meta.url)),
			},
		}),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("../src", import.meta.url)),
		},
	},
	test: {
		include: ["src/**/*.worker.spec.ts"],
		exclude: ["e2e/**", "node_modules", "dist", ".content-collections"],
	},
});
