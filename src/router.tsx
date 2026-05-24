import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export let routerInstance: ReturnType<typeof getRouter> | null = null;

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		trailingSlash: "never",
	});

	routerInstance = router;

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
