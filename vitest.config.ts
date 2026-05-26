import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: {
				configPath: "./wrangler.test.jsonc",
			},
		}),
	],
	test: {
		include: ["src/**/*.worker.spec.ts"],
		exclude: ["e2e/**", "node_modules", "dist", ".content-collections"],
	},
});
