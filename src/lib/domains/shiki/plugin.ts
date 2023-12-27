import { type Lang } from "shiki";
import { visit } from "unist-util-visit";
import { type UnistNode } from "unist-util-visit/lib";

import { getKarmaHighlighter } from "./highlighter";

type TreeNode = UnistNode & {
	lang: Lang;
	meta: string;
	value: string;
};

export function remarkShiki() {
	return async (tree: TreeNode) => {
		const karma_highlighter = await getKarmaHighlighter();
		const loadedLanguages = karma_highlighter.getLoadedLanguages();

		function visitor(node: TreeNode) {
			const lang = !loadedLanguages.includes(node.lang) ? "js" : node.lang;
			const html = karma_highlighter.codeToHtml(node.value, { lang, theme: "karma" });

			node.type = "html";
			node.value = html;
		}

		visit(tree, "code", visitor);
	};
}
