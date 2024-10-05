import { type MDXComponents } from "mdx/types";
import { type ReactElement } from "react";
import * as runtime from "react/jsx-runtime";

import { customMDXComponents } from "./components";

export { customMDXComponents };

type MDXContentCodeType = {
	code: string;
	components?: MDXComponents | (() => Promise<ReactElement>);
};
export const MDXContent = ({ code, components = {} }: MDXContentCodeType) => {
	const Content = useMDXComponent(code);

	return <Content components={{ ...customMDXComponents, ...components }} />;
};

function useMDXComponent(code: string) {
	const fn = new Function(code);
	return fn({ ...runtime }).default;
}
