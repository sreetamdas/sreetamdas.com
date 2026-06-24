/**
 * Newsletter content snapshot.
 *
 * Fetches the Buttondown emails once and writes them to a committed JSON
 * snapshot so the build/prerender no longer hits the Buttondown API on every
 * run (the published issues no longer change). Run manually to refresh:
 *
 *   pnpm snapshot:newsletter
 *
 * Requires BUTTONDOWN_API_KEY in the environment.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
	BUTTONDOWN_API_VERSION,
	BUTTONDOWN_BASE_URL,
	isButtondownEmailsResponse,
} from "../src/lib/domains/Buttondown/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = resolve(__dirname, "../src/lib/domains/Buttondown/newsletter-snapshot.json");

async function main() {
	const apiKey = process.env.BUTTONDOWN_API_KEY;
	if (!apiKey) {
		process.stderr.write("BUTTONDOWN_API_KEY is not set; cannot snapshot newsletter content.\n");
		process.exit(1);
	}

	const response = await fetch(`${BUTTONDOWN_BASE_URL}/emails`, {
		headers: {
			"X-API-Version": BUTTONDOWN_API_VERSION,
			Authorization: `Token ${apiKey}`,
		},
	});

	if (!response.ok) {
		process.stderr.write(`Buttondown request failed: ${response.status}\n`);
		process.exit(1);
	}

	const data = await response.json();
	if (!isButtondownEmailsResponse(data)) {
		process.stderr.write("Unexpected Buttondown payload; not writing snapshot.\n");
		process.exit(1);
	}

	writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(data, null, "\t")}\n`, "utf-8");
	process.stdout.write(`  Wrote ${SNAPSHOT_PATH} (${data.results.length} issues)\n`);
}

main();
