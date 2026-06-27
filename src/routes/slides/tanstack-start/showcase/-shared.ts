export type ShowcaseSection =
	| "deployment"
	| "rendering"
	| "router"
	| "rsc"
	| "server"
	| "streaming";

export type ShowcaseSearch = {
	feature: ShowcaseSection;
};

export function parseShowcaseSection(value: unknown): ShowcaseSection {
	switch (value) {
		case "deployment":
		case "rendering":
		case "router":
		case "rsc":
		case "server":
		case "streaming":
			return value;
		default:
			return "router";
	}
}

export function validateShowcaseSearch(search: Record<string, unknown>): ShowcaseSearch {
	return { feature: parseShowcaseSection(search.feature) };
}
