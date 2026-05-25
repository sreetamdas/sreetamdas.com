import { mdxParse } from "safe-mdx/parse";
/**
 * Produces a JSON-serialized MDAST and a separate map of Shiki-highlighted code blocks.
 *
 * The MDAST is kept as-is from safe-mdx's mdxParse (code nodes stay as code nodes).
 * Shiki highlighting is stored separately in a map keyed by line:column so that the
 * runtime renderer can look up pre-highlighted HTML for each code block without needing
 * to re-run Shiki or fight safe-mdx's html node handling.
 */
import { type Node } from "unist";
import { visit } from "unist-util-visit";

import { getSlimKarmaHighlighter } from "../../domains/shiki";

type CodeTreeNode = Node & {
	type: string;
	lang?: string;
	meta?: string | null;
	value: string;
	position?: { start: { line: number; column: number } };
};

type MarkdownNode = Node & {
	type: string;
	value?: string;
	depth?: number;
	children?: Array<MarkdownNode>;
	url?: string;
	[key: string]: unknown;
};

function isMarkdownNode(value: unknown): value is MarkdownNode {
	return typeof value === "object" && value !== null && "type" in value;
}

function isCodeTreeNode(value: unknown): value is CodeTreeNode {
	return isMarkdownNode(value) && value.type === "code" && typeof value.value === "string";
}

export type ShikiHighlightMap = Record<string, string>;

export type MdxParseResult = {
	mdast: string;
	shikiHighlights: ShikiHighlightMap;
};

function extractText(node: MarkdownNode | undefined): string {
	if (!node) return "";
	if (typeof node.value === "string") return node.value;
	if (!Array.isArray(node.children)) return "";
	return node.children.map((child) => extractText(child)).join("");
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function isTableOfContentsHeading(node: MarkdownNode): boolean {
	if (node.type !== "heading") return false;
	const text = extractText(node).trim().toLowerCase();
	return text === "table of contents" || text === "toc";
}

export function injectTableOfContents(tree: MarkdownNode): void {
	if (!Array.isArray(tree.children)) return;

	const index = tree.children.findIndex((node) => isTableOfContentsHeading(node));
	if (index === -1) return;

	const nextNode = tree.children[index + 1];
	if (nextNode?.type === "list") return;

	const tocHeading = tree.children[index];
	const minDepth = typeof tocHeading.depth === "number" ? tocHeading.depth : 2;

	const headings = tree.children.slice(index + 1).filter((node) => {
		if (node.type !== "heading") return false;
		if (typeof node.depth !== "number") return false;
		if (node.depth < minDepth) return false;
		return extractText(node).trim().length > 0;
	});

	if (headings.length === 0) return;

	const listItems = headings.flatMap((heading) => {
		const text = extractText(heading).trim();
		const id = slugify(text);
		if (id.length === 0) {
			return [];
		}

		return [
			{
				type: "listItem",
				spread: false,
				checked: null,
				children: [
					{
						type: "paragraph",
						children: [
							{
								type: "link",
								title: null,
								url: `#${id}`,
								children: [{ type: "text", value: text }],
							},
						],
					},
				],
			},
		];
	});

	if (listItems.length === 0) {
		return;
	}

	const listNode: MarkdownNode = {
		type: "list",
		ordered: false,
		start: null,
		spread: false,
		children: listItems,
	};

	tree.children.splice(index + 1, 0, listNode);
}

export async function mdxParseWithShiki(code: string): Promise<MdxParseResult> {
	const { renderCodeBlockToHtml } = await import("../../domains/shiki/plugin");
	const highlighter = await getSlimKarmaHighlighter();
	const parsedMdx = mdxParse(code);
	if (!isMarkdownNode(parsedMdx)) {
		throw new Error("MDX parser returned unexpected tree");
	}
	const mdast = parsedMdx;
	injectTableOfContents(mdast);
	const shikiHighlights: ShikiHighlightMap = {};

	visit(mdast, "code", (node) => {
		if (!isCodeTreeNode(node)) return;

		const html = renderCodeBlockToHtml(highlighter, node.value, node.lang, node.meta ?? null);
		if (html === null) return;

		const key = `${node.position?.start.line}:${node.position?.start.column}`;
		shikiHighlights[key] = html;
	});

	return {
		mdast: JSON.stringify(mdast),
		shikiHighlights,
	};
}
