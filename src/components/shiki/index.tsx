import { Highlighter } from "shiki";
import { visit } from "unist-util-visit";

import { renderToHTML } from "@/components/shiki/renderer";

type RemarkShikiOptions = {
	highlighter: Highlighter;
	renderToHTML?: typeof renderToHTML;
	ignoreUnknownLanguage?: string;
};

export function remarkShiki(options: RemarkShikiOptions) {
	const { highlighter, renderToHTML } = options;
	const loadedLanguages = highlighter.getLoadedLanguages();
	const ignoreUnknownLanguage =
		options.ignoreUnknownLanguage == null ? true : options.ignoreUnknownLanguage;

	return transformer;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function transformer(tree: any) {
		visit(tree, "code", visitor);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function visitor(node: any) {
			const lang = ignoreUnknownLanguage && !loadedLanguages.includes(node.lang) ? null : node.lang;
			if (renderToHTML) {
				const theme = highlighter.getTheme();
				// @ts-expect-error custom theme
				const tokens = highlighter.codeToThemedTokens(node.value, lang, theme, {
					includeExplanation: false,
				});

				const { fg, bg } = theme;
				const html = renderToHTML(tokens, { fg, bg, langId: lang }, node.meta);
				node.type = "html";
				node.value = html;
			} else {
				const highlighted = highlighter.codeToHtml(node.value, lang);
				node.type = "html";
				node.value = highlighted;
			}
		}
	}
}
