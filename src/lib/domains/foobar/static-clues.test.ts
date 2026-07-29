/**
 * Contract coverage for Foobar clues that live outside the React catalogue.
 * These assertions protect generated/static surfaces from quiet cleanup.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();

function read(path: string) {
	return readFileSync(resolve(root, path), "utf8");
}

describe("Foobar static clues", () => {
	test("leaves the paper-trail clue in robot and security policies", () => {
		expect(read("public/robots.txt")).toContain("/foobar/paper-trail");
		expect(read("public/.well-known/security.txt")).toContain("/foobar/paper-trail");
	});

	test("leaves a well-known notice for curious visitors", () => {
		expect(read("public/.well-known/foobar")).toContain("/foobar/well-known");
	});

	test("keeps the feed-reader clue in the generated RSS feed", () => {
		expect(read("public/rss/feed.xml")).toContain("/foobar/feed-reader");
	});

	test("defines a print-only clue", () => {
		expect(read("src/routes/global.css")).toContain("[data-foobar-print-clue]");
		expect(read("src/lib/domains/foobar/DashboardClient.tsx")).toContain("/foobar/print-preview");
	});

	test("ships the service-worker clue and unlocked registration", () => {
		const worker = read("public/foobar-sw.js");
		expect(worker).toContain("/foobar/service-worker-clue");
		expect(worker).toContain("/foobar/service-worker");
		expect(read("src/lib/domains/foobar/Pixel.tsx")).toContain(
			'navigator.serviceWorker.register("/foobar-sw.js")',
		);
	});
});
