/**
 * Mints content-hashed names for freshly rebuilt Iosevka subsets and rewrites
 * their references — the mechanical half of a font rebuild.
 *
 * Iosevka's toolchain is deliberately out of band (npm's `iosevka` was
 * unpublished in 2020; see .config/iosevka-build-plan.toml), and the fontTools
 * postprocessing that produces the final woff2 runs there too. This script
 * covers everything after it: the rebuilt files arrive with toolchain-driven
 * names, while the site requires public/fonts/iosevka/<stem>.<sha256[0:8]>.
 * subset.woff2 — public/_headers serves that pattern immutable for a year —
 * and global.css, __root.tsx and inject-early-hints.mjs pointing at the new
 * names.
 *
 * Usage: pnpm fonts:mint <rebuilt.woff2> [...]
 */
import { createHash } from "node:crypto";
import { copyFile, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const FONT_DIR = "public/fonts/iosevka";
const REFERENCE_SOURCES = [
	"src/routes/global.css",
	"src/routes/__root.tsx",
	"scripts/inject-early-hints.mjs",
];

/**
 * Style detection runs longest-first, so a naive `-bold` would also match the
 * tail of a `bold-italic` file.
 */
const STYLE_PATTERN = /-(bold-italic|regular|italic|bold)\b/;
const HASHED_NAME_PATTERN = /^(?<stem>.+)\.[0-9a-f]{8}\.subset\.woff2$/;

const minted = new Map<string, string>();
for (const input of process.argv.slice(2)) {
	const bytes = await readFile(input);
	const sha8 = createHash("sha256").update(bytes).digest("hex").slice(0, 8);

	const style = STYLE_PATTERN.exec(basename(input))?.[1];
	if (style === undefined) {
		throw new Error(
			`[fonts] ${input} does not name a style; the filename must contain ` +
				"regular, italic, bold or bold-italic so it can be classified",
		);
	}

	const filename = `iosevka-das-version-${style}.${sha8}.subset.woff2`;
	minted.set(style, filename);
	await copyFile(input, join(FONT_DIR, filename));
}

if (minted.size === 0) {
	throw new Error("[fonts] usage: pnpm fonts:mint <rebuilt.woff2> [...]");
}

for (const [style, filename] of minted) {
	// Remove the superseded files for this style so the "unreferenced font"
	// check in scripts/check-font-references.ts does not fail the next build.
	for (const existing of await readdir(FONT_DIR)) {
		if (existing === filename || !existing.startsWith(`iosevka-das-version-${style}.`)) continue;
		if (HASHED_NAME_PATTERN.exec(existing) === undefined) continue;
		await unlink(join(FONT_DIR, existing));
		process.stdout.write(`[fonts] replaced ${existing}\n`);
	}
	process.stdout.write(`[fonts] shipped ${filename} for ${style}\n`);
}

for (const source of REFERENCE_SOURCES) {
	const contents = await readFile(source, "utf-8");
	let updated = contents;
	for (const [style, filename] of minted) {
		updated = updated.replaceAll(
			new RegExp(`iosevka-das-version-${style}\\.[0-9a-f]{8}\\.subset\\.woff2`, "g"),
			filename,
		);
	}
	if (updated !== contents) {
		await writeFile(source, updated);
		process.stdout.write(`[fonts] updated references in ${source}\n`);
	}
}

process.stdout.write(
	"[fonts] done; run pnpm build — its font-check verifies existence, sha256 " +
		"and the crossorigin preload\n",
);
