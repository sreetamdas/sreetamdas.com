/**
 * Sentry browser-side initialization. Must be imported before any other app code
 * so errors during module evaluation and hydration are captured.
 *
 * Session replay is intentionally excluded; browser errors and traces are
 * useful here, while recording every visitor carries disproportionate client
 * weight for a personal site.
 */
import { init } from "@sentry/tanstackstart-react";

import { IS_DEV } from "./config";

init({
	dsn: import.meta.env.VITE_SENTRY_DSN,
	enabled: !IS_DEV,
	environment: import.meta.env.MODE,
	enableLogs: true,
	sendDefaultPii: false,
	tracesSampleRate: 0.1,
	beforeSend(event) {
		const serialized = event.extra?.__serialized__;
		if (serialized && typeof serialized === "object" && "isNotFound" in serialized) {
			return null;
		}
		return event;
	},
});
