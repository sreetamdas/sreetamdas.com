import { useState, useEffect } from "react";

import { getKarmaHighlighter } from "./helpers";

import { renderToHtml } from "@/components/shiki/renderer";
import { CodeBlock } from "@/components/shiki/styled";

type ShikiPlaygroundProps = {
	initialHtml?: string;
};

export const ShikiPlayground = ({ initialHtml: input }: ShikiPlaygroundProps) => {
	const initialHtml = input ?? "";
	const [htmlTokens, setHtmlTokens] = useState(initialHtml);

	useEffect(() => {
		async function setInitialHtml() {
			setHtmlTokens(await getShikiHtml(initialCodeExample));
		}

		setInitialHtml();
	}, [initialHtml]);

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
type ShikiPlaygroundProps = {
	initialHtml?: string;
};

export const ShikiPlayground = ({ initialHtml }: ShikiPlaygroundProps) => {
	const [htmlTokens, setHtmlTokens] = useState(initialHtml ?? "");

	useEffect(() => {
		async function setInitialHtml() {
			setHtmlTokens(await getTokens());
		}

		setInitialHtml();
	}, []);

	return <div dangerouslySetInnerHTML={{ __html: htmlTokens }} {...props}></div>;
};

async function getTokens() {
	const karmaHighlighter = await getKarmaHighlighter();
	const theme = karmaHighlighter.getTheme();
	const tokens = karmaHighlighter.codeToThemedTokens(
		initialContent.trim().replaceAll("\\t", "  "),
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
