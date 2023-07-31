import { type Lang } from "shiki";
import { visit } from "unist-util-visit";
import { type UnistNode } from "unist-util-visit/lib";

import { getKarmaHighlighter } from "./highlighter";
import { renderToHtml } from "./renderer";

type TreeNode = UnistNode & {
	lang: Lang;
	meta: string;
	value: string;
};

export function remarkShiki() {
	return async (tree: TreeNode) => {
		const highlighter = await getKarmaHighlighter();
		const loadedLanguages = highlighter.getLoadedLanguages();

		function visitor(node: TreeNode) {
			const lang = !loadedLanguages.includes(node.lang) ? "js" : node.lang;

			const theme = highlighter.getTheme();
			// @ts-expect-error custom theme
			const tokens = highlighter.codeToThemedTokens(node.value, lang, theme, {
				includeExplanation: false,
			});

			const { fg, bg } = theme;
			const html = renderToHtml(tokens, { fg, bg, langId: lang }, node.meta);

			node.type = "html";
			node.value = html;
		}

		visit(tree, "code", visitor);
	};
}
