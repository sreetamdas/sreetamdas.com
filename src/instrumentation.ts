import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.VERCEL_ENV || process.env.NODE_ENV;

export function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		Sentry.init({
			dsn: SENTRY_DSN,
			environment: ENVIRONMENT,
			tracesSampleRate: 0.25,
			profilesSampleRate: 1.0,
		});
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		if (ENVIRONMENT !== "development" && SENTRY_DSN !== "") {
			Sentry.init({
				dsn: SENTRY_DSN,
				environment: ENVIRONMENT,
				tracesSampleRate: 0.25,
			});
		}
	}
}
