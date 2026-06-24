export type ShowcaseSection = "deployment" | "rendering" | "router" | "server";

export type ShowcaseSearch = {
	feature: ShowcaseSection;
};

export function parseShowcaseSection(value: unknown): ShowcaseSection {
	switch (value) {
		case "deployment":
		case "rendering":
		case "router":
		case "server":
			return value;
		default:
			return "router";
	}
}

export function validateShowcaseSearch(search: Record<string, unknown>): ShowcaseSearch {
	return { feature: parseShowcaseSection(search.feature) };
}
