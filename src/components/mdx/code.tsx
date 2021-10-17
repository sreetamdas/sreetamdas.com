import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React, { CSSProperties } from "react";
import styled, { css } from "styled-components";
import { IRawThemeSetting } from "vscode-textmate";

import { KARMA_PRISM_THEME } from "pages/karma";
import { breakpoint } from "utils/style";

export { MDXCodeBlock };

type TMDXProviderCodeblockPassedProps = {
	highlight?: string;
	children: {
		props: {
			children: string;
			className: string;
			originalType: string;
			parentName: string;
			metastring?: string;
			mdxType: string;
			filename?: string;
			[key: string]: unknown;
		};
	};
};

const MDXCodeBlock = (props: TMDXProviderCodeblockPassedProps) => {
	const {
		highlight,
		children: {
			props: { children, className },
		},
	} = props;

	const language = className.replace(/language-/, "");
	const shouldHighlightLine = calculateLinesToHighlight(highlight);

	return (
		<Highlight
			{...defaultProps}
			code={children.trim()}
			language={language as Language}
			theme={KARMA_PRISM_THEME}
		>
			{({ className, style, tokens, getLineProps, getTokenProps }) => (
				<CodePreBlockWithHighlight {...{ style, className }}>
					<CodeBlockLanguageWrapper>{language.toLocaleUpperCase()}</CodeBlockLanguageWrapper>
					{tokens.map((line, i) => {
						const lineProps = getLineProps({ line, key: i });
						if (shouldHighlightLine(i)) {
							lineProps.className = `${lineProps.className} highlight-line`;
						}
						return (
							<CodeblockLineWrapper {...lineProps} key={i}>
								<CodeblockLineNumber>{i + 1}</CodeblockLineNumber>
								{line.map((token, key) => (
									<span {...getTokenProps({ token, key })} key={key} />
								))}
							</CodeblockLineWrapper>
						);
					})}
				</CodePreBlockWithHighlight>
			)}
		</Highlight>
	);
};

const CodeBlockLanguageWrapper = styled.span`
	float: right;
	background-color: #2c2c2c;
	color: #bbbbbb;
	margin-top: -15px;
	padding: 7.5px 5px;
	border-bottom-left-radius: var(--border-radius);
	border-bottom-right-radius: var(--border-radius);
`;

export const CodePreBlockWithHighlight = styled.pre`
	padding: 20px;
	margin: 1rem -20px;
	border-radius: var(--border-radius);
	overflow-x: scroll;
	white-space: pre-wrap;
	word-wrap: break-word;

	.highlight-line {
		background-color: rgb(255, 255, 255, 0.07);
		display: block;
		margin-right: -1em;
		margin-left: -1em;
		padding-right: 1em;
		padding-left: 0.75em;
		border-left: 0.3em solid #9d86e9;
	}
`;

const CodeblockLineNumber = styled.span`
	display: inline-block;
	padding-right: 0.6em;
	min-width: 1rem;
	user-select: none;
	text-align: center;

	${breakpoint.until.md(css`
		display: none;
	`)}
`;

const CodeblockLineWrapper = styled.div`
	& > ${CodeblockLineNumber} {
		color: #424242;
	}
`;

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang {2, 4-5}
 */
const RE_LINE_HIGHLIGHT = /([\d,-]+)/;
const calculateLinesToHighlight = (meta = "") => {
	const regExpExecArray = RE_LINE_HIGHLIGHT.exec(meta);
	if (!RE_LINE_HIGHLIGHT.test(meta) || regExpExecArray === null) {
		return () => false;
	} else {
		const lineNumbers = regExpExecArray[1]
			.split(",")
			.map((v) => v.split("-").map((v) => parseInt(v, 10)));
		return (index: number) => {
			const lineNumber = index + 1;
			const inRange = lineNumbers.some(([start, end]) =>
				end ? lineNumber >= start && lineNumber <= end : lineNumber === start
			);
			return inRange;
		};
	}
};

enum FontStyle {
	NotSet = -1,
	None = 0,
	Italic = 1,
	Bold = 2,
	Underline = 4,
}
interface IThemedTokenScopeExplanation {
	scopeName: string;
	themeMatches: IRawThemeSetting[];
}

interface IThemedTokenExplanation {
	content: string;
	scopes: IThemedTokenScopeExplanation[];
}

/**
 * A single token with color, and optionally with explanation.
 */
interface IThemedToken {
	/**
	 * The content of the token
	 */
	content: string;
	/**
	 * 6 or 8 digit hex code representation of the token's color
	 */
	color?: string;
	/**
	 * Font style of token. Can be None/Italic/Bold/Underline
	 */
	fontStyle?: FontStyle;
	/**
	 * Explanation of
	 *
	 * - token text's matching scopes
	 * - reason that token text is given a color (one matching scope matches a rule (scope -> color) in the theme)
	 */
	explanation?: IThemedTokenExplanation[];
}

interface HtmlRendererOptions {
	langId?: string;
	fg?: string;
	bg?: string;
}

function getTokenStyles(token: IThemedToken, options?: HtmlRendererOptions): CSSProperties {
	return {
		color: token.color || options?.fg,
		fontStyle: token.fontStyle === FontStyle.Italic ? "italic" : undefined,
		fontWeight: token.fontStyle === FontStyle.Bold ? "bold" : undefined,
		textDecoration: token.fontStyle === FontStyle.Underline ? "underline" : undefined,
	};
}

type TCodeBlock = {
	lines: IThemedToken[][];
	options?: HtmlRendererOptions;
};
export const CodeBlock = (props: TCodeBlock) => {
	const { lines, options } = props;
	console.log({ props });

	return <div {...props} />;

	const bgColor = options?.bg ?? "#0a0e14";

	return (
		<CodePreBlockWithHighlight className="shiki" style={{ backgroundColor: bgColor }}>
			{lines.map((line, index) => (
				<div className="line" key={`${line.join("")}-${index}}`}>
					{line.map((token, index) => (
						<span key={`${token.content}-${index}`} style={{ ...getTokenStyles(token, options) }}>
							{/* replace tabs with space */}
							{token.content.replace(/\t/g, "  ")}
						</span>
					))}
				</div>
			))}
		</CodePreBlockWithHighlight>
	);
};
