/**
 * Thin wrapper around @sentry/tanstackstart-react.
 *
 * Client-side Sentry.init() happens in src/router.tsx (guarded by !router.isServer).
 * Server-side instrumentation is not yet supported on Cloudflare Workers.
 * This module re-exports captureException for use in error boundaries.
 */
import {
	captureException as sentryCaptureException,
	isInitialized,
} from "@sentry/tanstackstart-react";

export function captureException(error: unknown) {
	if (!isInitialized()) return;
	sentryCaptureException(error);
}
