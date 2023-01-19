import { MDXContentProps } from "mdx-bundler/client";

import { MDXAnchor } from "./anchor";
import { MDXHeadingWrapper } from "./heading";
import { CustomImage } from "./images";
import { MDXOrderedList, MDXUnorderedList } from "./lists";

import { CodeBlock } from "@/components/shiki/styled";
import { Paragraph } from "@/styles/typography";

export const MDXComponents: MDXContentProps["components"] = {
	p: Paragraph,
	h1: MDXHeadingWrapper.h1,
	h2: MDXHeadingWrapper.h2,
	h3: MDXHeadingWrapper.h3,
	// @ts-expect-error shut up
	pre: CodeBlock,
	img: CustomImage,
	a: MDXAnchor,
	ul: MDXUnorderedList,
	ol: MDXOrderedList,
};
