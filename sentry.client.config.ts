import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.VERCEL_ENV || process.env.NODE_ENV;

if (ENVIRONMENT !== "development" && SENTRY_DSN !== "") {
	Sentry.init({
		dsn: SENTRY_DSN,
		tracesSampleRate: 0.25,
		environment: ENVIRONMENT,
	});
}
