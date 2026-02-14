import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./global-middleware";

export let routerInstance: ReturnType<typeof getRouter> | null = null;

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
	});

	if (!router.isServer) {
		const dsn = import.meta.env.VITE_SENTRY_DSN;
		if (dsn) {
			Sentry.init({
				dsn,
				environment: import.meta.env.MODE,
				enabled: !import.meta.env.DEV,
				sendDefaultPii: true,
				integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
				tracesSampleRate: 0.2,
			});
		}
	}

	routerInstance = router;

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
