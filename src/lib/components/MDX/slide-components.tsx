/**
 * MDX component overrides for slide decks.
 *
 * Larger text sizes and adjusted spacing compared to the blog defaults
 * in ./components.tsx. Automatically merged into every slide deck by
 * the slideDeckPlugin Vite plugin.
 */
import { type MDXComponents } from "mdx/types";
import { type HTMLAttributes } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Image } from "@/lib/components/Image";
import { Tweet } from "@/lib/components/Tweet";
import { Blockquote, Code, Heading, UnorderedList } from "@/lib/components/Typography";
import { CodeBlock } from "@/lib/domains/shiki/CodeBlock";
import { Steps } from "@/lib/domains/slides/steps";
import { cn } from "@/lib/helpers/utils";

export const slideMDXComponents: MDXComponents = {
	Tweet,
	h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h1
			className="group pt-10 pb-6 font-serif text-7xl leading-normal font-bold text-primary font-stretch-semi-condensed"
			{...props}
			disable_slug
		>
			{children}
		</Heading.h1>
	),
	h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h2
			className="group pt-10 pb-6 font-serif text-4xl leading-normal font-bold text-primary font-stretch-semi-condensed"
			{...props}
			disable_slug
		>
			{children}
		</Heading.h2>
	),
	h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h3
			className="group pt-10 pb-6 font-serif text-3xl leading-normal font-bold text-primary font-stretch-semi-condensed"
			{...props}
			disable_slug
		>
			{children}
		</Heading.h3>
	),
	p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
		<p className="py-3 font-serif text-3xl first:pt-0 last:pb-0" {...props}>
			{children}
		</p>
	),

	a: LinkTo,
	code: Code,
	pre: (props) => <CodeBlock {...props} className="ml-12" />,
	ul: (props) => (
		<UnorderedList {...props} listClasses="mb-5 only:mt-4" markClasses="mt-1.5 text-2xl" />
	),
	img: Image,
	hr: () => <hr className="my-4" />,
	blockquote: (props) => <Blockquote {...props} className="border-l-6 border-secondary italic" />,

	// safe-mdx renders GFM tables as table → thead/tbody → tr → td, using `td`
	// for header cells too (there is no `th`). Header styling therefore lives on
	// `thead`, and `cn` merges the empty `className` safe-mdx injects into rows
	// and cells so it can't clobber ours.
	table: ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => (
		<div className="my-6 overflow-x-auto">
			<table className={cn("w-full border-collapse font-serif text-2xl", className)} {...props} />
		</div>
	),
	thead: ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
		<thead
			className={cn(
				"border-b-2 border-secondary text-left [&_td]:font-bold [&_td]:text-primary",
				className,
			)}
			{...props}
		/>
	),
	tbody: ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
		<tbody className={cn("divide-y divide-foreground/15", className)} {...props} />
	),
	tr: ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
		<tr className={cn(className)} {...props} />
	),
	td: ({ className, children, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
		<td className={cn("px-4 py-3 align-top", className)} {...props}>
			{children}
		</td>
	),

	Steps,
};
