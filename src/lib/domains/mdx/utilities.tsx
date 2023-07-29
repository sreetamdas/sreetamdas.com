import type { ReactNode } from "react";

export const Highlight = ({ children }: { children: ReactNode }) => (
	<span className="font-bold italic text-primary">{children}</span>
);
export const Gradient = ({ children }: { children: ReactNode }) => (
	<span className="bg-gradient-to-r from-primary to-secondary box-decoration-slice bg-clip-text text-transparent">
		{children}
	</span>
);
