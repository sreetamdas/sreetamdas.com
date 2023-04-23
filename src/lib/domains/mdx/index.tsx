import type { MDXContentProps } from "mdx-bundler/client";
import type { HTMLAttributes } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Code } from "@/lib/components/Typography/Code";
import { UnorderedList } from "@/lib/components/Typography/Lists";

export const customMDXComponents: MDXContentProps["components"] = {
	h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<h1 className="pt-12 font-serif text-8xl" {...props}>
			{children}
		</h1>
	),
	h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<h2 className="pt-9 font-serif text-4xl" {...props}>
			{children}
		</h2>
	),
	h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
		<h3 className="pt-6 font-serif text-2xl" {...props}>
			{children}
		</h3>
	),
	p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
		<p className="py-2.5 first:pt-0 last:pb-0" {...props}>
			{children}
		</p>
	),
	a: LinkTo,
	code: Code,
	ul: UnorderedList,
	hr: () => <hr className="my-3" />,
};
