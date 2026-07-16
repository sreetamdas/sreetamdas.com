import {
	addIntegration,
	tanstackRouterBrowserTracingIntegration,
} from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		trailingSlash: "never",
		// Prefetch a route's code + loader data on link hover/touch-start so
		// navigations feel instant. The default 30s preload-stale window keeps
		// the prefetched data fresh through the actual click (no refetch), and
		// per-route staleTimes still govern longer-lived reuse.
		defaultPreload: "intent",
	});

	if (!router.isServer) {
		addIntegration(tanstackRouterBrowserTracingIntegration(router));
	}

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
