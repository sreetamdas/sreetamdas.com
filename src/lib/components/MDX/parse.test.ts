import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { injectTableOfContents } from "./parse";

type TocTree = Parameters<typeof injectTableOfContents>[0];

describe("injectTableOfContents", () => {
	test("inserts a TOC list below the toc heading", () => {
		const tree: TocTree = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Table of contents" }],
				},
				{ type: "paragraph", children: [{ type: "text", value: "Intro" }] },
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "The Problem" }],
				},
				{
					type: "heading",
					depth: 3,
					children: [{ type: "text", value: "Sub section" }],
				},
			],
		};

		injectTableOfContents(tree);

		assert.equal(tree.children?.[1]?.type, "list");
		const list = tree.children?.[1] as {
			type: string;
			children: Array<{
				children: Array<{ children: Array<{ url: string; children: Array<{ value: string }> }> }>;
			}>;
		};

		assert.equal(list.children.length, 2);
		assert.equal(list.children[0].children[0].children[0].url, "#the-problem");
		assert.equal(list.children[0].children[0].children[0].children[0].value, "The Problem");
		assert.equal(list.children[1].children[0].children[0].url, "#sub-section");
	});

	test("does not duplicate toc when list already exists", () => {
		const tree: TocTree = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Table of contents" }],
				},
				{ type: "list", ordered: false, children: [] },
			],
		};

		injectTableOfContents(tree);

		assert.equal(tree.children?.length, 2);
		assert.equal(tree.children?.[1]?.type, "list");
	});
});
