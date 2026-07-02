/**
 * Sentry browser-side initialization. Must be imported before any other app code
 * so errors during module evaluation and hydration are captured.
 */
import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
	dsn: import.meta.env.VITE_SENTRY_DSN,
	enabled: !import.meta.env.DEV,
	environment: import.meta.env.MODE,
	enableLogs: true,
	sendDefaultPii: false,
	tracesSampleRate: 0.1,
	integrations: [Sentry.replayIntegration()],
	replaysOnErrorSampleRate: 1,
	replaysSessionSampleRate: 0.1,
});
