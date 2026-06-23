export type SlideSearch = {
	live?: string;
	master?: boolean;
	presenter?: boolean;
	slide?: number;
	step?: number;
};

export function validateSlideSearch(search: Record<string, unknown>): SlideSearch {
	return {
		live: parseSessionId(search.live),
		master: parseBooleanParam(search.master),
		presenter: parseBooleanParam(search.presenter),
		slide: parseNonNegativeInt(search.slide),
		step: parseNonNegativeInt(search.step),
	};
}

function parseNonNegativeInt(raw: unknown): number | undefined {
	if (raw === undefined || raw === null || raw === "") return undefined;
	const n = Number(raw);
	return Number.isFinite(n) && Number.isInteger(n) && n >= 0 ? n : undefined;
}

function parseSessionId(raw: unknown): string | undefined {
	if (typeof raw !== "string") return undefined;
	return /^[a-zA-Z0-9_-]{1,80}$/.test(raw) ? raw : undefined;
}

function parseBooleanParam(raw: unknown): boolean | undefined {
	if (raw === "1" || raw === "true" || raw === 1 || raw === true) return true;
	if (raw === "0" || raw === "false" || raw === 0 || raw === false) return false;
	return undefined;
}
