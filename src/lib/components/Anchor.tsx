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

function buildHrefWithParams(href: string, params: Record<string, string>) {
	const consumedKeys = new Set<string>();
	const hrefWithPathParams = href.replaceAll(/\$([a-zA-Z0-9_]+)/g, (_full, key: string) => {
		const value = params[key];
		if (typeof value !== "string") {
			return `$${key}`;
		}

		consumedKeys.add(key);
		return encodeURIComponent(value);
	});

	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (consumedKeys.has(key)) {
			continue;
		}

		searchParams.set(key, value);
	}

	const query = searchParams.toString();
	return query.length > 0 ? `${hrefWithPathParams}?${query}` : hrefWithPathParams;
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
		return (
			<a {...restProps} href={buildHrefWithParams(href, params)} className={classNames}>
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
