/**
 * Applies nested Drizzle SQL migrations through Wrangler before deployment.
 * Wrangler supplies Cloudflare authentication in Workers Builds, while the
 * Drizzle journal remains the source of truth for hashes and ordering.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const database = "sreetamdas_com";
const migrationsRoot = join(process.cwd(), "drizzle/migrations");

function runWrangler(args) {
	const result = spawnSync("wrangler", args, { encoding: "utf8" });
	if (result.status !== 0) {
		process.stderr.write(result.stdout ?? "");
		process.stderr.write(result.stderr ?? "");
		process.exit(result.status ?? 1);
	}
	return result.stdout ?? "";
}

function executeCommand(sql) {
	return runWrangler(["d1", "execute", database, "--remote", "--json", "--command", sql]);
}

executeCommand(
	"CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL, created_at numeric, name TEXT, applied_at TEXT)",
);
const journalOutput = executeCommand("SELECT hash FROM __drizzle_migrations");
const journalPayload = JSON.parse(journalOutput);
const appliedHashes = new Set(
	journalPayload.flatMap((batch) => batch.results.map((row) => row.hash).filter(Boolean)),
);

for (const name of readdirSync(migrationsRoot).toSorted()) {
	const migrationPath = join(migrationsRoot, name, "migration.sql");
	let sql;
	try {
		sql = readFileSync(migrationPath, "utf8");
	} catch {
		continue;
	}

	const hash = createHash("sha256").update(sql).digest("hex");
	if (appliedHashes.has(hash)) continue;

	const timestamp = Date.parse(
		`${name.slice(0, 4)}-${name.slice(4, 6)}-${name.slice(6, 8)}T${name.slice(8, 10)}:${name.slice(10, 12)}:${name.slice(12, 14)}Z`,
	);
	if (!Number.isFinite(timestamp)) {
		throw new Error(`Migration directory must start with YYYYMMDDHHMMSS: ${name}`);
	}

	process.stdout.write(`[d1-migrate] applying ${name}\n`);
	runWrangler(["d1", "execute", database, "--remote", "--file", migrationPath]);
	executeCommand(
		`INSERT INTO __drizzle_migrations (hash, created_at, name, applied_at) VALUES ('${hash}', ${timestamp}, '${name}', datetime('now'))`,
	);
	process.stdout.write(`[d1-migrate] applied ${name}\n`);
}

process.stdout.write("[d1-migrate] remote schema is current\n");
