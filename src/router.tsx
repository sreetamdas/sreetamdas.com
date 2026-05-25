import { createRouter } from "@tanstack/react-router";

import { getSentryRuntimeOptions, isBrowserSentryRuntime } from "@/lib/domains/Sentry";

import { routeTree } from "./routeTree.gen";

export let routerInstance: ReturnType<typeof getRouter> | null = null;

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		trailingSlash: "never",
	});

	if (!router.isServer && isBrowserSentryRuntime()) {
		const options = getSentryRuntimeOptions(import.meta.env);
		if (options) {
			void import("@sentry/tanstackstart-react")
				.then((Sentry) => {
					Sentry.init({
						...options,
						enabled: !import.meta.env.DEV,
						environment: import.meta.env.MODE,
						integrations: [
							Sentry.tanstackRouterBrowserTracingIntegration(router),
							Sentry.replayIntegration(),
						],
						replaysOnErrorSampleRate: 1,
						replaysSessionSampleRate: 0,
					});
				})
				.catch((reason: unknown) => {
					void reason;
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
