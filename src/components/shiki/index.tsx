import { useState, useEffect } from "react";

import { getKarmaHighlighter } from "./highlighter";

import { renderToHtml } from "@/components/shiki/renderer";
import { CodeBlock } from "@/components/shiki/styled";

export const ShikiPlayground = () => {
	const [htmlTokens, setHtmlTokens] = useState("");

	useEffect(() => {
		async function setInitialHtml() {
			setHtmlTokens(await getShikiHtml(initialCodeExample));
		}

		setInitialHtml();
	}, []);

	return <div dangerouslySetInnerHTML={{ __html: htmlTokens }}></div>;
};

export async function getShikiHtml(code: string) {
	const karmaHighlighter = await getKarmaHighlighter();
	const theme = karmaHighlighter.getTheme();
	const tokens = karmaHighlighter.codeToThemedTokens(
		code.trim().replaceAll("\t", "  "),
		"tsx",
		// @ts-expect-error custom theme
		theme,
		{ includeExplanation: false }
	);

	const { fg, bg } = theme;
	const html = renderToHtml(tokens, {
		fg,
		bg,
		// langId: "tsx",
		themeName: "karma",
		elements: {
			// @ts-expect-error shut up
			pre: CodeBlock,
		},
	});

	return html;
}

export const initialCodeExample = `
import { useState, useEffect } from "react";

import { getKarmaHighlighter } from "./highlighter";

import { renderToHtml } from "@/components/shiki/renderer";
import { CodeBlock } from "@/components/shiki/styled";

export const ShikiPlayground = () => {
	const [htmlTokens, setHtmlTokens] = useState("");

	useEffect(() => {
		async function setInitialHtml() {
			setHtmlTokens(await getShikiHtml(initialCodeExample));
		}

		setInitialHtml();
	}, []);

	return <div dangerouslySetInnerHTML={{ __html: htmlTokens }}></div>;
};

export async function getShikiHtml(code: string) {
	const karmaHighlighter = await getKarmaHighlighter();
	const theme = karmaHighlighter.getTheme();
	const tokens = karmaHighlighter.codeToThemedTokens(
		code.trim().replaceAll("\\t", "  "),
		"tsx",
		// @ts-expect-error custom theme
		theme,
		{ includeExplanation: false }
	);

	const { fg, bg } = theme;
	const html = renderToHtml(tokens, {
		fg,
		bg,
		themeName: "karma",
		elements: {
			// @ts-expect-error shut up
			pre: CodeBlock,
		},
	});

	return html;
}
`;
