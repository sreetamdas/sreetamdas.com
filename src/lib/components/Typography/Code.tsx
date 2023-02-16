import { HTMLAttributes } from "react";

export const Code = ({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
	<code
		className="box white mx-0.5 rounded bg-foreground/10 p-1 font-mono text-sm 
		transition-[color,background-color] dark:bg-foreground/20"
		{...props}
	>
		{children}
	</code>
);
