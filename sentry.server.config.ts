import * as Sentry from "@sentry/nextjs";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { SupabaseIntegration } from "@supabase/sentry-js-integration";
import { SupabaseClient } from "@supabase/supabase-js";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.VERCEL_ENV || process.env.NODE_ENV;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

if (ENVIRONMENT !== "development" && SENTRY_DSN !== "") {
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: ENVIRONMENT,
		tracesSampleRate: 0.25,
		profilesSampleRate: 1.0,

		integrations: [
			new ProfilingIntegration(),
			new SupabaseIntegration(SupabaseClient, {
				tracing: true,
				breadcrumbs: true,
				errors: true,
			}),
			new Sentry.Integrations.Undici({
				shouldCreateSpanForRequest: (url) => !url.startsWith(`${SUPABASE_URL}/rest`),
			}),
		],
	});
}
