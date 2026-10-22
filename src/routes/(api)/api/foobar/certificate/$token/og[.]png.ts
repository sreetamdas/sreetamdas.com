/**
 * Public, cacheable PNG card for a completed hunter. Certificate IDs are
 * unguessable bearer tokens; no account details beyond the chosen display name,
 * completion date and per-discovery stars are rendered. The layout lives in
 * certificate-card.ts; this route only resolves the record and loads fonts.
 *
 * Rendering takes over a second, so a rendered card is kept in the Workers
 * Cache API (a named cache, like the GitHub stats), keyed on the request URL,
 * for the same hour as its `Cache-Control`. A changed display name or a deleted save can therefore
 * show a stale card for up to an hour, as browsers already may. Only 200s are
 * cached; the write runs in `waitUntil` from `cloudflare:workers`, because
 * TanStack Start passes the execution context on only when the worker entry
 * hands it over, and ours does not.
 */
import { createFileRoute } from "@tanstack/react-router";

import {
	FOOBAR_CARD_SUBSET_CHAR,
	renderFoobarCertificateCard,
} from "@/lib/domains/foobar/certificate-card";
import {
	FOOBAR_CERTIFICATE_TOKEN,
	type FoobarCertificateResolver,
	resolveFoobarCertificate,
} from "@/lib/domains/foobar/certificate-lookup.server";

type CertificateRenderer = (html: string) => Promise<Response> | Response;
type CardCache = {
	match: (key: Request) => Promise<Response | undefined>;
	put: (key: Request, response: Response) => Promise<void>;
};
type CardFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

export async function handleFoobarCertificateImage(
	request: Request,
	token: string,
	resolve: FoobarCertificateResolver = resolveFoobarCertificate,
	render: CertificateRenderer = renderCertificate,
	cache: CardCache = edgeCache,
): Promise<Response> {
	if (!FOOBAR_CERTIFICATE_TOKEN.test(token)) return new Response("Not found", { status: 404 });

	const key = new Request(request.url);
	const cached = await cache.match(key);
	if (cached) return new Response(cached.body, cached);

	const certificate = await resolve(token);
	if (!certificate) return new Response("Not found", { status: 404 });

	const html = renderFoobarCertificateCard(certificate);
	const response = await render(html);
	response.headers.set("Content-Type", "image/png");
	response.headers.set("Cache-Control", "public, max-age=3600");
	if (response.status === 200) await cache.put(key, response.clone());
	return response;
}

const CARD_CACHE_NAME = "foobar-certificate-cards";

const edgeCache: CardCache = {
	match: async (key) => (await caches.open(CARD_CACHE_NAME)).match(key),
	put: async (key, response) => {
		const [{ waitUntil }, cache] = await Promise.all([
			import("cloudflare:workers"),
			caches.open(CARD_CACHE_NAME),
		]);
		waitUntil(cache.put(key, response));
	},
};

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
			GET: ({ request, params }) => handleFoobarCertificateImage(request, params.token),
		},
	},
});
