/**
 * Cloudflare Workers entry point.
 *
 * Wraps the TanStack Start server entry with Sentry for server-side error
 * reporting and tracing. The DSN is read from the Cloudflare env bindings
 * (set via .dev.vars locally or Workers secrets in production).
 *
 * Note: VITE_SENTRY_DSN is reused from the client-side env var name so a
 * single Cloudflare secret feeds both the Vite build (client bundle) and the
 * Workers runtime (server). A dedicated SENTRY_DSN binding would be cleaner
 * but would double the secret management surface for no functional benefit.
 */
import * as Sentry from "@sentry/cloudflare";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";

function shouldHideFromSeo(hostname: string): boolean {
	const isProduction = hostname === "sreetamdas.com" || hostname === "www.sreetamdas.com";
	const isLocalDev =
		hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("[");
	return !isProduction && !isLocalDev;
}

function maybeHideFromSeo(response: Response, request: Request): Response {
	if (!shouldHideFromSeo(new URL(request.url).hostname)) {
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

const serverEntry = createServerEntry({
	fetch: (request, opts) => {
		const result = handler.fetch(request, opts);
		if (result instanceof Response) {
			return maybeHideFromSeo(result, request);
		}
		return result.then((response) => maybeHideFromSeo(response, request));
	},
});

export default Sentry.withSentry(
	(env: CloudflareEnv) => ({
		dsn: env.VITE_SENTRY_DSN,
		sendDefaultPii: true,
		tracesSampleRate: 0.2,
	}),
	serverEntry as unknown as ExportedHandler<CloudflareEnv>,
);
