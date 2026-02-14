/**
 * Cloudflare Workers entry point.
 *
 * Wraps the TanStack Start server entry with Sentry for server-side error
 * reporting and tracing. The DSN is read from the Cloudflare env bindings
 * (set via .dev.vars locally or Workers secrets in production).
 */
import * as Sentry from "@sentry/cloudflare";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";

export default Sentry.withSentry(
	(env: CloudflareEnv) => ({
		dsn: env.VITE_SENTRY_DSN ?? "",
		sendDefaultPii: true,
		tracesSampleRate: 0.2,
	}),
	createServerEntry({
		fetch: handler.fetch,
	}) as unknown as ExportedHandler<CloudflareEnv>,
);
