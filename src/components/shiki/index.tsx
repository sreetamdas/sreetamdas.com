import { useState, useEffect } from "react";

import { getKarmaHighlighter } from "@/components/shiki/helpers";

const initialContent = `
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
`;

export const ShikiPlayground = () => {
	const [htmlTokens, setHtmlTokens] = useState("");
	useEffect(() => {
		async function getTokens() {
			const karmaHighlighter = await getKarmaHighlighter();
			const tokenizedHTML = karmaHighlighter.codeToHtml(initialContent, "ts");
			setHtmlTokens(tokenizedHTML);
		}

		getTokens();
	}, []);
	return <div>{htmlTokens}</div>;
};
