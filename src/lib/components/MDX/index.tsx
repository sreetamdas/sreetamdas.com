import { type MDXComponents } from "mdx/types";
import { SafeMdxRenderer } from "safe-mdx";
import { mdxParse } from "safe-mdx/parse";

import { customMDXComponents } from "./components";

export { customMDXComponents };

type MDXContentCodeType = {
  source?: string;
  components?: MDXComponents;
};
export const MDXContent = ({ source, components = {} }: MDXContentCodeType) => {
  const mergedComponents = { ...customMDXComponents, ...components };

  if (!source) {
    return null;
  }

  return (
    <SafeMdxRenderer
      markdown={source}
      mdast={mdxParse(source)}
      components={mergedComponents}
    />
  );
};
