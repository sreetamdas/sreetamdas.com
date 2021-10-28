import Link from "next/link";
import React, { createElement, CSSProperties, PropsWithChildren, ReactHTML } from "react";
import { FiLink } from "react-icons/fi";
import styled from "styled-components";

import { CustomImage } from "./images";
import { OrderedList, UnorderedList } from "./lists";

import { CodeBlock } from "components/shiki/styled";
import { LinkedHeaderIconWrapper } from "styles/blog";
import { Paragraph } from "styles/typography";
import { useHover } from "utils/hooks";

export const MDXLinkStyledWrapper = styled.span`
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
		<MDXLinkStyledWrapper>
			{
				// link to internal page or skip link
				"/#".includes(props.href[0]) ? (
					<Link {...props} />
				) : (
					<a {...props} target="_blank" rel="noopener noreferrer">
						{props.children}
					</a>
				)
			}
		</MDXLinkStyledWrapper>
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
	pre: CodeBlock,
	img: CustomImage,
	a: MDXLinkWrapper,
	ul: UnorderedList,
	ol: OrderedList,
};
