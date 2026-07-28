import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const branch = process.env.WORKERS_CI_BRANCH ?? "";
const stagingWorkerName = "sreetamdas-com-staging";

/*
 * Cloudflare sometimes completes the Worker upload and then fails a follow-up
 * dashboard/subdomain lookup with a transient 503. That should not make the
 * preview deploy red when the Worker was already uploaded, but ordinary
 * Wrangler failures must still fail loudly.
 */
function runWrangler(args, options = {}) {
	const result = spawnSync("wrangler", args, {
		...options,
		encoding: "utf-8",
	});

	if (result.stdout) {
		process.stdout.write(result.stdout);
	}

	if (result.stderr) {
		process.stderr.write(result.stderr);
	}

	if (result.error) {
		throw result.error;
	}

	return result;
}

function outputFor(result) {
	return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

function isWorkerSubdomain503(output) {
	return (
		output.includes("Received a malformed response from the API") &&
		output.includes("/workers/subdomain -> 503 Service Unavailable")
	);
}

function isSuccessfulUploadWithSubdomain503(output) {
	return isWorkerSubdomain503(output) && output.includes(`Uploaded ${stagingWorkerName}`);
}

function sleep(ms) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runRequiredWrangler(args, options = {}) {
	const result = runWrangler(args, options);

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function deployStaging() {
	const args = ["deploy", "--config", "dist/server/wrangler.json", "-e", "staging"];
	const options = { env: { ...process.env, CLOUDFLARE_ENV: "staging" } };
	const maxAttempts = 3;
	let lastOutput = "";
	let uploadedBeforeSubdomain503 = false;

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		const result = runWrangler(args, options);
		lastOutput = outputFor(result);
		uploadedBeforeSubdomain503 =
			uploadedBeforeSubdomain503 || isSuccessfulUploadWithSubdomain503(lastOutput);

		if (result.status === 0) {
			return;
		}

		if (!isWorkerSubdomain503(lastOutput)) {
			process.exit(result.status ?? 1);
		}

		if (attempt < maxAttempts) {
			process.stderr.write(
				`Wrangler hit a post-upload Worker subdomain 503; retrying (${attempt}/${maxAttempts})...\n`,
			);
			sleep(5_000);
		}
	}

	if (uploadedBeforeSubdomain503) {
		process.stderr.write(
			"Wrangler uploaded the staging Worker, but Cloudflare's follow-up subdomain lookup kept returning 503. Treating the preview deploy as successful.\n",
		);
		return;
	}

	process.exit(1);
}

if (branch === "dev") {
	runRequiredWrangler(["d1", "execute", "sreetamdas_com", "--remote", "--command", "SELECT 1"]);
	const migration = spawnSync("node", ["scripts/migrate-d1.mjs"], {
		encoding: "utf-8",
		stdio: "inherit",
	});
	if (migration.status !== 0) process.exit(migration.status ?? 1);

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

	deployStaging();
} else {
	runRequiredWrangler(["versions", "upload"]);
}
