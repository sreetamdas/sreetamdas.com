import { type ReactNode } from "react";

/** Advent of Code style "[label]"; the brackets stay out of the accessible name. */
export const Bracketed = ({ children }: { children: ReactNode }) => (
	<>
		<span aria-hidden="true">[</span>
		{children}
		<span aria-hidden="true">]</span>
	</>
);
