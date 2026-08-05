/**
 * Shared RWC payload types and runtime validation. This module must stay free
 * of Worker-only imports because the route uses the parser in the browser.
 */
export type RWCSolution = {
	html: string;
	slug: string;
	filename: string | undefined;
	lang: string;
};

export type RWCCodeSamples = {
	all_solutions: Array<RWCSolution>;
	background_color: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isRwcSolution(value: unknown): value is RWCSolution {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.html === "string" &&
		typeof value.slug === "string" &&
		(value.filename === undefined || typeof value.filename === "string") &&
		typeof value.lang === "string"
	);
}

function isRwcCodeSamples(value: unknown): value is RWCCodeSamples {
	return (
		isRecord(value) &&
		typeof value.background_color === "string" &&
		Array.isArray(value.all_solutions) &&
		value.all_solutions.every(isRwcSolution)
	);
}

export function parseRwcCodeSamples(value: unknown): RWCCodeSamples {
	if (!isRwcCodeSamples(value)) {
		throw new Error("Invalid RWC code samples payload");
	}

	return value;
}

/**
 * Chooses between a freshly refreshed payload and the build-time snapshot. A
 * refresh that comes back empty means the runtime fetch fell back (cold cache,
 * GitHub unreachable): keep the populated snapshot rather than replacing it
 * with nothing.
 */
export function preferPopulatedRwcCodeSamples(
	refresh: RWCCodeSamples,
	snapshot: RWCCodeSamples,
): RWCCodeSamples {
	return refresh.all_solutions.length > 0 ? refresh : snapshot;
}
