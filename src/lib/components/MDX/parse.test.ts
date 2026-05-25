import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { injectTableOfContents } from "./parse";

type TocTree = Parameters<typeof injectTableOfContents>[0];

function asObject(value: unknown): Record<string, unknown> | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return undefined;
	}

	const entries = Object.entries(value);
	return Object.fromEntries(entries);
}

function getChildObject(value: unknown, index: number): Record<string, unknown> | undefined {
	const objectValue = asObject(value);
	const children = objectValue?.children;
	if (!objectValue || !Array.isArray(children)) {
		return undefined;
	}

	return asObject(children[index]);
}

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
		const list = getChildObject(tree, 1);
		const firstItem = getChildObject(list, 0);
		const firstParagraph = getChildObject(firstItem, 0);
		const firstLink = getChildObject(firstParagraph, 0);
		const firstText = getChildObject(firstLink, 0);
		const secondItem = getChildObject(list, 1);
		const secondParagraph = getChildObject(secondItem, 0);
		const secondLink = getChildObject(secondParagraph, 0);

		const children = list?.children;
		assert.equal(Array.isArray(children) ? children.length : 0, 2);
		assert.equal(firstLink?.url, "#the-problem");
		assert.equal(firstText?.value, "The Problem");
		assert.equal(secondLink?.url, "#sub-section");
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

	test("only includes headings after the toc marker", () => {
		const tree: TocTree = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Before TOC" }],
				},
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Table of contents" }],
				},
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Included Heading" }],
				},
			],
		};

		injectTableOfContents(tree);

		const links = readTocLinks(tree);
		assert.equal(links.length, 1);
		assert.equal(links[0]?.url, "#included-heading");
		assert.equal(links[0]?.text, "Included Heading");
	});

	test("respects toc heading depth when collecting headings", () => {
		const tree: TocTree = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 3,
					children: [{ type: "text", value: "toc" }],
				},
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Too Shallow" }],
				},
				{
					type: "heading",
					depth: 3,
					children: [{ type: "text", value: "Included" }],
				},
			],
		};

		injectTableOfContents(tree);

		const links = readTocLinks(tree);
		assert.deepEqual(
			links.map((entry) => entry.url),
			["#included"],
		);
	});

	test("skips headings that slugify to empty ids", () => {
		const tree: TocTree = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Table of contents" }],
				},
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "!!!" }],
				},
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "Real heading" }],
				},
			],
		};

		injectTableOfContents(tree);

		const links = readTocLinks(tree);
		assert.equal(links.length, 1);
		assert.equal(links[0]?.url, "#real-heading");
	});
});

function readTocLinks(tree: TocTree): Array<{ url: string; text: string }> {
	if (!Array.isArray(tree.children)) {
		return [];
	}

	const tocHeadingIndex = tree.children.findIndex((node) => {
		if (node.type !== "heading") {
			return false;
		}
		const textNode = node.children?.[0];
		return (
			textNode?.type === "text" &&
			typeof textNode.value === "string" &&
			["table of contents", "toc"].includes(textNode.value.trim().toLowerCase())
		);
	});

	if (tocHeadingIndex === -1) {
		return [];
	}

	const tocListNode = tree.children[tocHeadingIndex + 1];
	if (!tocListNode || tocListNode.type !== "list" || !Array.isArray(tocListNode.children)) {
		return [];
	}

	const links: Array<{ url: string; text: string }> = [];
	for (const listItemNode of tocListNode.children) {
		if (
			!listItemNode ||
			listItemNode.type !== "listItem" ||
			!Array.isArray(listItemNode.children)
		) {
			continue;
		}

		const paragraphNode = listItemNode.children[0];
		if (
			!paragraphNode ||
			paragraphNode.type !== "paragraph" ||
			!Array.isArray(paragraphNode.children)
		) {
			continue;
		}

		const linkNode = paragraphNode.children[0];
		if (
			!linkNode ||
			linkNode.type !== "link" ||
			typeof linkNode.url !== "string" ||
			!Array.isArray(linkNode.children)
		) {
			continue;
		}

		const textNode = linkNode.children[0];
		const text =
			textNode && textNode.type === "text" && typeof textNode.value === "string"
				? textNode.value
				: "";

		links.push({
			url: linkNode.url,
			text,
		});
	}

	return links;
}
