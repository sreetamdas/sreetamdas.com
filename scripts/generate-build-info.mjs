import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function safe(cmd) {
	try {
		return execSync(cmd, { encoding: "utf-8" }).trim();
	} catch {
		return "unknown";
	}
}

const branch =
	process.env.WORKERS_CI_BRANCH ||
	process.env.CF_PAGES_BRANCH ||
	process.env.GITHUB_HEAD_REF ||
	process.env.GITHUB_REF_NAME ||
	safe("git rev-parse --abbrev-ref HEAD");

const commitSha =
	process.env.WORKERS_CI_COMMIT_SHA ||
	process.env.CF_PAGES_COMMIT_SHA ||
	process.env.GITHUB_SHA ||
	safe("git rev-parse HEAD");

const info = {
	branch,
	commit: commitSha.slice(0, 7),
	commitUrl: commitSha,
	time: new Date().toISOString(),
};

writeFileSync("src/build-info.json", JSON.stringify(info, null, "\t") + "\n");
