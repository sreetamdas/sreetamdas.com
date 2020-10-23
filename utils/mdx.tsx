import { ComponentType } from "@mdx-js/react";
import Link from "next/link";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React, { createElement, CSSProperties, PropsWithChildren } from "react";
import { FiLink } from "react-icons/fi";
import styled from "styled-components";

import { LinkedHeaderIconWrapper } from "styles/blog";
import { useHover } from "utils/hooks";

type TMDXProviderCodeblockPassedProps = {
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

export { MDXCodeBlock, MDXImageWithWrapper, MDXHeadingWrapper, MDXLinkWrapper };

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
			theme={karmaPrismTheme}
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

const MDXImageWithWrapper = ({ alt, src }: { alt: string; src: string }) => (
	<img
		{...{ alt, src }}
		style={{
			maxWidth: "var(--max-width)",
			width: "100%",
			borderRadius: "var(--border-radius)",
		}}
	/>
);

const MDXLinkStyled = styled.span`
	& a {
		color: var(--color-primary);
		border-bottom: 0.18em solid var(--color-primary-accent);

		:hover {
			color: var(--color-primary-accent);
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
				<a {...props}>{props.children}</a>
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
	const ActualHeading = createElement(
		el,
		propsWithStyles,
		LinkIcons,
		children
	);

	return <div ref={hoverRef}>{ActualHeading}</div>;
};

const MDXHeadingWrapper = {
	h1: (props: TIDPropsWithChildren) => HandleMDXHeaderElement("h1", props),
	h2: (props: TIDPropsWithChildren) => HandleMDXHeaderElement("h2", props),
	h3: (props: TIDPropsWithChildren) => HandleMDXHeaderElement("h3", props),
};

const CodePreBlockWithHighlight = styled.pre`
	padding: 15px;
	border-radius: var(--border-radius);
	font-size: 14px;
	overflow-x: scroll;

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

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang {2, 4-5}
 */
const RE = /{([\d,-]+)}/;
const calculateLinesToHighlight = (meta: string) => {
	const regExpExecArray = RE.exec(meta);
	if (!RE.test(meta) || regExpExecArray === null) {
		return () => false;
	} else {
		const lineNumbers = regExpExecArray[1]
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

/**
 * many thanks to @NikkitaFTW and @_philpl for prism.dotenv.dev!
 */
const karmaPrismTheme = {
	plain: {
		color: "#f7f1ff",
		backgroundColor: "#0a0e14",
	},
	styles: [
		{
			types: ["comment"],
			style: {
				color: "#363742",
				fontStyle: "italic" as const,
			},
		},
		{
			types: ["constant", "number", "builtin", "char"],
			style: {
				color: "#AF98E6",
			},
		},
		{
			types: ["symbol"],
			style: {
				color: "#FD9353",
			},
		},
		{
			types: ["class-name"],
			style: {
				color: "#51C7DA",
			},
		},
		{
			types: ["function", "inserted"],
			style: {
				color: "#7BD88F",
			},
		},
		{
			types: ["tag", "keyword", "operator", "deleted", "changed"],
			style: {
				color: "#FC618D",
			},
		},
		{
			types: ["attr-name"],
			style: {
				color: "#51C7DA",
				fontStyle: "italic" as const,
			},
		},
		{
			types: ["punctuation"],
			style: {
				color: "#88898F",
			},
		},
		{
			types: ["string"],
			style: {
				color: "#E3CF65",
			},
		},
		{
			types: ["property"],
			style: {
				color: "#D7D7D7",
			},
		},
		{
			types: ["variable"],
			style: {
				color: "#FD9353",
				fontStyle: "italic" as const,
			},
		},
	],
};
