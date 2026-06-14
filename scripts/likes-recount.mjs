/**
 * Recompute the denormalized `page_details.likes` counter from `post_likes` for
 * the current salt era (`LIKES_SALT_VERSION` in src/config).
 *
 * Run this after rotating `LIKES_IP_SALT` and bumping `LIKES_SALT_VERSION` to
 * drop prior-era likes from the public counts, or any time to self-heal drift
 * between the counter and its source rows (the counter is otherwise only
 * recomputed when a post is liked).
 *
 * Defaults to local D1 and a dry run — it prints the rows that would change and
 * writes nothing until you pass --apply.
 *
 *   node scripts/likes-recount.mjs                  # local, preview only
 *   node scripts/likes-recount.mjs --apply          # local, write
 *   node scripts/likes-recount.mjs --remote         # remote, preview only
 *   node scripts/likes-recount.mjs --remote --apply # remote, write
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DB = "sreetamdas_com";
const here = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(here, "../src/config/index.ts");

const args = new Set(process.argv.slice(2));
const remote = args.has("--remote");
const apply = args.has("--apply");
const target = remote ? "--remote" : "--local";

// Single source of truth: read the live era straight from config so this script
// can't drift from the value the app hashes with.
function readSaltVersion() {
	const match = readFileSync(configPath, "utf-8").match(/LIKES_SALT_VERSION\s*=\s*(\d+)/);
	if (!match) {
		throw new Error(`Could not find LIKES_SALT_VERSION in ${configPath}`);
	}
	return Number(match[1]);
}

function d1(sql) {
	const out = execSync(
		`wrangler d1 execute ${DB} ${target} --json --command ${JSON.stringify(sql)}`,
		{ encoding: "utf-8" },
	);
	return JSON.parse(out);
}

const saltVersion = readSaltVersion();
const currentEraCount = `(SELECT COUNT(*) FROM post_likes WHERE post_likes.slug = page_details.slug AND salt_version = ${saltVersion})`;

console.log(`Target: ${remote ? "REMOTE" : "local"} D1 (${DB})`);
console.log(`Salt era: ${saltVersion}`);

const preview = d1(
	`SELECT slug, likes AS current, ${currentEraCount} AS recomputed FROM page_details WHERE likes <> ${currentEraCount}`,
);
const rows = preview?.[0]?.results ?? [];

if (rows.length === 0) {
	console.log("All counters already match the current era. Nothing to do.");
	process.exit(0);
}

console.log(`\n${rows.length} counter(s) out of sync:`);
for (const row of rows) {
	console.log(`  ${row.slug}: ${row.current} -> ${row.recomputed}`);
}

if (!apply) {
	console.log("\nDry run. Re-run with --apply to write these changes.");
	process.exit(0);
}

d1(
	`UPDATE page_details SET likes = ${currentEraCount}, updated_at = CURRENT_TIMESTAMP WHERE likes <> ${currentEraCount}`,
);
console.log(`\nApplied. Recomputed ${rows.length} counter(s) for salt era ${saltVersion}.`);
