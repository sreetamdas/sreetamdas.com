import type { UrlObject } from "url";

import type { Route } from "next";
import NextLink from "next/link";
import type { LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkAdditionalProps = {
	replaceClasses?: true;
};

type LinkToPropss = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
	Omit<LinkProps, "href"> & {
		children?: ReactNode;
	} & LinkAdditionalProps & {
		href?: Route | UrlObject | string;
	};
export const LinkTo = (linkToProps: LinkToPropss) => {
	const { href, className: passedClasses, replaceClasses = false, ...restProps } = linkToProps;
	const overrideProps: Partial<LinkToPropss> = {};
	let isExternalLink;
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
		</a>
	);
};
