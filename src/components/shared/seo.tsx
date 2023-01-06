import Head from "next/head";

import { SITE_URL } from "@/config";

type DocumentHeadProps = {
	title: string;
	imageURL?: string;
	description?: string;
	noIndex?: boolean;
};

export const DocumentHead = ({
	title,
	imageURL: relativeImageURL,
	description = "Software Tinkerer and Engineer from India. 💜 React and TypeScript, CS:GO and mechanical keyboards!",
	noIndex = false,
}: DocumentHeadProps) => {
	const pageTitle = `${title} | Sreetam Das`;
	const imageURL = getAbsoluteURL(relativeImageURL ?? "/og-image.png");

	return (
		<Head>
			<title>{pageTitle}</title>
			<meta name="description" content={description} />
			{noIndex ? <meta name="robots" content="noindex" /> : null}

			<meta property="og:title" content={pageTitle} />
			<meta name="og:description" content={description} />
			<meta name="og:image" content={imageURL} />
			<meta name="og:image:alt" content={pageTitle} />
			<meta property="og:url" content={SITE_URL} />
			<meta property="og:type" content="website" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@_SreetamDas" />
			<meta name="twitter:title" content={pageTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={imageURL} />
		</Head>
	);
};

export function getAbsoluteURL(url: string) {
	const hasSiteURL = url.startsWith(SITE_URL);
	const startsWithSlash = url[0] === "/";

	if (hasSiteURL) return url;
	if (startsWithSlash) return `${SITE_URL}${url}`;
	return `${SITE_URL}/${url}`;
}
