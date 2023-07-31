import { clsx } from "clsx";
import { type ReactNode } from "react";

export const Gradient = ({ children }: { children: ReactNode }) => (
	<span className="w-fit bg-gradient-to-r from-primary to-secondary box-decoration-slice bg-clip-text text-transparent">
		{children}
	</span>
);

type InfoBlockProps = {
	type?: "info" | "warning";
	children: ReactNode;
};
export const InfoBlock = (props: InfoBlockProps) => {
	const { type = "info", children } = props;
	return (
		<aside
			className={clsx(
				"my-5 -ml-12 -mr-5 rounded-global py-5 pl-12 pr-5",
				type === "info" ? "border-l-4 border-l-indigo-500 bg-indigo-100 dark:bg-indigo-950" : ""
			)}
		>
			{children}
		</aside>
	);
};
