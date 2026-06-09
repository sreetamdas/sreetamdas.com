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

const warnedContexts = new Set<string>();

/** Counters fail open so the page still renders; log the first failure per context for visibility. */
export function warnCounterFailureOnce(context: string, error: unknown) {
	if (warnedContexts.has(context)) return;
	warnedContexts.add(context);
	// oxlint-disable-next-line no-console
	console.warn(`page interaction counter failed: ${context}`, error);
}
