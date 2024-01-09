import { type MDX } from "contentlayer/core";
// eslint-disable-next-line import/no-unresolved
import { type MDXComponents } from "mdx/types";
import { useMDXComponent } from "next-contentlayer/hooks";

import { customMDXComponents } from "./components";

export { MDXClientContent } from "./client";
export { customMDXComponents };

type MDXContentCodeType = Pick<MDX, "code"> & {
	components?: MDXComponents | (() => Promise<JSX.Element>);
};
export const MDXContent = ({ code, components = {} }: MDXContentCodeType) => {
	const Content = useMDXComponent(code);

	return <Content components={{ ...customMDXComponents, ...components }} />;
};
