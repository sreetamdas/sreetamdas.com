import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export let routerInstance: ReturnType<typeof createRouter> | null = null;

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
	});

	routerInstance = router;

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
