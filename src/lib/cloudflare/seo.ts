/**
 * SEO response helpers for Cloudflare Worker responses.
 *
 * Keeps the worker entry focused on wiring, while this module owns the
 * hostname gating and header mutation for preview deployments.
 */
function shouldHideFromSeo(hostname: string): boolean {
	const isProduction = hostname === "sreetamdas.com" || hostname === "www.sreetamdas.com";
	const isLocalDev =
		hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("[");
	return !isProduction && !isLocalDev;
}

export function maybeHideFromSeo(response: Response, request: Request): Response {
	if (!shouldHideFromSeo(new URL(request.url).hostname)) {
		return response;
	}

	if (response.status !== 200) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set("X-Robots-Tag", "noindex");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
