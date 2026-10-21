/**
 * Public, cacheable PNG card for a completed hunter. Certificate IDs are
 * unguessable bearer tokens; no account details beyond the chosen display name,
 * completion date and per-discovery stars are rendered. The layout lives in
 * certificate-card.ts; this route only resolves the record and loads fonts.
 */
import { createFileRoute } from "@tanstack/react-router";

import { type FoobarCertificate } from "@/lib/domains/foobar/certificate";
import {
	FOOBAR_CARD_SUBSET_CHAR,
	renderFoobarCertificateCard,
} from "@/lib/domains/foobar/certificate-card";

type CertificateResolver = (token: string) => Promise<FoobarCertificate | null>;
type CertificateRenderer = (html: string) => Promise<Response> | Response;
type CardFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

export async function handleFoobarCertificateImage(
	token: string,
	resolve: CertificateResolver = resolveCertificate,
	render: CertificateRenderer = renderCertificate,
): Promise<Response> {
	if (!/^[a-zA-Z0-9_-]{1,80}$/.test(token)) return new Response("Not found", { status: 404 });

	const certificate = await resolve(token);
	if (!certificate) return new Response("Not found", { status: 404 });

	const html = renderFoobarCertificateCard(certificate);
	const response = await render(html);
	response.headers.set("Content-Type", "image/png");
	response.headers.set("Cache-Control", "public, max-age=3600");
	return response;
}

async function resolveCertificate(token: string): Promise<FoobarCertificate | null> {
	try {
		const [{ getDb }, { getFoobarCertificate }] = await Promise.all([
			import("@/db"),
			import("@/lib/domains/foobar/cloud-progress.data.server"),
		]);
		return await getFoobarCertificate(getDb(), token);
	} catch {
		return null;
	}
}

async function renderCertificate(html: string): Promise<Response> {
	const [{ ImageResponse, loadGoogleFont }, regular, bold] = await Promise.all([
		import("workers-og"),
		import("@/lib/domains/foobar/fonts/iosevka-das-version-regular.ttf?inline"),
		import("@/lib/domains/foobar/fonts/iosevka-das-version-bold.ttf?inline"),
	]);
	const fonts: Array<CardFont> = [
		{ name: "Iosevka", data: decodeDataUrl(regular.default), weight: 400, style: "normal" },
		{ name: "Iosevka", data: decodeDataUrl(bold.default), weight: 700, style: "normal" },
	];
	// Only a hunter name can reach outside the Iosevka subset; satori would
	// silently drop those glyphs, so fetch just them from a fallback face.
	const missing = [...new Set(html.replaceAll(FOOBAR_CARD_SUBSET_CHAR, ""))].join("");
	if (missing) {
		try {
			const data = await loadGoogleFont({ family: "Noto Sans", weight: 700, text: missing });
			fonts.push({ name: "Noto Sans", data, weight: 700, style: "normal" });
		} catch {
			// Render without the fallback rather than failing the card.
		}
	}
	return new ImageResponse(html, { width: 1200, height: 630, fonts });
}

function decodeDataUrl(dataUrl: string): ArrayBuffer {
	const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
	return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)).buffer;
}

export const Route = createFileRoute("/(api)/api/foobar/certificate/$token/og.png")({
	server: {
		handlers: {
			GET: ({ params }) => handleFoobarCertificateImage(params.token),
		},
	},
});
