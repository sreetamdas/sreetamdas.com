import type { ReactNode } from "react";

import { cn } from "@/lib/helpers/utils";

type InfoBlockProps = {
	type?: "info" | "warning";
	children: ReactNode;
};
export const InfoBlock = (props: InfoBlockProps) => {
	const { type = "info", children } = props;
	return (
		<aside
			className={cn(
				"-ml-12 -mr-5 my-5 rounded-global py-5 pr-5 pl-12",
				type === "info" ? "border-l-4 border-l-indigo-500 bg-indigo-100 dark:bg-indigo-950" : "",
			)}
		>
			{children}
		</aside>
	);
};
