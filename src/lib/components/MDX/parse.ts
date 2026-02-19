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
import { mdxParse } from "safe-mdx/parse";

import { getSlimKarmaHighlighter } from "@/lib/domains/shiki";

type CodeTreeNode = Node & {
	type: string;
	lang?: string;
	meta?: string | null;
	value: string;
	position?: { start: { line: number; column: number } };
};

export type ShikiHighlightMap = Record<string, string>;

export type MdxParseResult = {
	mdast: string;
	shikiHighlights: ShikiHighlightMap;
};

export async function mdxParseWithShiki(code: string): Promise<MdxParseResult> {
	const { renderCodeBlockToHtml } = await import("@/lib/domains/shiki/plugin");
	const highlighter = await getSlimKarmaHighlighter();
	const mdast = mdxParse(code);
	const shikiHighlights: ShikiHighlightMap = {};

	visit(mdast, "code", (node) => {
		const codeNode = node as CodeTreeNode;
		if (typeof codeNode.value !== "string") return;

		const html = renderCodeBlockToHtml(
			highlighter,
			codeNode.value,
			codeNode.lang,
			codeNode.meta ?? null,
		);
		if (html === null) return;

		const key = `${codeNode.position?.start.line}:${codeNode.position?.start.column}`;
		shikiHighlights[key] = html;
	});

	return {
		mdast: JSON.stringify(mdast),
		shikiHighlights,
	};
}
