import React from "react";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import nightOwl from "prism-react-renderer/themes/nightOwl";
import styled from "styled-components";

type TMDXProviderPassedProps = {
	children: {
		props: {
			children: string;
			className: string;
			originalType: string;
			parentName: string;
			metastring: string;
			mdxType: string;
			[key: string]: any;
		};
	};
};

const MDXCodeBlock = (props: TMDXProviderPassedProps) => {
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
			theme={nightOwl}
		>
			{({ className, style, tokens, getLineProps, getTokenProps }) => (
				<CodePreBlockWithHighlight
					className={className}
					style={{ ...style }}
				>
					{tokens.map((line, i) => {
						const lineProps = getLineProps({ line, key: i });
						if (shouldHighlightLine(i)) {
							lineProps.className = `${lineProps.className} highlight-line`;
						}
						return (
							<div {...lineProps} key={i}>
								{line.map((token, key) => (
									<span
										{...getTokenProps({ token, key })}
										key={key}
									/>
								))}
							</div>
						);
					})}
				</CodePreBlockWithHighlight>
			)}
		</Highlight>
	);
};

export { MDXCodeBlock };

const CodePreBlockWithHighlight = styled.pre`
	padding: 15px;
	border-radius: 5px;
	font-size: 14px;

	.highlight-line {
		background-color: rgb(53, 59, 69, 0.5);
		display: block;
		margin-right: -1em;
		margin-left: -1em;
		padding-right: 1em;
		padding-left: 0.75em;
		border-left: 0.3em solid #9d86e9;
	}
`;

const RE = /{([\d,-]+)}/;
const calculateLinesToHighlight = (meta: string) => {
	if (!RE.test(meta)) {
		return () => false;
	} else {
		const lineNumbers = RE.exec(meta)[1]
			.split(",")
			.map((v) => v.split("-").map((v) => parseInt(v, 10)));
		return (index: number) => {
			const lineNumber = index + 1;
			const inRange = lineNumbers.some(([start, end]) =>
				end
					? lineNumber >= start && lineNumber <= end
					: lineNumber === start
			);
			return inRange;
		};
	}
};
