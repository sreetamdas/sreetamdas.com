import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const branch = process.env.WORKERS_CI_BRANCH ?? "";

if (branch === "dev") {
	// The @cloudflare/vite-plugin generates dist/server/wrangler.json as a
	// "redirected" config (it contains configPath/userConfigPath pointing back
	// to wrangler.jsonc). Wrangler refuses to deploy a redirected config that
	// also includes env sections. We remove the redirect fields, inject the
	// env blocks from the original config, and deploy from the standalone file.
	const generated = JSON.parse(readFileSync("dist/server/wrangler.json", "utf-8"));
	const original = JSON.parse(readFileSync("wrangler.jsonc", "utf-8"));

	delete generated.configPath;
	delete generated.userConfigPath;

	if (original.env) {
		generated.env = original.env;
	}

	writeFileSync("dist/server/wrangler.json", JSON.stringify(generated, null, "\t"));

	execSync("CLOUDFLARE_ENV=staging wrangler deploy -e staging", { stdio: "inherit" });
} else {
	execSync("wrangler versions upload", { stdio: "inherit" });
}
