import type { MDXComponents } from "mdx/types";
import { ReactNode } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Code } from "@/lib/components/Typography/Code";
import { UnorderedList } from "@/lib/components/Typography/Lists";

type UnknownChildren = {
	children: ReactNode;
};

export function useMDXComponents(components: MDXComponents) {
	// Allows customizing built-in components, e.g. to add styling.
	return {
		p: ({ children }: UnknownChildren) => <p className="py-2.5 text-lg">{children}</p>,
		a: LinkTo,
		code: Code,
		ul: UnorderedList,
		...components,
	};
}
