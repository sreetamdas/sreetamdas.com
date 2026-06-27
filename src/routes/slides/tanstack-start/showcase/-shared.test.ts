import { describe, expect, test } from "vitest";

import { parseShowcaseSection, validateShowcaseSearch } from "./-shared";

describe("parseShowcaseSection", () => {
	test("accepts known sections", () => {
		expect(parseShowcaseSection("router")).toBe("router");
		expect(parseShowcaseSection("server")).toBe("server");
		expect(parseShowcaseSection("rendering")).toBe("rendering");
		expect(parseShowcaseSection("deployment")).toBe("deployment");
		expect(parseShowcaseSection("streaming")).toBe("streaming");
		expect(parseShowcaseSection("rsc")).toBe("rsc");
	});

	test("defaults unknown values to router", () => {
		expect(parseShowcaseSection("next")).toBe("router");
		expect(parseShowcaseSection(undefined)).toBe("router");
		expect(parseShowcaseSection(["server"])).toBe("router");
	});
});

describe("validateShowcaseSearch", () => {
	test("returns typed feature state", () => {
		expect(validateShowcaseSearch({ feature: "deployment" })).toEqual({ feature: "deployment" });
	});

	test("keeps malformed URLs shareable", () => {
		expect(validateShowcaseSearch({ feature: "wat" })).toEqual({ feature: "router" });
	});
});
