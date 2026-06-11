import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
	root: projectRoot,
	resolve: {
		alias: {
			"cloudflare:workers": fileURLToPath(
				new URL("../src/testing/cloudflare-workers-unit.ts", import.meta.url),
			),
			"@": fileURLToPath(new URL("../src", import.meta.url)),
			"content-collections": fileURLToPath(
				new URL("../.content-collections/generated", import.meta.url),
			),
		},
	},
	test: {
		environment: "node",
		exclude: ["e2e/**", "node_modules/**", "dist/**", ".content-collections/**"],
		include: ["src/**/*.test.ts"],
		passWithNoTests: true,
		setupFiles: ["./src/test-setup-build-info.ts"],
		unstubGlobals: true,
	},
});
