import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function safe(cmd) {
	try {
		return execSync(cmd, { encoding: "utf-8" }).trim();
	} catch {
		return "unknown";
	}
}

const info = {
	branch: process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || safe("git rev-parse --abbrev-ref HEAD"),
	commit: safe("git rev-parse --short HEAD"),
	commitUrl: safe("git rev-parse HEAD"),
	time: new Date().toISOString(),
};

writeFileSync("src/build-info.json", JSON.stringify(info, null, "\t") + "\n");
