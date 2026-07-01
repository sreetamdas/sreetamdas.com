import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Server helpers for the local TanStack Start dev-lab route.
 *
 * This file is intentionally small enough to keep open beside `route.tsx` during
 * the talk. The hover tour is: `DevLabSearch` → `parseDevLabSearch` →
 * `getDevLabServerSnapshot` → loader data in the route file.
 */
export type DevLabTopic = "routing" | "server" | "streaming";
export type DevLabAudience = "react" | "fullstack";

export type DevLabSearch = {
	topic: DevLabTopic;
	audience: DevLabAudience;
};

export type DevLabServerSnapshot = {
	search: DevLabSearch;
	requestId: string;
	runtime: string;
	claim: string;
	renderedAtIso: string;
};

export type DevLabSlowNote = {
	label: string;
	message: string;
	resolvedAtIso: string;
};

const TOPIC_CLAIMS: Record<DevLabTopic, string> = {
	routing: "The route owns the URL schema, loader deps, and navigation types.",
	server: "The same parsed search object crosses into a typed server function.",
	streaming: "The shell can render first while slower data resolves later.",
};

export const DEV_LAB_TOPICS: ReadonlyArray<DevLabTopic> = ["routing", "server", "streaming"];

export const DEV_LAB_AUDIENCES: ReadonlyArray<DevLabAudience> = ["react", "fullstack"];

export const getDevLabServerSnapshot = createServerFn({ method: "GET" })
	.validator(parseDevLabSearch)
	.handler(async ({ data }): Promise<DevLabServerSnapshot> => {
		const cfRay = getRequestHeader("cf-ray");
		return {
			search: data,
			requestId: cfRay?.split("-")[0] ?? crypto.randomUUID(),
			runtime: cfRay ? "Cloudflare Workers" : "local dev server",
			claim: TOPIC_CLAIMS[data.topic],
			renderedAtIso: new Date().toISOString(),
		};
	});

export async function getDevLabSlowNote(search: DevLabSearch): Promise<DevLabSlowNote> {
	await new Promise((resolve) => setTimeout(resolve, 700));
	return {
		label: `deferred ${search.topic} note`,
		message: `This promise used the same typed search object: ${search.topic}/${search.audience}.`,
		resolvedAtIso: new Date().toISOString(),
	};
}

export function parseDevLabSearch(value: unknown): DevLabSearch {
	if (typeof value !== "object" || value === null) {
		return defaultDevLabSearch();
	}

	return {
		topic: "topic" in value ? parseDevLabTopic(value.topic) : "routing",
		audience: "audience" in value ? parseDevLabAudience(value.audience) : "react",
	};
}

export function defaultDevLabSearch(): DevLabSearch {
	return { topic: "routing", audience: "react" };
}

function parseDevLabTopic(value: unknown): DevLabTopic {
	return typeof value === "string" && isDevLabTopic(value) ? value : "routing";
}

function parseDevLabAudience(value: unknown): DevLabAudience {
	return typeof value === "string" && isDevLabAudience(value) ? value : "react";
}

function isDevLabTopic(value: string): value is DevLabTopic {
	return value === "routing" || value === "server" || value === "streaming";
}

function isDevLabAudience(value: string): value is DevLabAudience {
	return value === "react" || value === "fullstack";
}
