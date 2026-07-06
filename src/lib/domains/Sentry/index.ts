/**
 * Browser-only Sentry runtime helpers. Server/Worker entrypoints avoid importing
 * TanStack Sentry runtime modules because they can pull Node-only dependencies
 * into Cloudflare/prerender builds.
 */
import type { ErrorEvent, EventHint } from "@sentry/cloudflare";

type SentryRuntimeConfig = Partial<Pick<CloudflareEnv, "VITE_SENTRY_DSN">>;

export function isBrowserSentryRuntime() {
	return typeof window !== "undefined";
}

export function getSentryRuntimeOptions(config: SentryRuntimeConfig | undefined) {
	const dsn = config?.VITE_SENTRY_DSN;
	if (!dsn) return undefined;

	return {
		dsn,
		enableLogs: true,
		sendDefaultPii: false,
		tracesSampleRate: 0.1,
		beforeSend(event: ErrorEvent, _hint?: EventHint) {
			const serialized = event.extra?.__serialized__;
			if (serialized && typeof serialized === "object" && "isNotFound" in serialized) {
				return null;
			}
			return event;
		},
	};
}

export function captureException(error: unknown) {
	if (!isBrowserSentryRuntime()) return;

	void import("@sentry/tanstackstart-react")
		.then((Sentry) => {
			if (!Sentry.isInitialized()) return;
			Sentry.captureException(error);
		})
		.catch((reason: unknown) => {
			void reason;
		});
}
