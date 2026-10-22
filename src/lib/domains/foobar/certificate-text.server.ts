/**
 * Terminal clients asking for a certificate page get it as text instead of
 * HTML. A request is terminal-like when its User-Agent is curl, Wget, HTTPie or
 * xh, or when it accepts text/plain but not text/html.
 *
 * Colour is on unless the query has `?plain` or `?no-color` (standing in for
 * NO_COLOR, which cannot reach a server), or the request is terminal-like only
 * through an Accept of `text/plain; charset=...`.
 *
 * Returns null when the request should render the HTML page; both variants
 * carry the same Vary so caches keep them apart.
 */
import {
	FOOBAR_CERTIFICATE_TOKEN,
	type FoobarCertificateResolver,
	resolveFoobarCertificate,
} from "./certificate-lookup.server";
import { renderFoobarCertificateText } from "./certificate-text";

export const FOOBAR_CERTIFICATE_VARY = "User-Agent, Accept";

const TERMINAL_AGENT = /^(curl|wget|httpie|xh)\//i;

export async function handleFoobarCertificateText(
	request: Request,
	token: string,
	resolve: FoobarCertificateResolver = resolveFoobarCertificate,
): Promise<Response | null> {
	const terminalAgent = TERMINAL_AGENT.test(request.headers.get("User-Agent") ?? "");
	const accepted = parseAccept(request.headers.get("Accept"));
	const plainText = accepted.find(({ type }) => type === "text/plain");
	const wantsText = plainText !== undefined && !accepted.some(({ type }) => type === "text/html");
	if (!terminalAgent && !wantsText) return null;

	const headers = {
		"Content-Type": "text/plain; charset=utf-8",
		Vary: FOOBAR_CERTIFICATE_VARY,
	};
	const certificate = FOOBAR_CERTIFICATE_TOKEN.test(token) ? await resolve(token) : null;
	if (!certificate) {
		return new Response("404: this field record does not exist.\n", { status: 404, headers });
	}

	const { searchParams } = new URL(request.url);
	const color =
		!searchParams.has("plain") &&
		!searchParams.has("no-color") &&
		(terminalAgent || !plainText?.params.some((param) => param.startsWith("charset=")));
	return new Response(renderFoobarCertificateText(certificate, { color }), {
		headers: { ...headers, "Cache-Control": "public, max-age=3600" },
	});
}

function parseAccept(accept: string | null) {
	return (accept ?? "").split(",").map((range) => {
		const [type = "", ...params] = range.split(";").map((part) => part.trim().toLowerCase());
		return { type, params: params.map((param) => param.replaceAll(/\s/g, "")) };
	});
}
