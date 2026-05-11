import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const branch = process.env.WORKERS_CI_BRANCH ?? "";

if (branch === "dev") {
	// The @cloudflare/vite-plugin generates dist/server/wrangler.json and
	// .wrangler/deploy/config.json, making Wrangler treat it as a "redirected"
	// configuration. Wrangler rejects deploying redirected configs that contain
	// env sections. We write a brand-new standalone config (without redirect
	// metadata), remove the deploy redirect file, and deploy from the new file.
	const generated = JSON.parse(readFileSync("dist/server/wrangler.json", "utf-8"));
	const original = JSON.parse(readFileSync("wrangler.jsonc", "utf-8"));

	delete generated.configPath;
	delete generated.userConfigPath;

	if (original.env) {
		generated.env = original.env;
	}

	const standaloneConfigPath = ".wrangler/deploy/wrangler.json";
	writeFileSync(standaloneConfigPath, JSON.stringify(generated, null, "\t"));

	// Remove the redirect file so Wrangler doesn't detect this as a redirected config
	try {
		unlinkSync(".wrangler/deploy/config.json");
	} catch {
		// ignore if missing
	}

	execSync(`CLOUDFLARE_ENV=staging wrangler deploy --config ${standaloneConfigPath} -e staging`, {
		stdio: "inherit",
	});
} else {
	execSync("wrangler versions upload", { stdio: "inherit" });
}
