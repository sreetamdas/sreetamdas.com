/**
 * Contract coverage for Foobar clues that live outside the React catalogue.
 * These assertions protect generated/static surfaces from quiet cleanup.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getFoobarRewardPath } from "./codes";

const root = process.cwd();

function read(path: string) {
	return readFileSync(resolve(root, path), "utf8");
}

describe("Foobar static clues", () => {
	test("leaves the paper-trail clue in robot and security policies", () => {
		const paper_trail_path = getFoobarRewardPath("paper-trail");
		expect(read("public/robots.txt")).toContain(paper_trail_path);
		expect(read("public/.well-known/security.txt")).toContain(paper_trail_path);
	});

	test("leaves a well-known notice for curious visitors", () => {
		expect(read("public/.well-known/foobar")).toContain(getFoobarRewardPath("well-known"));
	});

	test("keeps the feed-reader clue in the generated RSS feed", () => {
		expect(read("public/rss/feed.xml")).toContain(getFoobarRewardPath("feed-reader"));
	});

	test("defines a print-only clue", () => {
		expect(read("src/routes/global.css")).toContain("[data-foobar-print-clue]");
		expect(read("src/lib/domains/foobar/DashboardClient.tsx")).toContain(
			'getFoobarRewardPath("print-preview")',
		);
	});

	test("sends the headers clue from prerendered pages too", () => {
		const headers_path = getFoobarRewardPath("headers");
		expect(read("public/_headers")).toMatch(
			new RegExp(`^/\\*\\n(?: {2}.+\\n)*? {2}X-Foobar: ${headers_path}$`, "m"),
		);
	});

	test("claims the 404 achievement from the not-found page", () => {
		expect(read("src/routes/(main)/route.tsx")).toContain('<FoobarPixel path="/404" />');
	});

	test("keeps robots-disallowed Foobar paths out of the shipped sitemap", () => {
		const { scripts } = JSON.parse(read("package.json"));
		expect(scripts.build).toContain("tsx scripts/normalize-sitemap.ts");
		expect(scripts["build:ci"]).toContain("tsx scripts/normalize-sitemap.ts");
	});

	test("ships the service-worker clue and unlocked registration", () => {
		const worker = read("public/foobar-sw.js");
		expect(worker).toContain("/foobar/service-worker-clue");
		expect(worker).toContain(getFoobarRewardPath("service-worker"));
		expect(read("src/lib/domains/foobar/Pixel.tsx")).toContain(
			'navigator.serviceWorker.register("/foobar-sw.js")',
		);
	});
});
