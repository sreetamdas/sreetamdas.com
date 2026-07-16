/**
 * Post-build: inject `Link: rel=preload` headers for the render-blocking global
 * stylesheet and the preloaded fonts into the built `_headers`, so Cloudflare
 * emits a 103 Early Hints response and the browser starts fetching them ~1 RTT
 * before it parses the prerendered HTML. The CSS/font filenames are
 * content-hashed per build, so this has to run after the client bundle exists
 * rather than living in the static `_headers`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const CLIENT_DIR = "dist/client";
const HEADERS_PATH = `${CLIENT_DIR}/_headers`;
const ASSETS_DIR = `${CLIENT_DIR}/assets`;

function findAsset(pattern) {
	try {
		const file = readdirSync(ASSETS_DIR).find((n) => pattern.test(n));
		return file ? `/assets/${file}` : undefined;
	} catch {
		return undefined;
	}
}

const css = findAsset(/^global-.*\.css$/);
if (!css) {
	console.warn("[early-hints] no global-*.css found; skipping Link injection");
	process.exit(0);
}

// Mirrors the <head> preloads in __root.tsx: hashed Inter/Bricolage assets plus
// the statically served Iosevka subset. Fonts need `crossorigin` in the hint to
// match the CORS mode font-face fetches always use.
const fonts = [
	findAsset(/^inter-latin-wght-normal-.*\.woff2$/),
	findAsset(/^bricolage-grotesque-latin-standard-normal-.*\.woff2$/),
	"/fonts/iosevka/iosevka-das-version-regular.subset.woff2",
].filter(Boolean);

let headers;
try {
	headers = readFileSync(HEADERS_PATH, "utf-8");
} catch {
	console.warn(`[early-hints] ${HEADERS_PATH} not found; skipping`);
	process.exit(0);
}

if (headers.includes("Link:")) {
	console.log("[early-hints] Link header already present; skipping");
	process.exit(0);
}

const linkValues = [
	`<${css}>; rel=preload; as=style`,
	...fonts.map((font) => `<${font}>; rel=preload; as=font; crossorigin`),
];
const linkLine = `  Link: ${linkValues.join(", ")}`;
// Attach to the catch-all `/*` block by inserting after its first
// Cloudflare-CDN-Cache-Control line (the HTML documents Early Hints applies to).
const lines = headers.split("\n");
let injected = false;
const out = [];
for (const line of lines) {
	out.push(line);
	if (!injected && line.trimStart().startsWith("Cloudflare-CDN-Cache-Control")) {
		out.push(linkLine);
		injected = true;
	}
}

if (!injected) {
	console.warn("[early-hints] no `/*` Cloudflare-CDN-Cache-Control anchor found; skipping");
	process.exit(0);
}

writeFileSync(HEADERS_PATH, out.join("\n"));
console.log(`[early-hints] injected preload Link for ${[css, ...fonts].join(", ")}`);
