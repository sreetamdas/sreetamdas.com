import * as Sentry from "@sentry/react";

let hasInitializedSentry = false;

function getSentryDsn() {
	return import.meta.env.VITE_SENTRY_DSN;
}

export function initSentryBrowser() {
	if (typeof window === "undefined") return;
	if (hasInitializedSentry) return;

	const dsn = getSentryDsn();
	if (!dsn) return;

	Sentry.init({
		dsn,
		environment: import.meta.env.MODE,
		enabled: !import.meta.env.DEV,
	});

	hasInitializedSentry = true;
}

export function captureException(error: unknown) {
	if (!getSentryDsn()) return;
	Sentry.captureException(error);
}
