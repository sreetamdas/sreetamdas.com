import { CSSProperties, PropsWithChildren } from "react";
import styled, { css } from "styled-components";

import { breakpoint } from "@/utils/style";

const CodePreBlockWithHighlight = styled.pre`
	padding: 20px;
	margin: 1rem -20px;
	margin-left: -2.5rem;
	border-radius: var(--border-radius);
	overflow-x: scroll;

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
			margin-right: -1.3em;
			margin-left: -1.3em;
			padding-right: 1em;
			padding-left: 1em;
			border-left: 0.3em solid #9d86e9;
		`}

	& > ${CodeblockLineNumber} {
		color: #424242;
	}
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

export const CodeBlock = (
	props: PropsWithChildren<{ language: string; highlight?: string; style: CSSProperties }>
) => {
	const { language, children, highlight, style } = props;
	const shouldHighlightLine = calculateLinesToHighlight(highlight);

	return (
		<CodePreBlockWithHighlight {...{ style }}>
			<CodeBlockLanguageWrapper>{language.toLocaleUpperCase()}</CodeBlockLanguageWrapper>
			{Array.isArray(children) ? (
				children
					?.filter((line) => line !== "\n")
					.map((line, i) => (
						<CodeblockLineWrapper key={i} $highlight={shouldHighlightLine(i)}>
							<CodeblockLineNumber>{i + 1}</CodeblockLineNumber>
							{line}
						</CodeblockLineWrapper>
					))
			) : (
				<CodeblockLineWrapper>
					<CodeblockLineNumber>1</CodeblockLineNumber>
					{children}
				</CodeblockLineWrapper>
			)}
		</CodePreBlockWithHighlight>
	);
};
