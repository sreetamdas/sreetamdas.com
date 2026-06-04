import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"content-collections": fileURLToPath(
				new URL("./.content-collections/generated", import.meta.url),
			),
		},
	},
	test: {
		environment: "node",
		exclude: ["e2e/**", "node_modules/**", "dist/**", ".content-collections/**"],
		include: ["src/**/*.test.ts"],
		passWithNoTests: true,
		setupFiles: ["./src/test-setup-build-info.ts"],
	},
});
