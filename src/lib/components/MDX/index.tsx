import { type MDX } from "contentlayer/core";
// eslint-disable-next-line import/no-unresolved
import { type MDXComponents } from "mdx/types";
import { useMDXComponent } from "next-contentlayer/hooks";
import { type HTMLAttributes } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Image } from "@/lib/components/Image";
import { Code, UnorderedList } from "@/lib/components/Typography";
import { CodeBlock } from "@/lib/domains/shiki/components";

export * from "./utilities";

export const customMDXComponents: MDXComponents = {
	h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<h1 className="pt-12 font-serif text-8xl leading-normal text-primary" {...props}>
			{children}
		</h1>
	),
	h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<h2 className="pt-9 font-serif text-4xl leading-normal text-primary" {...props}>
			{children}
		</h2>
	),
	h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<h3 className="pt-6 font-serif text-2xl leading-normal text-primary" {...props}>
			{children}
		</h3>
	),
	p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
		<p className="py-2.5 first:pt-0 last:pb-0" {...props}>
			{children}
		</p>
	),
	// @ts-expect-error href is required
	a: LinkTo,
	code: Code,
	pre: CodeBlock,
	ul: UnorderedList,
	img: Image,
	hr: () => <hr className="my-3" />,
};

type MDXContentCodeType = Pick<MDX, "code"> & {
	components?: MDXComponents;
};
export const MDXContent = ({ code, components = {} }: MDXContentCodeType) => {
	const Content = useMDXComponent(code);

	return <Content components={{ ...customMDXComponents, ...components }} />;
};
