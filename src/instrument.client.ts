/**
 * Sentry browser-side initialization. Must be imported before any other app code
 * so errors during module evaluation and hydration are captured.
 */
import * as Sentry from "@sentry/tanstackstart-react";

import { IS_DEV } from "./config";

Sentry.init({
	dsn: import.meta.env.VITE_SENTRY_DSN,
	enabled: !IS_DEV,
	environment: import.meta.env.MODE,
	enableLogs: true,
	sendDefaultPii: false,
	tracesSampleRate: 0.1,
	integrations: [Sentry.replayIntegration()],
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
