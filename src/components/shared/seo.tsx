import Head from "next/head";

type TDocumentHeadProps = {
	title: string;
	imageURL?: string;
	description?: string;
};

export const DocumentHead = ({
	title,
	imageURL = "https://sreetamdas.com/SreetamDas.jpg",
	description = "Software Developer from India. 💜 React, TypeScript and Mechanical Keyboards!",
}: TDocumentHeadProps) => {
	const pageTitle = `${title} — Sreetam Das`;
	return (
		<Head>
			<title>{pageTitle}</title>
			<meta name="description" content={description} />
			<meta property="og:title" content="Sreetam Das" />
			<meta name="og:description" content={description} />
			<meta name="og:image" content={imageURL} />
			<meta name="og:image:alt" content={pageTitle} />
			<meta property="og:url" content="https://sreetamdas.com" />
			<meta property="og:type" content="website" />

			<meta name="twitter:card" content="summary" />
			<meta name="twitter:site" content="@_SreetamDas" />
			<meta name="twitter:title" content="Sreetam Das" />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={imageURL} />
		</Head>
	);
};
