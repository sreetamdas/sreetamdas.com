import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const branch = process.env.WORKERS_CI_BRANCH ?? "";

if (branch === "dev") {
	// The @cloudflare/vite-plugin generates dist/server/wrangler.json as a
	// "redirected" config (via .wrangler/deploy/config.json) and strips env
	// sections. Wrangler refuses to deploy redirected configs with env blocks.
	// We inject env sections into the generated config, delete the redirect
	// file, and deploy directly from the modified generated config.
	const generated = JSON.parse(readFileSync("dist/server/wrangler.json", "utf-8"));
	const original = JSON.parse(readFileSync("wrangler.jsonc", "utf-8"));

	delete generated.configPath;
	delete generated.userConfigPath;

	if (original.env) {
		generated.env = original.env;
	}

	writeFileSync("dist/server/wrangler.json", JSON.stringify(generated, null, "\t"));

	// Remove the redirect file so Wrangler treats dist/server/wrangler.json as
	// a standalone config instead of a redirected one.
	try {
		unlinkSync(".wrangler/deploy/config.json");
	} catch {
		// ignore if missing
	}

	execSync("CLOUDFLARE_ENV=staging wrangler deploy --config dist/server/wrangler.json -e staging", {
		stdio: "inherit",
	});
} else {
	execSync("wrangler versions upload", { stdio: "inherit" });
}
