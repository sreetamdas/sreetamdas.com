import { describe, expect, test } from "vitest";

import { excerptFromMarkdown } from "./seo";

describe("excerptFromMarkdown", () => {
	test("strips headings, links and emphasis to plain text", () => {
		const markdown = "## Heading\n\nI posted a [new article](https://example.com) on **React**.";
		expect(excerptFromMarkdown(markdown)).toBe("Heading I posted a new article on React.");
	});

	test("collapses whitespace and newlines", () => {
		expect(excerptFromMarkdown("line one\n\n\nline   two")).toBe("line one line two");
	});

	test("drops images and code fences", () => {
		const markdown = "![alt text](/img.png)\n\n```js\nconst a = 1;\n```\n\nText after.";
		expect(excerptFromMarkdown(markdown)).toBe("Text after.");
	});

	test("truncates long text on a word boundary with an ellipsis", () => {
		const markdown = "word ".repeat(60).trim();
		const result = excerptFromMarkdown(markdown, 40);
		expect(result.length).toBeLessThanOrEqual(41);
		expect(result.endsWith("…")).toBe(true);
		expect(result).not.toMatch(/\s…$/);
	});

	test("returns short text unchanged without an ellipsis", () => {
		expect(excerptFromMarkdown("Short and sweet.")).toBe("Short and sweet.");
	});

	test("returns an empty string for empty input", () => {
		expect(excerptFromMarkdown("")).toBe("");
	});

	test("strips a leading greeting", () => {
		expect(excerptFromMarkdown("Hello there! This week I moved to Zustand.")).toBe(
			"This week I moved to Zustand.",
		);
		expect(excerptFromMarkdown("Hey,\n\nHappy New Year!")).toBe("Happy New Year!");
	});

	test("does not strip a real word that merely starts like a greeting", () => {
		expect(excerptFromMarkdown("Hidden gems of the week.")).toBe("Hidden gems of the week.");
	});
});
