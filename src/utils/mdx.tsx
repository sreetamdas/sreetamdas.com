import { ComponentType } from "@mdx-js/react";
import Link from "next/link";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React, { createElement, CSSProperties, PropsWithChildren } from "react";
import { FiLink } from "react-icons/fi";
import styled from "styled-components";

import { KARMA_PRISM_THEME } from "pages/karma";
import { LinkedHeaderIconWrapper } from "styles/blog";
import { useHover } from "utils/hooks";

type TMDXProviderCodeblockPassedProps = {
	children: {
		props: {
			children: string;
			className: string;
			originalType: string;
			parentName: string;
			metastring?: string;
			mdxType: string;
			[key: string]: any;
			filename?: string;
		};
	};
};

export { MDXCodeBlock, ImageWrapper, MDXHeadingWrapper, MDXLinkWrapper };

const MDXCodeBlock = (props: TMDXProviderCodeblockPassedProps) => {
	const {
		children: {
			props: { children, className, metastring },
		},
	} = props;

	const language = className.replace(/language-/, "");
	const shouldHighlightLine = calculateLinesToHighlight(metastring!);

	return (
		<Highlight
			{...defaultProps}
			code={children.trim()}
			language={language as Language}
			theme={KARMA_PRISM_THEME}
		>
			{({ className, style, tokens, getLineProps, getTokenProps }) => (
				<CodePreBlockWithHighlight {...{ style, className }}>
					<CodeBlockLanguageWrapper>
						{language.toLocaleUpperCase()}
					</CodeBlockLanguageWrapper>
					{tokens.map((line, i) => {
						const lineProps = getLineProps({ line, key: i });
						if (shouldHighlightLine(i)) {
							lineProps.className = `${lineProps.className} highlight-line`;
						}
						return (
							<div {...lineProps} key={i}>
								<CodeblockLineNumber>{i + 1}</CodeblockLineNumber>
								{line.map((token, key) => (
									<span {...getTokenProps({ token, key })} key={key} />
								))}
							</div>
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

const ImageWrapper = ({ alt, src }: { alt: string; src: string }) => {
	const type = src.slice(-3);

	if (type === "mp4") {
		return (
			<video
				autoPlay
				loop
				muted
				controls
				style={{
					maxWidth: "var(--max-width)",
					width: "100%",
					borderRadius: "var(--border-radius)",
				}}
			>
				<source {...{ src }} />
				{alt}
			</video>
		);
	}
	return (
		<img
			{...{ alt, src }}
			style={{
				maxWidth: "var(--max-width)",
				width: "100%",
				borderRadius: "var(--border-radius)",
			}}
		/>
	);
};

export const MDXLinkStyled = styled.span`
	& a {
		color: var(--color-primary-accent);

		:hover {
			border-bottom: 0.18em solid var(--color-primary-accent);
			text-decoration: none;
		}
	}
`;
type THrefPropsWithChildren = PropsWithChildren<{ href: string }>;
const MDXLinkWrapper = (props: THrefPropsWithChildren) => {
	return (
		<MDXLinkStyled>
			{props.href[0] === "/" ? (
				<Link {...props} />
			) : (
				<a {...props} target="_blank" rel="noopener noreferrer">
					{props.children}
				</a>
			)}
		</MDXLinkStyled>
	);
};

type TIDPropsWithChildren = PropsWithChildren<{ id: string }>;
const HandleMDXHeaderElement = (
	el: ComponentType,
	// propsWithoutChildren contains `id` attr here
	{ children, ...propsWithoutChildren }: TIDPropsWithChildren
) => {
	const [hoverRef, isHovered] = useHover();
	const headerStyles: CSSProperties = {
		color: "var(--color-primary-accent)",
	};
	const propsWithStyles = { ...propsWithoutChildren, style: headerStyles };
	const LinkIcons = (
		<LinkedHeaderIconWrapper
			href={`#${propsWithoutChildren.id ?? ""}`}
			isHovered={isHovered}
		>
			<FiLink aria-label={propsWithoutChildren.id} />
		</LinkedHeaderIconWrapper>
	);
	const ActualHeading = createElement(el, propsWithStyles, LinkIcons, children);

	return <div ref={hoverRef}>{ActualHeading}</div>;
};

const MDXHeadingWrapper = {
	h1: (props: TIDPropsWithChildren) => HandleMDXHeaderElement("h1", props),
	h2: (props: TIDPropsWithChildren) => HandleMDXHeaderElement("h2", props),
	h3: (props: TIDPropsWithChildren) => HandleMDXHeaderElement("h3", props),
};

const CodePreBlockWithHighlight = styled.pre`
	padding: 15px;
	margin: 16px -15px;
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
	opacity: 0.25;
	text-align: center;
	position: relative;
`;

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang {2, 4-5}
 */
const RE_LINE_HIGHLIGHT = /{([\d,-]+)}/;
const calculateLinesToHighlight = (meta: string) => {
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
