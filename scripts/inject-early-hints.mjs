/**
 * Post-build: inject a `Link: rel=preload` header for the render-blocking global
 * stylesheet into the built `_headers`, so Cloudflare emits a 103 Early Hints
 * response and the browser starts fetching the CSS ~1 RTT before it parses the
 * prerendered HTML. The CSS filename is content-hashed per build, so this has to
 * run after the client bundle exists rather than living in the static `_headers`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const CLIENT_DIR = "dist/client";
const HEADERS_PATH = `${CLIENT_DIR}/_headers`;
const ASSETS_DIR = `${CLIENT_DIR}/assets`;

function findGlobalCss() {
	try {
		const file = readdirSync(ASSETS_DIR).find((n) => /^global-.*\.css$/.test(n));
		return file ? `/assets/${file}` : undefined;
	} catch {
		return undefined;
	}
}

const css = findGlobalCss();
if (!css) {
	console.warn("[early-hints] no global-*.css found; skipping Link injection");
	process.exit(0);
}

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

const linkLine = `  Link: <${css}>; rel=preload; as=style`;
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
console.log(`[early-hints] injected preload Link for ${css}`);
