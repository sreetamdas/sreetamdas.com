import { type ReactNode } from "react";

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
				"my-5 rounded-global py-5 max-sm:-mx-4 max-sm:px-4 sm:-ml-12 sm:-mr-5 sm:pl-12 sm:pr-5",
				type === "info" ? "border-l-4 border-l-indigo-500 bg-indigo-100 dark:bg-indigo-950" : "",
			)}
		>
			{children}
		</aside>
	);
};
