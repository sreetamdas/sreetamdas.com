import { defineConfig } from "drizzle-kit";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

async function findLocalD1SqliteFile(): Promise<string> {
	const baseDir = path.resolve(projectRoot, ".wrangler/state/v3/d1");
	let entries: string[] = [];

	try {
		entries = await readdir(baseDir);
	} catch {
		throw new Error(
			`No Wrangler local state found at ${baseDir}. Run \`pnpm db:migrate:local\` first.`,
		);
	}

	const sqliteCandidates = (
		await Promise.all(
			entries.map(async (entry) => {
				const maybeDir = path.join(baseDir, entry);
				let files: string[] = [];

				try {
					files = await readdir(maybeDir);
				} catch {
					return [];
				}

				const sqliteFiles: string[] = [];
				for (const file of files) {
					if (file.endsWith(".sqlite")) {
						sqliteFiles.push(file);
					}
				}

				return Promise.all(
					sqliteFiles.map(async (file) => {
						const full = path.join(maybeDir, file);
						const sqliteFile = await stat(full);
						return { file: full, mtimeMs: sqliteFile.mtimeMs };
					}),
				);
			}),
		)
	).flat();

	if (sqliteCandidates.length === 0) {
		throw new Error(
			`No local D1 sqlite files found under ${baseDir}. Run \`pnpm db:migrate:local\` first.`,
		);
	}

	sqliteCandidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
	const latest = sqliteCandidates[0];
	if (!latest) {
		throw new Error(`No local D1 sqlite files found under ${baseDir}.`);
	}
	return latest.file;
}

const sqliteFile = await findLocalD1SqliteFile();

export default defineConfig({
	schema: path.join(projectRoot, "src/db/schema.ts"),
	out: path.join(projectRoot, "drizzle/migrations"),
	dialect: "sqlite",
	dbCredentials: {
		url: `file:${sqliteFile}`,
	},
});
