import { transformerColorizedBrackets } from "@shikijs/colorized-brackets";
import { defaultTheme } from "@sreetamdas/karma";
import { omit } from "lodash-es";
import type { KarmaHighlighter } from "./highlighter";
import { type BundledLanguage } from "shiki/langs";
import { type Node } from "unist";
import { visit } from "unist-util-visit";

import { getSlimKarmaHighlighter } from "./highlighter";

type CodeTreeNode = Node & {
	type: string;
	lang?: string;
	meta?: string | null;
	value: string;
};

export function renderCodeBlockToHtml(
	highlighter: KarmaHighlighter,
	code: string,
	lang: string | undefined,
	meta: string | null,
) {
	const language = lang ?? "plain";

	try {
		const lines_to_highlight = calculateLinesToHighlight(meta ?? "");
		const parsedMeta = parseMeta(meta);

		return highlighter.codeToHtml(code, {
			lang: language as BundledLanguage,
			theme: "karma",
			transformers: [
				{
					code(ast) {
						ast.properties["data-language"] = language;
					},
					line(el, line) {
						if (Array.isArray(lines_to_highlight) && lines_to_highlight.includes(line)) {
							el.properties["data-highlight"] = "true";
						}
					},
				},
				transformerColorizedBrackets({
					themes: {
						karma: [
							defaultTheme.colors["editorBracketHighlight.foreground1"],
							defaultTheme.colors["editorBracketHighlight.foreground2"],
							defaultTheme.colors["editorBracketHighlight.foreground3"],
							defaultTheme.colors["editorBracketHighlight.unexpectedBracket.foreground"],
						],
					},
				}),
			],
			meta: parsedMeta ?? {},
		});
	} catch {
		return null;
	}
}

export async function highlightCodeBlocks(tree: Node) {
	const karma_highlighter = await getSlimKarmaHighlighter();

	visit(tree, "code", (node) => {
		const currentNode = node as CodeTreeNode;
		if (typeof currentNode.value !== "string") {
			return;
		}

		const html = renderCodeBlockToHtml(
			karma_highlighter,
			currentNode.value,
			currentNode.lang,
			currentNode.meta ?? null,
		);
		if (html === null) {
			return;
		}

		currentNode.type = "html";
		currentNode.value = html;
	});
}

export function remarkShiki() {
	return async (tree: Node) => {
		await highlightCodeBlocks(tree);
	};
}

const CODE_FENCE_REGEX = /```([\w-]+)?([^\n]*)\n([\s\S]*?)```/g;
export async function highlightMarkdownCodeFences(markdown: string) {
	const karma_highlighter = await getSlimKarmaHighlighter();

	let lastIndex = 0;
	let result = "";

	for (const match of markdown.matchAll(CODE_FENCE_REGEX)) {
		const [fullMatch, lang, meta = "", code = ""] = match;
		const start = match.index ?? 0;

		result += markdown.slice(lastIndex, start);

		const highlighted = renderCodeBlockToHtml(karma_highlighter, code, lang, meta.trim() || null);
		result += highlighted ?? fullMatch;

		lastIndex = start + fullMatch.length;
	}

	result += markdown.slice(lastIndex);

	return result;
}

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang highlight="2,4-5"
 */
const RE_LINE_HIGHLIGHT = /([\d,-]+)/;
function calculateLinesToHighlight(meta = "") {
	const reg_exp_exec_array = RE_LINE_HIGHLIGHT.exec(meta);

	if (!RE_LINE_HIGHLIGHT.test(meta) || reg_exp_exec_array === null) {
		return false;
	}
	const lineNumbers = reg_exp_exec_array[1]
		.split(",")
		.map((v) => v.split("-").map((v) => Number.parseInt(v, 10)));

	return lineNumbers.reduce(
		(result, [start, end = start]) =>
			result.concat(Array.from({ length: end - start + 1 }, (_, i) => start + i)),
		[],
	);
}

const META_REGEX = /^([\w-]+)[=]?(?:"([^"]+)")?/;
/**
 * Parse meta string
 */
function parseMeta(meta: string | null) {
	if (meta === null) {
		return null;
	}
	let matches = meta.split(" ").reduce(
		(matchesObj, string) => {
			const match = string.match(META_REGEX);
			if (match === null) {
				return matchesObj;
			}

			return Object.assign(matchesObj, {
				[match[1]]: match[2] ?? "true",
			});
		},
		{} as Record<string, boolean | string>,
	);

	matches = omit(matches, ["highlight"]);

	if (Object.keys(matches).length === 0) {
		return null;
	}

	return matches;
}
