import { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import styled, { css } from "styled-components";

import { breakpoint } from "@/utils/style";

const CodePreBlockWithHighlight = styled.pre`
	padding: 20px;
	margin: 1rem -20px;
	margin-left: -2.5rem;
	border-radius: var(--border-radius);
	overflow-x: scroll;
	background-color: var(--color-codeBlock-bg);

	${breakpoint.until.md(css`
		margin-left: -20px;
	`)}
`;

const CodeBlockLanguageWrapper = styled.span`
	float: right;
	background-color: #2c2c2c;
	color: #bbbbbb;
	margin-top: -19px;
	padding: 10px 5px;
	border-bottom-left-radius: var(--border-radius);
	border-bottom-right-radius: var(--border-radius);
`;

const CodeblockLineNumber = styled.span`
	display: inline-block;
	padding-right: 0.5em;
	margin-left: -0.5rem;
	min-width: 2rem;
	user-select: none;
	text-align: center;
	color: #424242;

	${breakpoint.until.md(css`
		display: none;
	`)}
`;

const CodeblockLineWrapper = styled.div<{ $highlight?: boolean }>`
	height: calc(0.85rem * 1.5);

	${({ $highlight }) =>
		$highlight &&
		css`
			background-color: rgb(255, 255, 255, 0.07);
			display: block;
			margin-right: -20px;
			margin-left: -20px;
			padding-right: 15px;
			padding-left: 15px;
			border-left: 5px solid #9d86e9;

			${CodeblockLineNumber} {
				color: #9d86e9;
			}
		`}
`;

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang highlight="2,4-5"
 */
const RE_LINE_HIGHLIGHT = /([\d,-]+)/;
function calculateLinesToHighlight(meta = "") {
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
}

export const CodeBlock = (props: {
	children: string | { props: { children: ReactNode } };
	style?: { [styleProp: string]: string };
	language?: string;
	highlight?: string;
}) => {
	const { language = "js", children: codeElement, highlight, style } = props;
	const shouldHighlightLine = calculateLinesToHighlight(highlight);

	let children: string | ReactNode;

	if (typeof codeElement === "string") {
		children = codeElement;
	} else {
		children = codeElement.props.children;
	}

	return typeof children === "string" ? (
		renderToString(<CodePreBlockWithHighlight dangerouslySetInnerHTML={{ __html: children }} />)
	) : (
		<CodePreBlockWithHighlight {...{ style }}>
			<CodeBlockLanguageWrapper>{language.toLocaleUpperCase()}</CodeBlockLanguageWrapper>
			{Array.isArray(children) && (
				<code>
					{children
						?.filter((line) => line !== "\n")
						.map((line, i) => (
							<CodeblockLineWrapper key={i} $highlight={shouldHighlightLine(i)}>
								<CodeblockLineNumber>{i + 1}</CodeblockLineNumber>
								{line}
							</CodeblockLineWrapper>
						))}
				</code>
			)}
		</CodePreBlockWithHighlight>
	);
};
