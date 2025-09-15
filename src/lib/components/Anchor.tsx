import { Link } from "@tanstack/react-router";
import { type AnchorHTMLAttributes } from "react";
import { ImArrowUpRight2 } from "react-icons/im";

import { SITE_URL } from "@/config";
import { cn } from "@/lib/helpers/utils";

type LinkAdditionalProps = {
	replaceClasses?: true;
	showExternalLinkIndicator?: true;
};

type LinkToProps = AnchorHTMLAttributes<HTMLAnchorElement> & LinkAdditionalProps;
export const LinkTo = (linkToProps: LinkToProps) => {
	const {
		href,
		className: passedClasses,
		replaceClasses = false,
		showExternalLinkIndicator = false,
		...restProps
	} = linkToProps;

	const extraProps: Partial<LinkToProps> = {};
	let isExternalLink = false;

	if (typeof href === "string") {
		if (href === "/resume.pdf") {
			isExternalLink = true;
		} else if (
			href.startsWith(SITE_URL) &&
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
		extraProps.target = "_blank";
	}

	if (!isExternalLink && typeof href !== "undefined") {
		return (
			<Link
				{...restProps}
				{...extraProps}
				to={href}
				className={cn(!replaceClasses && "link-base", passedClasses)}
			/>
		);
	}

	return (
		<a
			{...restProps}
			{...extraProps}
			href={href as string}
			className={cn(!replaceClasses && "link-base", passedClasses)}
		>
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
