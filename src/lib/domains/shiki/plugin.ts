import { omit } from "lodash-es";
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

		function visitor(node: TreeNode) {
			const lines_to_highlight = calculateLinesToHighlight(node.meta);
			const meta = parseMeta(node.meta);
			const html = karma_highlighter.codeToHtml(node.value, {
				lang: node.lang,
				theme: "karma",
				transformers: [
					{
						code(code) {
							code.properties["data-language"] = node.lang;
						},
						line(el, line) {
							if (Array.isArray(lines_to_highlight) && lines_to_highlight.includes(line)) {
								el.properties["data-highlight"] = "true";
							}
						},
					},
				],
				meta: meta ?? {},
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
