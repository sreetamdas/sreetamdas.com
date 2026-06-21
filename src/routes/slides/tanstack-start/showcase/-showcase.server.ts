import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { getServerOnlyBoundaryLabel } from "./-environment";
import { parseShowcaseSection, type ShowcaseSection } from "./-shared";

type ShowcasePayload = {
	feature: ShowcaseSection;
};

type ShowcaseSnapshot = {
	activeFeature: ShowcaseSection;
	boundaryLabel: string;
	clientRuntime: string;
	requestId: string;
	serverRuntime: string;
};

const showcaseFunctionMiddleware = createMiddleware({ type: "function" })
	.client(async ({ next }) => {
		return next({
			sendContext: {
				clientRuntime: typeof document === "undefined" ? "server render" : "browser call",
			},
		});
	})
	.server(async ({ context, next }) => {
		const cfRay = getRequestHeader("cf-ray");
		const requestId = cfRay?.split("-")[0] ?? crypto.randomUUID();
		return next({
			context: {
				clientRuntime: context.clientRuntime,
				requestId,
				serverRuntime: "server function middleware",
			},
		});
	});

export const getShowcaseSnapshot = createServerFn({ method: "GET" })
	.middleware([showcaseFunctionMiddleware])
	.validator((data): ShowcasePayload => {
		if (typeof data !== "object" || data === null || !("feature" in data)) {
			return { feature: "router" };
		}

		return { feature: parseShowcaseSection(data.feature) };
	})
	.handler(async ({ context, data }): Promise<ShowcaseSnapshot> => {
		return {
			activeFeature: data.feature,
			boundaryLabel: getServerOnlyBoundaryLabel(),
			clientRuntime: context.clientRuntime,
			requestId: context.requestId,
			serverRuntime: context.serverRuntime,
		};
	});
