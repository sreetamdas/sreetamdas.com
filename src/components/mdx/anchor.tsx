import { AnchorHTMLAttributes } from "react";

import { ExternalLink, StyledLinkBase } from "@/styles/typography";

export const MDXAnchor = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	if (typeof props.href === "undefined") return null;

	// link to internal page or skip link
	if ("/#".includes(props.href?.[0])) {
		return <StyledLinkBase {...props} />;
	}

	return <ExternalLink {...props}>{props.children}</ExternalLink>;
};
