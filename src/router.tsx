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
