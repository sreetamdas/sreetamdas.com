import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./global-middleware";

export let routerInstance: ReturnType<typeof getRouter> | null = null;

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
	});

	routerInstance = router;

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
