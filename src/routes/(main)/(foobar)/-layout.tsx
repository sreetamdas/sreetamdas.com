import { type ReactNode } from "react";

import { SITE_TITLE_APPEND } from "@/config";

export default function FoobarLayout({ children }: { children: ReactNode }) {
	return children;
}

export const metadata = {
	title: `Foobar ${SITE_TITLE_APPEND}`,
	robots: {
		index: false,
	},
};
