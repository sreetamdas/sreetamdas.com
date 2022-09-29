import { AnchorHTMLAttributes } from "react";

import { LinkTo } from "@/styles/typography";

export const MDXAnchor = ({
	href,
	children,
	...restProps
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	if (typeof href === "undefined") return null;

	// link to internal page or skip link
	if ("/#".includes(href?.[0])) {
		return (
			<LinkTo {...restProps} href={href}>
				{children}
			</LinkTo>
		);
	}

	return (
		<LinkTo {...restProps} href={href} target="_blank">
			{children}
		</LinkTo>
	);
};
