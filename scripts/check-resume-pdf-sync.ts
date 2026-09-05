/**
 * Guards /resume as the single source of truth for the resume PDF.
 *
 * Extracts JSX text fragments from the resume route source and requires each
 * one to appear in public/resume.pdf's extracted text. PDF text extraction
 * reflows lines and interleaves the two-column layout, so both sides are
 * normalized (lowercase; whitespace, ASCII hyphens, commas and apostrophes
 * stripped) before substring matching — that also absorbs the line-break
 * hyphens pdftotext-style extractors drop ("cross-team" → "crossteam").
 *
 * Runs as part of `pnpm build` / `build:ci`, so a stale PDF fails the build
 * (and therefore CI and the Workers deploy) instead of shipping silently.
 */
import { readFile } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";

const ROUTE_SOURCE = "src/routes/(pure)/resume/route.tsx";
const PDF = "public/resume.pdf";

/** Minimum normalized length for a JSX fragment to be worth checking. */
const MIN_FRAGMENT_LENGTH = 15;

function normalize(text: string): string {
	return text.toLowerCase().replaceAll(/[\s,\-'’]/g, "");
}

function extractJsxTextFragments(source: string): Array<string> {
	const matches = source.matchAll(/>([^<>{}]+)</g);
	const fragments: Array<string> = [];
	for (const match of matches) {
		const text = normalize(match[1] ?? "");
		if (text.length >= MIN_FRAGMENT_LENGTH) fragments.push(text);
	}
	return fragments;
}

async function extractPdfText(): Promise<string> {
	const bytes = await readFile(PDF);
	const pdf = await getDocumentProxy(new Uint8Array(bytes));
	const { text } = await extractText(pdf, { mergePages: true });
	return text;
}

const [source, pdfText] = await Promise.all([readFile(ROUTE_SOURCE, "utf8"), extractPdfText()]);
const fragments = extractJsxTextFragments(source);
const normalizedPdfText = normalize(pdfText);

const missing = fragments.filter((fragment) => !normalizedPdfText.includes(fragment));

function log(message: string): void {
	process.stdout.write(`${message}\n`);
}

if (missing.length > 0) {
	log(
		`resume.pdf is stale: ${missing.length}/${fragments.length} text fragments from ${ROUTE_SOURCE} are missing from ${PDF}.\n` +
			"The /resume page is the source of truth — regenerate the PDF by printing the prerendered\n" +
			"dist/client/resume.html to PDF (e.g. headless Chrome --print-to-pdf) and update public/resume.pdf.\n\n" +
			missing.map((fragment) => `  - ${fragment}`).join("\n"),
	);
	process.exit(1);
}

log(`resume.pdf is in sync with the /resume page (${fragments.length} fragments checked).`);
