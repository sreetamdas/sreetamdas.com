import type { BundledLanguage } from "shiki/langs";
import { visit } from "unist-util-visit";
import type { UnistNode } from "unist-util-visit/lib";

import { getSlimKarmaHighlighter } from "./highlighter";

type TreeNode = UnistNode & {
	lang: BundledLanguage;
	meta: string;
	value: string;
};

export function remarkShiki() {
	return async (tree: TreeNode) => {
		const karma_highlighter = await getSlimKarmaHighlighter();
		const loadedLanguages = karma_highlighter.getLoadedLanguages();

		function visitor(node: TreeNode) {
			const lines_to_highlight = calculateLinesToHighlight(node.meta);
			const lang = !loadedLanguages.includes(node.lang) ? "js" : node.lang;
			const html = karma_highlighter.codeToHtml(node.value, {
				lang,
				theme: "karma",
				transformers: [
					{
						code(node) {
							node.properties["data-language"] = lang;
						},
						line(node, line) {
							if (Array.isArray(lines_to_highlight) && lines_to_highlight.includes(line)) {
								node.properties["data-highlight"] = "true";
								// addClassToHast(node, "highlight");
							}
						},
					},
				],
			});

			node.type = "html";
			node.value = html;
		}

		visit(tree, "code", visitor);
	};
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
