"use client";

import { type MDX } from "contentlayer/core";
// eslint-disable-next-line import/no-unresolved
import { type MDXComponents } from "mdx/types";
import { useMDXComponent } from "next-contentlayer/hooks";

import { customMDXComponents } from "./components";

type MDXContentCodeType = Pick<MDX, "code"> & {
	components?: MDXComponents;
};
export const MDXClientContent = ({ code, components = {} }: MDXContentCodeType) => {
	const Content = useMDXComponent(code);

	return <Content components={{ ...customMDXComponents, ...components }} />;
};
