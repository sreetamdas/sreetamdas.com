import { ComponentType, ReactNode } from "react";

import { LinkTo } from "@/lib/components/Anchor";

type UnknownChildren = {
	children: ReactNode;
};

export function useMDXComponents(components: { [component: string]: ComponentType }) {
	// Allows customizing built-in components, e.g. to add styling.
	return {
		p: ({ children }: UnknownChildren) => <p className="py-2.5">{children}</p>,
		a: LinkTo,
		...components,
	};
}
