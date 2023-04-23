import type { MDXComponents } from "mdx/types";

import { customMDXComponents } from "@/lib/domains/mdx";

export function useMDXComponents(components: MDXComponents) {
	// Allows customizing built-in components, e.g. to add styling.
	return {
		...components,
		...customMDXComponents,
	};
}
