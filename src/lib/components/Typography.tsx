import {
	Children,
	createElement,
	type DetailedHTMLProps,
	type HTMLAttributes,
	isValidElement,
	type ReactNode,
} from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FiLink } from "react-icons/fi";

import { LinkTo } from "@/lib/components/Anchor";
import { cn } from "@/lib/helpers/utils";

/**
 * Derives a URL-friendly slug from heading children text.
 * Handles plain strings and nested React elements, producing a kebab-case id.
 */
function slugify(children: ReactNode): string {
	const text = extractText(children);
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function extractText(node: ReactNode): string {
	if (typeof node === "string") return node;
	if (typeof node === "number") return String(node);
	if (!node) return "";

	if (Array.isArray(node)) {
		return node.map(extractText).join("");
	}

	if (isValidElement(node) && node.props) {
		return extractText((node.props as { children?: ReactNode }).children);
	}

	return "";
}

type LinkAnchorProp = Required<Pick<HTMLAttributes<HTMLHeadElement>, "id">>;
export const LinkAnchor = ({ id }: LinkAnchorProp) => (
	<LinkTo
		href={`#${id}`}
		replaceClasses
		className="text-primary focus-visible:outline-secondary absolute -translate-x-[125%] translate-y-2 opacity-0 transition-opacity group-hover:opacity-75 focus-visible:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed max-md:hidden"
	>
		<FiLink aria-label={id} />
	</LinkTo>
);

type HeadingProps = DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
const getHeading = (
	el: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
	{ children, ...propsWithoutChildren }: HeadingProps,
) => {
	// Prefer an id from rehype-slug (build-time), fall back to runtime slugification.
	const id = propsWithoutChildren.id || slugify(children);

	const ActualHeading = createElement(
		el,
		{ ...propsWithoutChildren, id },
		<LinkAnchor id={id} />,
		children,
	);

	return ActualHeading;
};
export const Heading = {
	h1: (props: HeadingProps) => getHeading("h1", props),
	h2: (props: HeadingProps) => getHeading("h2", props),
	h3: (props: HeadingProps) => getHeading("h3", props),
	h4: (props: HeadingProps) => getHeading("h4", props),
	h5: (props: HeadingProps) => getHeading("h5", props),
	h6: (props: HeadingProps) => getHeading("h6", props),
};

export const UnorderedList = (props: HTMLAttributes<HTMLUListElement>) => (
	<ul className="mx-0 my-3 pl-0" {...props}>
		{Children.map(props.children, (child) => {
			if (isValidElement(child)) {
				return (
					// @ts-expect-error child props is not unknown
					<li className="mb-3 flex list-none items-start p-0 last:mb-0 only:mt-3" {...child.props}>
						<FaLongArrowAltRight aria-label="marker" className="text-primary mt-1 mr-2.5" />
						<span className="shrink grow basis-0 [&>ul]:my-0 [&>ul>li]:m-0">
							{/* @ts-expect-error child props is not unknown */}
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
			"mx-0.5 rounded-global bg-secondary/20 px-1 py-0.5 font-mono text-[0.9em] transition-[color,background-color] dark:bg-secondary/35",
			className,
		)}
		{...props}
	>
		{children}
	</code>
);

export const Gradient = ({ children }: { children: ReactNode }) => (
	<span className="from-primary to-secondary w-fit bg-gradient-to-r box-decoration-slice bg-clip-text text-transparent">
		{children}
	</span>
);

export const Blockquote = ({ children, className, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
	<blockquote
		className={cn(
			"text-md -mx-4 rounded-global bg-foreground/10 p-1 px-4 py-8 font-serif transition-[color,background-color] dark:bg-foreground/20",
			className,
		)}
		{...props}
	>
		{children}
	</blockquote>
);

export const Highlight = ({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
	<span className={cn("font-serif font-bold text-secondary", className)} {...props}>
		{children}
	</span>
);
