/**
 * Cloudflare Workers entry point.
 *
 * Wraps the TanStack Start server entry with Sentry for server-side error
 * reporting and tracing. The DSN is read from the Cloudflare env bindings
 * (set via .dev.vars locally or Workers secrets in production).
 *
 * Note: VITE_SENTRY_DSN is reused from the client-side env var name so a
 * single Cloudflare secret feeds both the Vite build (client bundle) and the
 * Workers runtime (server). A dedicated SENTRY_DSN binding would be cleaner
 * but would double the secret management surface for no functional benefit.
 */
import * as Sentry from "@sentry/cloudflare";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export { PresenceDurableObject } from "./lib/cloudflare/PresenceDurableObject";

const serverEntry = createServerEntry({ fetch: handler.fetch });

// Cast required: createServerEntry returns a narrower type than the
// ExportedHandler<CloudflareEnv> that Sentry.withSentry() expects.
// Tracked upstream — remove when @sentry/cloudflare accepts the TanStack
// Start server entry type directly.
export default Sentry.withSentry(
	(env: CloudflareEnv) => ({
		dsn: env.VITE_SENTRY_DSN,
		sendDefaultPii: true,
		tracesSampleRate: 0.2,
	}),
	serverEntry as unknown as ExportedHandler<CloudflareEnv>,
);
