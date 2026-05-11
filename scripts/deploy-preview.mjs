import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const branch = process.env.WORKERS_CI_BRANCH ?? "";

if (branch === "dev") {
	// The @cloudflare/vite-plugin generates dist/server/wrangler.json without
	// the `env` sections from the original wrangler.jsonc. Merge them back in
	// so `wrangler deploy -e staging` applies the correct routes and bindings.
	const generated = JSON.parse(readFileSync("dist/server/wrangler.json", "utf-8"));
	const original = JSON.parse(readFileSync("wrangler.jsonc", "utf-8"));

	if (original.env) {
		generated.env = original.env;
	}

	writeFileSync("dist/server/wrangler.json", JSON.stringify(generated, null, "\t"));

	execSync("CLOUDFLARE_ENV=staging wrangler deploy -e staging", { stdio: "inherit" });
} else {
	execSync("wrangler versions upload", { stdio: "inherit" });
}
