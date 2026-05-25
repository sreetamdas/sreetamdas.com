import { type AnchorHTMLAttributes, type ReactNode } from "react";
import { ImArrowUpRight2 } from "react-icons/im";

import { SITE_URL } from "@/config";
import { cn } from "@/lib/helpers/utils";

type LinkToProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
	href: string;
	params?: Record<string, string>;
	replaceClasses?: boolean;
	showExternalLinkIndicator?: boolean;
	children: ReactNode;
};

function isExternal(href: string) {
	if (href === "/resume.pdf") {
		return true;
	}

	if (href.startsWith("http://") || href.startsWith("https://")) {
		return !href.startsWith(SITE_URL);
	}

	if (href.startsWith("mailto:") || href.startsWith("tel:")) {
		return true;
	}

	return false;
}

function isRouterLink(href: string) {
	return href.startsWith("/") && !isExternal(href) && !href.startsWith("//");
}

export const LinkTo = ({
	href,
	params,
	className,
	replaceClasses = false,
	showExternalLinkIndicator = false,
	children,
	...restProps
}: LinkToProps) => {
	const external = isExternal(href);
	const classNames = cn(!replaceClasses && "link-base", className);

	if (isRouterLink(href) && params !== undefined) {
		const search = new URLSearchParams(params).toString();
		const hrefWithQuery = search.length > 0 ? `${href}?${search}` : href;
		return (
			<a {...restProps} href={hrefWithQuery} className={classNames}>
				{children}
			</a>
		);
	}

	return (
		<a
			{...restProps}
			href={href}
			target={external ? "_blank" : restProps.target}
			rel={external ? "noreferrer" : restProps.rel}
			className={classNames}
		>
			{children}
			{external && showExternalLinkIndicator ? (
				<>
					{" "}
					<span className="sr-only">(opens in a new tab)</span>
					<ImArrowUpRight2
						className="-ml-0.5 inline-block text-xs"
						aria-label="opens in a new tab"
					/>
				</>
			) : null}
		</a>
	);
};
