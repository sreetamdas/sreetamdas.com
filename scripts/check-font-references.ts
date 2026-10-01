/**
 * Guards the Iosevka subsets referenced from CSS, the root preload, and the
 * early-hints script.
 *
 * Those references are content-hashed filenames that `public/_headers` serves
 * with `immutable` for a year, so they have to be edited by hand whenever the
 * fonts are rebuilt. Nothing else checks them: a stale hash 404s, `font-display:
 * swap` silently falls back to the metric-matched local font, and the preload
 * wastes a request — with no build or test failure. This script makes that a
 * build failure instead.
 *
 * Two invariants, both cheap:
 *   1. Every referenced path exists in `public/fonts/iosevka/`.
 *   2. Its sha256 prefix equals the hash in its filename, so a copied-but-
 *      modified file cannot masquerade as a cache-busted one.
 *
 * Runs as part of `pnpm build` / `build:ci`.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const FONT_DIR = "public/fonts/iosevka";
const FONT_URL_PATTERN = /\/fonts\/iosevka\/([A-Za-z0-9._-]+\.woff2)/g;
const HASHED_NAME_PATTERN = /^(?<stem>.+)\.(?<hash>[0-9a-f]{8})\.subset\.woff2$/;
const REFERENCE_SOURCES = [
	"src/routes/global.css",
	"src/routes/__root.tsx",
	"scripts/inject-early-hints.mjs",
];

async function collectReferences(): Promise<Map<string, Array<string>>> {
	const references = new Map<string, Array<string>>();

	for (const source of REFERENCE_SOURCES) {
		const contents = await readFile(source, "utf-8");
		for (const match of contents.matchAll(FONT_URL_PATTERN)) {
			const filename = match[1];
			if (filename === undefined) continue;

			const sources = references.get(filename) ?? [];
			sources.push(source);
			references.set(filename, sources);
		}
	}

	return references;
}

const references = await collectReferences();
const available = new Set(await readdir(FONT_DIR));
const problems: Array<string> = [];

for (const [filename, sources] of references) {
	const citedBy = [...new Set(sources)].sort().join(", ");

	// Naming is checked first: a filename that is not content-hashed would
	// otherwise be reported as merely "missing", which hides the real cause.
	const parsed = HASHED_NAME_PATTERN.exec(filename);
	if (parsed?.groups === undefined) {
		problems.push(
			`${filename} (referenced by ${citedBy}) is not content-hashed; expected ` +
				"<stem>.<8 hex chars>.subset.woff2 so it can be served immutable",
		);
		continue;
	}

	if (!available.has(filename)) {
		problems.push(`${filename} is referenced by ${citedBy} but missing from ${FONT_DIR}`);
		continue;
	}

	const bytes = await readFile(join(FONT_DIR, filename));
	const actual = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
	if (actual !== parsed.groups.hash) {
		problems.push(
			`${filename} hashes to ${actual}, not the ${parsed.groups.hash} in its name; ` +
				"rename it (and update its references) or the file is stale",
		);
	}
}

// A font file nothing references is dead weight that still gets deployed, and
// its immutable caching means it can never be reclaimed.
for (const filename of available) {
	if (!references.has(filename)) {
		problems.push(`${FONT_DIR}/${filename} is not referenced by any source; delete it`);
	}
}

if (problems.length > 0) {
	throw new Error(
		"[font-check] Iosevka font references are out of sync:\n" +
			problems.map((problem) => `  - ${problem}`).join("\n") +
			"\nEvery /fonts/iosevka/*.woff2 URL must exist, be named with its own sha256 " +
			"prefix, and be cited by global.css, __root.tsx or inject-early-hints.mjs.",
	);
}

process.stdout.write(
	`[font-check] ${references.size} Iosevka references verified (existence + sha256)\n`,
);
