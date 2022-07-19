// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { BrowserTracing } from "@sentry/tracing";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.VERCEL_ENV || process.env.NODE_ENV;
Sentry.init({
	dsn: SENTRY_DSN,
	// This enables automatic instrumentation (highly recommended), but is not
	// necessary for purely manual usage
	integrations: [new BrowserTracing()],
	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1.0,
	environment: ENVIRONMENT,
	tunnel: "/api/tunnel",
	// ...
	// Note: if you want to override the automatic release value, do not set a
	// `release` value here - use the environment variable `SENTRY_RELEASE`, so
	// that it will also get attached to your source maps
});
