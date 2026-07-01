import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Server-side data for the local TanStack Start dev lab. The route is meant to be
 * edited live during the talk, so the data stays deterministic and meaningful:
 * every search-param choice maps to a real talking point, code pointer, and live
 * edit the speaker can perform in dev.
 */
export type DevLabMode = "router" | "server" | "streaming" | "deploy";
export type DevLabAudience = "react" | "fullstack" | "skeptical";
export type DevLabRuntime = "local" | "cloudflare";

export type DevLabSearch = {
	mode: DevLabMode;
	audience: DevLabAudience;
	runtime: DevLabRuntime;
};

export type DevLabModeConfig = {
	mode: DevLabMode;
	label: string;
	shortLabel: string;
	claim: string;
	whatChanges: string;
	liveEdit: string;
	codePointer: string;
};

export type DevLabSnapshot = DevLabSearch & {
	active: DevLabModeConfig;
	audienceLabel: string;
	runtimeLabel: string;
	requestId: string;
	renderedAtIso: string;
	serverFact: string;
	progressiveProof: Array<{ label: string; value: string }>;
};

export type DevLabDeferredPanel = {
	generatedAtIso: string;
	delayMs: number;
	rows: Array<{ label: string; value: string }>;
};

const DEV_LAB_MODE_CONFIGS: Record<DevLabMode, DevLabModeConfig> = {
	router: {
		mode: "router",
		label: "1 · Router-owned state",
		shortLabel: "Router",
		claim: "The URL is app state with a schema, not a bag of strings.",
		whatChanges:
			"Switching this pill changes typed search, loader deps, and the active proof card.",
		liveEdit:
			"Add a new mode to the DevLabMode union, then watch TypeScript force the " +
			"DEV_LAB_MODE_CONFIGS record to cover it.",
		codePointer: "route.tsx · validateSearch + loaderDeps + typed navigate()",
	},
	server: {
		mode: "server",
		label: "2 · Server boundary",
		shortLabel: "Server fn",
		claim: "The same typed input crosses from the route into a server function.",
		whatChanges:
			"The loader calls a GET server function, so the page has request-time server data " +
			"on first render.",
		liveEdit:
			"Rename a field in DevLabSearch and follow the compiler errors through the route, " +
			"validator, and server function.",
		codePointer: '-dev-lab.server.ts · createServerFn({ method: "GET" })',
	},
	streaming: {
		mode: "streaming",
		label: "3 · Deferred data",
		shortLabel: "Streaming",
		claim: "The shell can render immediately while slower data resolves later.",
		whatChanges:
			"The loader returns one awaited snapshot plus one un-awaited promise rendered with " +
			"Suspense + Await.",
		liveEdit:
			"Change DEV_LAB_STREAM_DELAY_MS and save; the skeleton-to-panel transition " +
			"changes without rebuilding the app.",
		codePointer: "route.tsx · loader returns deferred; component renders <Suspense><Await />",
	},
	deploy: {
		mode: "deploy",
		label: "4 · Runtime portability",
		shortLabel: "Deploy",
		claim: "The route model stays the same when the runtime changes.",
		whatChanges:
			"Toggle local vs Cloudflare and the UI reframes the same route data for a " +
			"different deployment target.",
		liveEdit:
			"Switch runtime in the URL and point out that the route/search/server-function " +
			"contract did not change.",
		codePointer: "route.tsx + -dev-lab.server.ts · same route contract, different runtime story",
	},
};

export const DEV_LAB_MODES: ReadonlyArray<DevLabModeConfig> = [
	DEV_LAB_MODE_CONFIGS.router,
	DEV_LAB_MODE_CONFIGS.server,
	DEV_LAB_MODE_CONFIGS.streaming,
	DEV_LAB_MODE_CONFIGS.deploy,
];

export const DEV_LAB_AUDIENCES: ReadonlyArray<{ value: DevLabAudience; label: string }> = [
	{ value: "react", label: "React-heavy room" },
	{ value: "fullstack", label: "Full-stack team" },
	{ value: "skeptical", label: "Next.js skeptics" },
];

export const DEV_LAB_RUNTIMES: ReadonlyArray<{ value: DevLabRuntime; label: string }> = [
	{ value: "local", label: "Local dev" },
	{ value: "cloudflare", label: "Cloudflare edge" },
];

const DEV_LAB_STREAM_DELAY_MS = 900;

export const getDevLabSnapshot = createServerFn({ method: "GET" })
	.validator(parseDevLabSearch)
	.handler(async ({ data }): Promise<DevLabSnapshot> => {
		const cfRay = getRequestHeader("cf-ray");
		const requestId = cfRay?.split("-")[0] ?? crypto.randomUUID();
		const active = getDevLabModeConfig(data.mode);
		return {
			...data,
			active,
			audienceLabel: getAudienceLabel(data.audience),
			runtimeLabel: getRuntimeLabel(data.runtime),
			requestId,
			renderedAtIso: new Date().toISOString(),
			serverFact: getServerFact(data),
			progressiveProof: buildProgressiveProof(data, requestId),
		};
	});

export const getDevLabDeferredPanel = createServerFn({ method: "GET" })
	.validator(parseDevLabSearch)
	.handler(async ({ data }): Promise<DevLabDeferredPanel> => {
		await new Promise((resolve) => setTimeout(resolve, DEV_LAB_STREAM_DELAY_MS));
		return {
			generatedAtIso: new Date().toISOString(),
			delayMs: DEV_LAB_STREAM_DELAY_MS,
			rows: [
				{ label: "slow panel", value: getSlowPanelValue(data.mode) },
				{ label: "audience", value: getAudienceLabel(data.audience) },
				{ label: "runtime", value: getRuntimeLabel(data.runtime) },
				{ label: "stage use", value: "keep talking while the shell is already on screen" },
			],
		};
	});

export function parseDevLabSearch(value: unknown): DevLabSearch {
	if (typeof value !== "object" || value === null) {
		return defaultDevLabSearch();
	}

	return {
		mode: "mode" in value ? parseDevLabMode(value.mode) : "router",
		audience: "audience" in value ? parseDevLabAudience(value.audience) : "react",
		runtime: "runtime" in value ? parseDevLabRuntime(value.runtime) : "local",
	};
}

export function parseDevLabMode(value: unknown): DevLabMode {
	return typeof value === "string" && isDevLabMode(value) ? value : "router";
}

export function parseDevLabAudience(value: unknown): DevLabAudience {
	return typeof value === "string" && isDevLabAudience(value) ? value : "react";
}

export function parseDevLabRuntime(value: unknown): DevLabRuntime {
	return typeof value === "string" && isDevLabRuntime(value) ? value : "local";
}

export function defaultDevLabSearch(): DevLabSearch {
	return { mode: "router", audience: "react", runtime: "local" };
}

function isDevLabMode(value: string): value is DevLabMode {
	return value === "router" || value === "server" || value === "streaming" || value === "deploy";
}

function isDevLabAudience(value: string): value is DevLabAudience {
	return value === "react" || value === "fullstack" || value === "skeptical";
}

function isDevLabRuntime(value: string): value is DevLabRuntime {
	return value === "local" || value === "cloudflare";
}

function getDevLabModeConfig(mode: DevLabMode): DevLabModeConfig {
	return DEV_LAB_MODE_CONFIGS[mode];
}

function getAudienceLabel(audience: DevLabAudience): string {
	switch (audience) {
		case "react":
			return "React-heavy room";
		case "fullstack":
			return "Full-stack team";
		case "skeptical":
			return "Next.js skeptics";
	}
}

function getRuntimeLabel(runtime: DevLabRuntime): string {
	switch (runtime) {
		case "local":
			return "Local dev server";
		case "cloudflare":
			return "Cloudflare Workers";
	}
}

function getServerFact(search: DevLabSearch): string {
	if (search.runtime === "cloudflare") {
		return "On Cloudflare, the same route can sit beside D1, KV, Durable Objects, logs, and traces.";
	}

	if (search.mode === "streaming") {
		return "In local dev, Vite keeps the shell interactive while the slow panel resolves again.";
	}

	return "In local dev, editing the route contract is the demo: TypeScript and HMR react immediately.";
}

function buildProgressiveProof(
	search: DevLabSearch,
	requestId: string,
): Array<{ label: string; value: string }> {
	return [
		{ label: "typed search", value: `mode=${search.mode}, audience=${search.audience}` },
		{ label: "loader deps", value: "the parsed search object is the cache key" },
		{ label: "server fn", value: `snapshot generated with request ${requestId}` },
		{ label: "deferred", value: "slow panel is intentionally not awaited by the loader" },
	];
}

function getSlowPanelValue(mode: DevLabMode): string {
	switch (mode) {
		case "router":
			return "route state stayed stable while a slower explanation arrived";
		case "server":
			return "server data used the same validated input as the page";
		case "streaming":
			return "this is the visible shell-now/data-later beat";
		case "deploy":
			return "runtime facts changed without changing the route contract";
	}
}
