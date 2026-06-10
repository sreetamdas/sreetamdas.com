/**
 * Shared server-function payload parsing for page-level counters. Likes and
 * views both receive the same client payload shape before applying their own
 * domain-specific read/write behavior.
 */
export type PagePathnamePayload = {
	slug: string;
	disabled: boolean;
};

export function validatePagePathnamePayload(
	data: unknown,
	errorMessage: string,
): PagePathnamePayload {
	if (!isPagePathnamePayload(data)) {
		throw new Error(errorMessage);
	}

	return { slug: data.slug, disabled: data.disabled };
}

function isPagePathnamePayload(data: unknown): data is PagePathnamePayload {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	if (!("slug" in data) || !("disabled" in data)) {
		return false;
	}

	return (
		typeof data.slug === "string" && data.slug.length > 0 && typeof data.disabled === "boolean"
	);
}

const WARN_WINDOW_MS = 5 * 60 * 1000;
const lastWarnedAt = new Map<string, number>();

/**
 * Counters fail open so the page still renders; log at most once per context per
 * window so a sustained outage keeps surfacing instead of going silent after the
 * first line.
 */
export function warnCounterFailureOnce(context: string, error: unknown) {
	const now = Date.now();
	const warnedAt = lastWarnedAt.get(context);
	if (warnedAt !== undefined && now - warnedAt < WARN_WINDOW_MS) return;
	lastWarnedAt.set(context, now);
	// oxlint-disable-next-line no-console
	console.warn(`page interaction counter failed: ${context}`, error);
}
