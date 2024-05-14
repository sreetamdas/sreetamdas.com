import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.VERCEL_ENV || process.env.NODE_ENV;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

if (ENVIRONMENT !== "development" && SENTRY_DSN !== "") {
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: ENVIRONMENT,
		tracesSampleRate: 0.25,
		profilesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,

		integrations: [
			Sentry.browserProfilingIntegration(),
			Sentry.replayIntegration({
				maskAllText: true,
				blockAllMedia: true,
			}),
			Sentry.browserTracingIntegration({
				shouldCreateSpanForRequest: (url) => !url.startsWith(`${SUPABASE_URL}/rest`),
			}),
		],
	});
}
