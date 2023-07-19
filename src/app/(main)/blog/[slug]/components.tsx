import type { ReactNode } from "react";

export const Highlight = ({ children }: { children: ReactNode }) => (
	<span className="font-bold italic text-primary">{children}</span>
);
