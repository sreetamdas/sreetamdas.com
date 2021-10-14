import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React from "react";
import styled, { css } from "styled-components";

import { KARMA_PRISM_THEME } from "pages/karma";
import { breakpoint } from "utils/style";

export { MDXCodeBlock };

type TMDXProviderCodeblockPassedProps = {
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
		children: {
			props: { children, className, metastring },
		},
	} = props;

	const language = className.replace(/language-/, "");
	const shouldHighlightLine = calculateLinesToHighlight(metastring);

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
const RE_LINE_HIGHLIGHT = /{([\d,-]+)}/;
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
