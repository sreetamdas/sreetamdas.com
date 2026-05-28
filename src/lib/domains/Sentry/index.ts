import { readPublicEnvString } from "@/lib/helpers/utils";

export function isBrowserSentryRuntime() {
	return typeof window !== "undefined";
}

export function getSentryRuntimeOptions(env: object | undefined) {
	const dsn = readPublicEnvString(env, ["SENTRY_DSN"]);
	if (!dsn) return undefined;

	return {
		dsn,
		enableLogs: true,
		sendDefaultPii: false,
		tracesSampleRate: 0.1,
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
