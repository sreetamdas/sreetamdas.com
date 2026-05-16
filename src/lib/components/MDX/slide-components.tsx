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
import { Blockquote, Code, Heading, UnorderedList } from "@/lib/components/Typography";
import { CodeBlock } from "@/lib/domains/shiki/CodeBlock";
import { Steps } from "@/lib/domains/slides/steps";

export const slideMDXComponents: MDXComponents = {
	h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h1
			className="group text-primary pt-10 pb-6 font-serif text-7xl leading-normal font-bold font-stretch-semi-condensed"
			{...props}
			disable_slug
		>
			{children}
		</Heading.h1>
	),
	h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h2
			className="group text-primary pt-10 pb-6 font-serif text-4xl leading-normal font-bold font-stretch-semi-condensed"
			{...props}
			disable_slug
		>
			{children}
		</Heading.h2>
	),
	h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<Heading.h3
			className="group text-primary pt-10 pb-6 font-serif text-3xl leading-normal font-bold font-stretch-semi-condensed"
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
	blockquote: (props) => <Blockquote {...props} className="border-secondary border-l-6 italic" />,
	Steps,
};
