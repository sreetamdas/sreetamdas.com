import {
	Children,
	type DetailedHTMLProps,
	type HTMLAttributes,
	type ReactHTML,
	type ReactNode,
	createElement,
	isValidElement,
} from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FiLink } from "react-icons/fi";

import { LinkTo } from "@/lib/components/Anchor";
import { cn } from "@/lib/helpers/utils";

type HeadingProps = DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
const getHeading = (
	el: Extract<keyof ReactHTML, "h1" | "h2" | "h3">,
	// propsWithoutChildren contains `id` attr here
	{ children, ...propsWithoutChildren }: HeadingProps,
) => {
	const LinkIcons = (
		<LinkTo
			href={`#${propsWithoutChildren.id ?? ""}`}
			replaceClasses
			className="absolute -translate-x-[125%] translate-y-2 text-primary opacity-0 transition-opacity group-hover:opacity-75 max-md:hidden"
		>
			<FiLink aria-label={propsWithoutChildren.id} />
		</LinkTo>
	);
	const ActualHeading = createElement(el, propsWithoutChildren, LinkIcons, children);

	return ActualHeading;
};
export const Heading = {
	h1: (props: HeadingProps) => getHeading("h1", props),
	h2: (props: HeadingProps) => getHeading("h2", props),
	h3: (props: HeadingProps) => getHeading("h3", props),
};

export const UnorderedList = (props: HTMLAttributes<HTMLUListElement>) => (
	<ul className="mx-0 my-3 pl-0" {...props}>
		{Children.map(props.children, (child) => {
			if (isValidElement(child)) {
				return (
					<li className="mb-3 flex list-none items-start p-0 last:mb-0 only:mt-3" {...child.props}>
						<FaLongArrowAltRight aria-label="marker" className="mr-2.5 mt-1 text-primary" />
						<span className="shrink grow basis-0 [&>ul>li]:m-0 [&>ul]:my-0">
							{child.props.children}
						</span>
					</li>
				);
			}
			return null;
		})}
	</ul>
);

export const Code = ({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
	<code
		className={cn(
			"mx-0.5 rounded bg-foreground/10 p-1 font-mono text-[0.875em] transition-[color,background-color] dark:bg-foreground/20",
			className,
		)}
		{...props}
	>
		{children}
	</code>
);

export const Gradient = ({ children }: { children: ReactNode }) => (
	<span className="w-fit bg-gradient-to-r from-primary to-secondary box-decoration-slice bg-clip-text text-transparent">
		{children}
	</span>
);

export const Blockquote = ({ children, className, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
	<blockquote
		className={cn(
			"text-md -mx-4 rounded bg-foreground/10 p-1 px-4 py-8 font-serif transition-[color,background-color] dark:bg-foreground/20",
			className,
		)}
		{...props}
	>
		{children}
	</blockquote>
);
