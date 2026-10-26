/**
 * Shared Sentry runtime options plus browser-only helpers. Server/Worker
 * entrypoints avoid importing TanStack Sentry runtime modules because they can
 * pull Node-only dependencies into Cloudflare/prerender builds.
 */
import type { CloudflareOptions, ErrorEvent, EventHint } from "@sentry/cloudflare";

import { isRedirect } from "@tanstack/react-router";

import {
	normalizeHighCardinalityName,
	redactEventText,
	scrubBreadcrumb,
	scrubLogAttributes,
	scrubSpanData,
} from "./privacy";

type SentryRuntimeConfig = Partial<
	Pick<CloudflareEnv, "VITE_SENTRY_DSN" | "CF_VERSION_METADATA">
> & {
	SENTRY_RELEASE?: string;
	SENTRY_ENVIRONMENT?: string;
	GIT_COMMIT_SHA?: string;
	SENTRY_TRACES_SAMPLE_RATE?: string;
};

const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

// Shared with the browser init. SDK v11 defaults every one of these to on.
// The IP/forwarding snippets are the ones v10's `sendDefaultPii: false` denied;
// v11 dropped that list, and a deny list is substring-matched, so `-ip` covers
// cf-connecting-ip, x-real-ip and true-client-ip.
export const SENTRY_DATA_COLLECTION = {
	userInfo: false,
	cookies: false,
	httpBodies: [],
	urlQueryParams: false,
	httpHeaders: {
		request: {
			deny: [
				"cookie",
				"authorization",
				"x-api-key",
				"cf-connecting-ip",
				"forwarded",
				"-ip",
				"remote-",
				"via",
				"-user",
			],
		},
		response: { deny: ["set-cookie"] },
	},
	databaseQueryData: false,
	queues: false,
	graphQL: { document: false, variables: false },
	genAI: { inputs: false, outputs: false },
	mcp: { inputs: false, outputs: false },
	stackFrameVariables: false,
} satisfies NonNullable<CloudflareOptions["dataCollection"]>;

function getTracesSampleRate(value: string | undefined) {
	if (value === undefined || value === "") return DEFAULT_TRACES_SAMPLE_RATE;

	const rate = Number(value);
	return Number.isFinite(rate) ? rate : DEFAULT_TRACES_SAMPLE_RATE;
}

export function isBrowserSentryRuntime() {
	return typeof window !== "undefined";
}

/**
 * `import.meta.env.MODE` is "production" for every `vite build`, so it cannot
 * tell staging and preview deployments apart. Prefer the explicit env override,
 * then the hostname the browser is actually served from.
 */
export function resolveSentryEnvironment(): string {
	const explicit = import.meta.env.VITE_SENTRY_ENVIRONMENT;
	if (typeof explicit === "string" && explicit.trim() !== "") return explicit.trim();
	if (!import.meta.env.PROD) return "development";
	const host = typeof location !== "undefined" ? location.hostname : "";
	if (host.endsWith(".workers.dev")) return "preview";
	if (host.startsWith("dev.") || host.startsWith("staging.")) return "staging";
	return "production";
}

export function getSentryRuntimeOptions(
	config: SentryRuntimeConfig | undefined,
): CloudflareOptions | undefined {
	const dsn = config?.VITE_SENTRY_DSN;
	if (!dsn) return undefined;

	return {
		dsn,
		dataCollection: SENTRY_DATA_COLLECTION,
		environment: config?.SENTRY_ENVIRONMENT ?? "production",
		release: config?.SENTRY_RELEASE ?? config?.GIT_COMMIT_SHA ?? config?.CF_VERSION_METADATA?.id,
		tracesSampleRate: getTracesSampleRate(config?.SENTRY_TRACES_SAMPLE_RATE),
		beforeBreadcrumb: scrubBreadcrumb,
		beforeSend(event: ErrorEvent, hint?: EventHint) {
			// `redirect()` signals by throwing a Response, and the Start function
			// middleware that wraps server functions captures every throw, so a
			// server function that redirects would otherwise be reported as an
			// "[object Response]" crash.
			if (isRedirect(hint?.originalException)) return null;
			const serialized = event.extra?.__serialized__;
			if (serialized && typeof serialized === "object" && "isNotFound" in serialized) {
				return null;
			}
			delete event.request;
			delete event.user;
			redactEventText(event);
			if (typeof event.transaction === "string") {
				event.transaction = normalizeHighCardinalityName(event.transaction);
			}
			scrubSpanData(event.contexts?.trace?.data);
			if (Array.isArray(event.breadcrumbs)) {
				event.breadcrumbs = event.breadcrumbs.filter((crumb) => scrubBreadcrumb(crumb) !== null);
			}
			return event;
		},
		beforeSendSpan(span) {
			scrubSpanData(span.attributes);
			span.name = normalizeHighCardinalityName(span.name);
			return span;
		},
		beforeSendLog(log) {
			scrubLogAttributes(log.attributes);
			return log;
		},
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
