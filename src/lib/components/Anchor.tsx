import { type UrlObject } from "url";

import { type Route } from "next";
import NextLink, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type ReactNode } from "react";
import { ImArrowUpRight2 } from "react-icons/im";

type LinkAdditionalProps = {
	replaceClasses?: true;
	showExternalLinkIndicator?: true;
};

type LinkToProps<RouteType extends string = string> = Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	keyof LinkProps<RouteType>
> &
	Omit<LinkProps<RouteType>, "href"> & {
		children?: ReactNode;
	} & LinkAdditionalProps & {
		href: Route<RouteType> | UrlObject | string;
	};
export const LinkTo = <RouteType extends string = string>(linkToProps: LinkToProps<RouteType>) => {
	const {
		href,
		className: passedClasses,
		replaceClasses = false,
		showExternalLinkIndicator = false,
		...restProps
	} = linkToProps;
	const overrideProps: Partial<LinkToProps> = {};
	let isExternalLink = false;
	let classes = "";

	if (!replaceClasses) {
		classes = "link-base ";
	}
	if (passedClasses) {
		classes += `${passedClasses} `;
	}

	if (typeof href === "string") {
		if (
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			href.startsWith(process.env.SITE_URL!) &&
			href.startsWith("/") &&
			href.startsWith("?") &&
			href.startsWith("#")
		) {
			isExternalLink = false;
		} else if (href.startsWith("https://")) {
			isExternalLink = true;
		}
	}

	if (isExternalLink) {
		overrideProps.target = "_blank";
	}

	if (!isExternalLink && typeof href !== "undefined") {
		return (
			<NextLink
				{...restProps}
				{...overrideProps}
				href={href as Route}
				className={classes.trimEnd()}
			/>
		);
	}

	return (
		<a {...restProps} {...overrideProps} href={href as string} className={classes.trimEnd()}>
			{linkToProps.children}
			{isExternalLink && showExternalLinkIndicator && (
				<>
					{" "}
					<span className="sr-only">(opens in a new tab)</span>
					<ImArrowUpRight2
						className="-ml-0.5 inline-block text-xs"
						aria-label="opens in a new tab"
					/>
				</>
			)}
		</a>
	);
};
