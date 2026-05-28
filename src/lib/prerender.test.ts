import { describe, expect, test } from "vitest";

import { shouldPrerenderPath } from "./prerender";

describe("shouldPrerenderPath", () => {
	test("keeps static newsletter index prerendered", () => {
		expect(shouldPrerenderPath("/newsletter")).toBe(true);
		expect(shouldPrerenderPath("/newsletter/")).toBe(true);
	});

	test("skips newsletter detail pages discovered from remote content", () => {
		expect(shouldPrerenderPath("/newsletter/checking-out-react-query-and-svelte")).toBe(false);
	});

	test("keeps unrelated pages prerendered", () => {
		expect(shouldPrerenderPath("/blog/chameleon-text")).toBe(true);
		expect(shouldPrerenderPath("/rwc")).toBe(true);
	});
});
