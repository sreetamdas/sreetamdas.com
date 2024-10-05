import { type MDXComponents } from "mdx/types";
import { type HTMLAttributes } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Image } from "@/lib/components/Image";
import { Blockquote, Code, Heading, UnorderedList } from "@/lib/components/Typography";
import { CodeBlock } from "@/lib/domains/shiki/CodeBlock";

export const customMDXComponents: MDXComponents = {
	h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h1
			className="group pt-10 font-serif text-8xl font-bold leading-normal tracking-tighter text-primary"
			{...props}
		>
			{children}
		</Heading.h1>
	),
	h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h2
			className="group pt-10 font-serif text-4xl font-bold leading-normal tracking-tighter text-primary"
			{...props}
		>
			{children}
		</Heading.h2>
	),
	h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h3
			className="group pt-10 font-serif text-2xl font-bold leading-normal tracking-tighter text-primary"
			{...props}
		>
			{children}
		</Heading.h3>
	),
	p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
		<p className="py-2.5 first:pt-0 last:pb-0" {...props}>
			{children}
		</p>
	),

	a: LinkTo,
	code: Code,
	pre: CodeBlock,
	ul: UnorderedList,
	// @ts-expect-error safer img
	img: Image,
	hr: () => <hr className="my-3" />,
	blockquote: Blockquote,
};
