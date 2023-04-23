import type { UrlObject } from "url";

import { Route } from "next";
import NextLink from "next/link";
import type { LinkRestProps } from "next/link";

type LinkAdditionalProps = {
	replaceClasses?: true;
};

type LinkToProps = LinkRestProps &
	LinkAdditionalProps & {
		href?: Route | UrlObject | string;
	};
export const LinkTo = (props: LinkToProps) => {
	const { href, className: passedClasses, replaceClasses = false, ...restProps } = props;
	const overrideProps: Partial<LinkToProps> = {};
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
			{props.children}
		</a>
	);
};
