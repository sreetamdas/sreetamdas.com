import { type ReactNode } from "react";

export default function FoobarLayout({ children }: { children: ReactNode }) {
	return children;
}

export const metadata = {
	robots: {
		index: false,
	},
};
