import { createElement, CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactHTML } from "react";
import { FiLink } from "react-icons/fi";

import { LinkedHeaderIconWrapper } from "@/styles/blog";
import { useHover } from "@/utils/hooks";

type HeadingProps = DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
const HandleMDXHeaderElement = (
	el: keyof ReactHTML,
	// propsWithoutChildren contains `id` attr here
	{ children, ...propsWithoutChildren }: HeadingProps
) => {
	const [hoverRef, isHovered] = useHover<HTMLHeadingElement>();
	const headerStyles: CSSProperties = {
		color: "var(--color-primary-accent)",
	};
	const propsWithStyles = { ...propsWithoutChildren, style: headerStyles, ref: hoverRef };
	const LinkIcons = (
		<LinkedHeaderIconWrapper href={`#${propsWithoutChildren.id ?? ""}`} $isHovered={isHovered}>
			<FiLink aria-label={propsWithoutChildren.id} />
		</LinkedHeaderIconWrapper>
	);
	const ActualHeading = createElement(el, propsWithStyles, LinkIcons, children);

	return ActualHeading;
};
export const MDXHeadingWrapper = {
	h1: (props: HeadingProps) => HandleMDXHeaderElement("h1", props),
	h2: (props: HeadingProps) => HandleMDXHeaderElement("h2", props),
	h3: (props: HeadingProps) => HandleMDXHeaderElement("h3", props),
};
