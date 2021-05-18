import Head from "next/head";

type TDocumentHeadProps = {
	title: string;
	imageURL?: string;
	description?: string;
};

const siteURL = process.env.SITE_URL!;

export const DocumentHead = ({
	title,
	imageURL: relativeImageURL,
	description,
}: TDocumentHeadProps) => {
	const pageTitle = `${title} — Sreetam Das`;
	const imageURL = getAbsoluteURL(relativeImageURL ?? "/og-default.webp");

	return (
		<Head>
			<title>{pageTitle}</title>
			<meta name="description" content={description} />
			<meta property="og:title" content={pageTitle} />
			<meta name="og:description" content={description} />
			<meta name="og:image" content={imageURL} />
			<meta name="og:image:alt" content={pageTitle} />
			<meta property="og:url" content={siteURL} />
			<meta property="og:type" content="website" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@_SreetamDas" />
			<meta name="twitter:title" content={pageTitle} />
			<meta
				name="twitter:description"
				content={
					description ??
					"Software Developer from India. 💜 React, TypeScript and Mechanical Keyboards!"
				}
			/>
			<meta name="twitter:image" content={imageURL} />
		</Head>
	);
};

export const getAbsoluteURL = (url: string) => {
	const hasSiteURL = url.startsWith(siteURL);
	const startsWithSlash = url[0] === "/";

	if (hasSiteURL) return url;
	if (startsWithSlash) return `${siteURL}${url}`;
	return `${siteURL}/${url}`;
};
