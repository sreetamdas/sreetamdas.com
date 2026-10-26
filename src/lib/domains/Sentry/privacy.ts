/**
 * Sentry scrubbing for the Worker client. Ported from the stats Worker's
 * `src/lib/telemetry/privacy.ts`; the collector and relay path rewrites are
 * dropped because this site serves neither.
 */

// Segment match, not a substring: `description`, `recipient`, `zip`,
// `pipeline`, `script` and `tip` all contain "ip" and must survive.
const IP_KEY = /(^|[._-])ip(v[46])?($|[._-])/;

export function scrubSpanData(data: Record<string, unknown> | undefined): void {
	if (!data) return;
	delete data["url.query"];
	delete data["url.fragment"];
	delete data["url.full"];
	delete data["http.url"];
	delete data["url"];
	delete data["from"];
	delete data["to"];
	delete data["arguments"];
	delete data["user_agent.original"];
	for (const key of Object.keys(data)) {
		if (
			key.startsWith("http.request.headers.") ||
			key.startsWith("http.request.header.") ||
			key.startsWith("http.response.headers.") ||
			key.startsWith("http.response.header.")
		) {
			delete data[key];
		}
	}
}

export function scrubLogAttributes(attrs: Record<string, unknown> | undefined): void {
	if (!attrs) return;
	for (const key of Object.keys(attrs)) {
		if (
			key === "url.query" ||
			key === "url.fragment" ||
			key === "url.full" ||
			key === "http.url" ||
			key === "user_agent.original" ||
			key.startsWith("http.request.headers.") ||
			key.startsWith("http.request.header.") ||
			key.startsWith("http.response.headers.") ||
			key.startsWith("http.response.header.")
		) {
			delete attrs[key];
		}
		if (IP_KEY.test(key.toLowerCase()) || key.toLowerCase() === "user_agent") {
			delete attrs[key];
		}
	}
}

export function normalizeHighCardinalityName(name: string): string {
	return name
		.replace(/https?:\/\/[^\s]+/g, (url) => {
			try {
				return new URL(url).pathname;
			} catch {
				return "[URL]";
			}
		})
		.replace(/([/][^\s?#]*)[?#][^\s]*/g, "$1");
}

export function scrubBreadcrumb(crumb: {
	category?: string;
	data?: Record<string, unknown>;
	message?: string;
}) {
	if (crumb.category === "console" || crumb.category === "navigation") return null;
	scrubSpanData(crumb.data);
	if (crumb.message) crumb.message = normalizeHighCardinalityName(crumb.message);
	return crumb;
}

const URL_IN_TEXT = /https?:\/\/[^\s"'<>]+/g;
const PATH_WITH_QUERY = /(\/[^\s?#"'<>]*)[?#][^\s"'<>]*/g;
const BARE_QUERY = /(^|\s)\?[^\s"'<>]+/g;
const REDACTED = "?[redacted]";

/**
 * Free text (an exception's message, an event's message) can carry a raw URL,
 * and a raw URL can carry a query string with a click id in it. Keep the
 * origin and path, which is the diagnostic part, and drop the query and
 * fragment.
 */
export function redactFreeText(text: string): string {
	return text
		.replace(URL_IN_TEXT, (raw) => {
			try {
				const url = new URL(raw);
				return url.search === "" && url.hash === ""
					? `${url.origin}${url.pathname}`
					: `${url.origin}${url.pathname}${REDACTED}`;
			} catch {
				return "[URL]";
			}
		})
		.replace(PATH_WITH_QUERY, (match, path: string) =>
			match.endsWith(REDACTED) ? match : `${path}${REDACTED}`,
		)
		.replace(BARE_QUERY, (match, lead: string) =>
			match.trim() === REDACTED ? match : `${lead}${REDACTED}`,
		);
}

/** The free-text fields of an error event, redacted in place. */
export function redactEventText(event: {
	message?: string;
	logentry?: { message?: string };
	exception?: { values?: Array<{ value?: string }> };
}): void {
	if (typeof event.message === "string") event.message = redactFreeText(event.message);
	if (typeof event.logentry?.message === "string") {
		event.logentry.message = redactFreeText(event.logentry.message);
	}
	for (const value of event.exception?.values ?? []) {
		if (typeof value.value === "string") value.value = redactFreeText(value.value);
	}
}
