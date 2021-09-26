import { promises as fs } from "fs";
import path from "path";

import { MDXProvider } from "@mdx-js/react";
import { bundleMDX } from "mdx-bundler";
import Image from "next/image";
import Link from "next/link";
import React, {
	createElement,
	CSSProperties,
	PropsWithChildren,
	ReactHTML,
	ReactNode,
} from "react";
import { FiLink } from "react-icons/fi";
import remarkSlug from "remark-slug";
import styled from "styled-components";

import { MDXCodeBlock } from "components/mdx/code";
import { LinkedHeaderIconWrapper } from "styles/blog";
import { Paragraph } from "styles/typography";
import { useHover } from "utils/hooks";

if (process.platform === "win32") {
	process.env.ESBUILD_BINARY_PATH = path.join(
		process.cwd(),
		"node_modules",
		"esbuild",
		"esbuild.exe"
	);
} else {
	process.env.ESBUILD_BINARY_PATH = path.join(
		process.cwd(),
		"node_modules",
		"esbuild",
		"bin",
		"esbuild"
	);
}

export async function bundleMDXWithOptions(filename: string) {
	const mdxSource = await fs.readFile(filename, "utf8");

	return bundleMDX(mdxSource, {
		cwd: path.dirname(filename),
		xdmOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkSlug];
			options.rehypePlugins = [...(options.rehypePlugins ?? [])];

			return options;
		},
		esbuildOptions(options) {
			options.platform = "node";

			return options;
		},
	});
}

export const ImageWrapper = ({ alt, src }: { alt: string; src: string }) => {
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
		<Image
			{...{ alt, src }}
			loading="lazy"
			// style={{
			// 	maxWidth: "var(--max-width)",
			// 	width: "100%",
			// 	borderRadius: "var(--border-radius)",
			// }}
		/>
	);
};

export const MDXLinkStyled = styled.span`
	& a {
		color: var(--color-primary-accent);

		:hover {
			border-bottom: 2px solid var(--color-primary-accent);
			text-decoration: none;
		}
	}
`;

const MDXLinkWrapper = (props: PropsWithChildren<{ href: string }>) => {
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
	el: keyof ReactHTML,
	// propsWithoutChildren contains `id` attr here
	{ children, ...propsWithoutChildren }: TIDPropsWithChildren
) => {
	const [hoverRef, isHovered] = useHover();
	const headerStyles: CSSProperties = {
		color: "var(--color-primary-accent)",
	};
	const propsWithStyles = { ...propsWithoutChildren, style: headerStyles };
	const LinkIcons = (
		<LinkedHeaderIconWrapper href={`#${propsWithoutChildren.id ?? ""}`} isHovered={isHovered}>
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

export const MDXComponents = {
	p: Paragraph,
	h1: MDXHeadingWrapper.h1,
	h2: MDXHeadingWrapper.h2,
	h3: MDXHeadingWrapper.h3,
	pre: MDXCodeBlock,
	img: ImageWrapper,
	a: MDXLinkWrapper,
};

export const MDXWrapper = ({ children }: PropsWithChildren<ReactNode>) => (
	<MDXProvider components={MDXComponents}>{children}</MDXProvider>
);
