/**
 * Sentry browser-side initialization. Must be imported before any other app code
 * so errors during module evaluation and hydration are captured.
 *
 * Replay integration is deferred to after hydration via requestIdleCallback to
 * avoid shipping the ~70-100KB rrweb DOM recorder in the critical path. The
 * recorder is only needed for 10% of sessions (replaysSessionSampleRate: 0.1)
 * but was previously bundled synchronously for 100% of clients.
 *
 * The dynamic import targets @sentry/replay directly (not the
 * @sentry/tanstackstart-react barrel) so the bundler can split rrweb into a
 * separate chunk. See Sentry docs on lazy-loading integrations:
 * https://docs.sentry.io/platforms/javascript/configuration/integrations/#lazy-loading-integrations
 */
import { addIntegration, init } from "@sentry/tanstackstart-react";

import { IS_DEV } from "./config";

init({
	dsn: import.meta.env.VITE_SENTRY_DSN,
	enabled: !IS_DEV,
	environment: import.meta.env.MODE,
	enableLogs: true,
	sendDefaultPii: false,
	tracesSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	replaysSessionSampleRate: 0.1,
	beforeSend(event) {
		const serialized = event.extra?.__serialized__;
		if (serialized && typeof serialized === "object" && "isNotFound" in serialized) {
			return null;
		}
		return event;
	},
});

if (!IS_DEV) {
	const idle =
		"requestIdleCallback" in window
			? window.requestIdleCallback
			: (cb: () => void) => setTimeout(cb, 2000);
	idle(() => {
		void import("@sentry/replay").then(({ replayIntegration }) => {
			addIntegration(replayIntegration());
		});
	});
}
