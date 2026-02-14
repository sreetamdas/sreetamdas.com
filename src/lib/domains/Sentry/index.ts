/**
 * Thin wrapper around @sentry/tanstackstart-react for use in error boundaries.
 *
 * Client-side: Sentry.init() in src/router.tsx (guarded by !router.isServer).
 * Server-side: Sentry.withSentry() wraps the Workers entry in src/worker.ts
 *              via @sentry/cloudflare (separate SDK, auto-captures unhandled errors).
 *
 * The isInitialized() guard ensures captureException is a no-op when Sentry
 * hasn't been initialised (e.g. during SSR where @sentry/tanstackstart-react
 * is not active — server errors are caught by @sentry/cloudflare instead).
 */
import {
	captureException as sentryCaptureException,
	isInitialized,
} from "@sentry/tanstackstart-react";

export function captureException(error: unknown) {
	if (!isInitialized()) return;
	sentryCaptureException(error);
}
