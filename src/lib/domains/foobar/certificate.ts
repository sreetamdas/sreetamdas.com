/** Pure URL, date, and metadata presentation for public Foobar certificates. */
import { absoluteUrl } from "@/lib/seo";

export type FoobarCertificate = {
	name: string;
	completedAt: number;
	certificateId: string;
};

export function formatFoobarCertificateDate(timestamp: number): string {
	return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(timestamp);
}

export function createFoobarCertificateHead(certificate: FoobarCertificate) {
	const title = `${certificate.name} completed Foobar`;
	const description = `${certificate.name} mapped every hidden corner of sreetamdas.com and completed the Foobar hunt.`;
	const canonical = absoluteUrl(`/foobar/certificate/${certificate.certificateId}`);
	const image = absoluteUrl(`/api/foobar/certificate/${certificate.certificateId}/og.png`);

	return {
		links: [{ rel: "canonical", href: canonical }],
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonical },
			{ property: "og:image", content: image },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: image },
		],
	};
}
