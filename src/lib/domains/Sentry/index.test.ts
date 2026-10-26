import type { ErrorEvent } from "@sentry/cloudflare";

import { redirect } from "@tanstack/react-router";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getSentryRuntimeOptions, isBrowserSentryRuntime, resolveSentryEnvironment } from "./index";

describe("Sentry runtime helpers", () => {
	test("skips runtime initialization when no DSN is configured", () => {
		expect(getSentryRuntimeOptions({})).toBe(undefined);
	});

	test("builds conservative runtime options from Cloudflare env", () => {
		const options = getSentryRuntimeOptions({ VITE_SENTRY_DSN: "https://example@sentry.io/1" });
		expect(options).toMatchObject({
			dsn: "https://example@sentry.io/1",
			environment: "production",
			tracesSampleRate: 0.1,
		});
		expect(options?.dataCollection).toEqual({
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
		});
		expect(typeof options?.beforeSend).toBe("function");
		expect(typeof options?.beforeSendSpan).toBe("function");
		expect(typeof options?.beforeSendLog).toBe("function");
		expect(typeof options?.beforeBreadcrumb).toBe("function");
	});

	test("takes release, environment and sample rate from the Worker env", () => {
		const options = getSentryRuntimeOptions({
			VITE_SENTRY_DSN: "https://example@sentry.io/1",
			SENTRY_RELEASE: "release-1",
			SENTRY_ENVIRONMENT: "staging",
			SENTRY_TRACES_SAMPLE_RATE: "0.25",
		});
		expect(options).toMatchObject({
			environment: "staging",
			release: "release-1",
			tracesSampleRate: 0.25,
		});
	});

	test("falls back from the commit SHA to the Worker version id for the release", () => {
		const dsnConfig = { VITE_SENTRY_DSN: "https://example@sentry.io/1" };
		expect(getSentryRuntimeOptions({ ...dsnConfig, GIT_COMMIT_SHA: "abc123" })).toMatchObject({
			release: "abc123",
		});
		expect(
			getSentryRuntimeOptions({
				...dsnConfig,
				CF_VERSION_METADATA: { id: "version-1", tag: "", timestamp: "" },
			}),
		).toMatchObject({ release: "version-1" });
	});

	test("drops the redirect a loader throws but keeps other thrown Responses", () => {
		const options = getSentryRuntimeOptions({ VITE_SENTRY_DSN: "https://example@sentry.io/1" });
		const beforeSend = options?.beforeSend;
		if (!beforeSend) throw new Error("beforeSend is not wired");
		const event: ErrorEvent = { message: "boom", type: undefined };

		let thrownRedirect: unknown;
		try {
			redirect({ to: "/blog", throw: true });
		} catch (error) {
			thrownRedirect = error;
		}

		expect(beforeSend(event, { originalException: thrownRedirect })).toBeNull();
		expect(beforeSend(event, { originalException: new Response(null, { status: 307 }) })).toEqual(
			event,
		);
	});

	test("does not treat node tests as a browser Sentry runtime", () => {
		expect(isBrowserSentryRuntime()).toBe(false);
	});
});

describe("resolveSentryEnvironment", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test("prefers the explicit VITE_SENTRY_ENVIRONMENT override", () => {
		vi.stubEnv("VITE_SENTRY_ENVIRONMENT", "  custom  ");
		expect(resolveSentryEnvironment()).toBe("custom");
	});

	test("reports development outside a production build", () => {
		vi.stubEnv("VITE_SENTRY_ENVIRONMENT", "");
		vi.stubEnv("PROD", false);
		expect(resolveSentryEnvironment()).toBe("development");
	});

	test("classifies production, staging and preview hosts", () => {
		vi.stubEnv("VITE_SENTRY_ENVIRONMENT", "");
		vi.stubEnv("PROD", true);

		vi.stubGlobal("location", { hostname: "sreetamdas.com" });
		expect(resolveSentryEnvironment()).toBe("production");

		vi.stubGlobal("location", { hostname: "dev.sreetamdas.com" });
		expect(resolveSentryEnvironment()).toBe("staging");

		vi.stubGlobal("location", { hostname: "staging.sreetamdas.com" });
		expect(resolveSentryEnvironment()).toBe("staging");

		vi.stubGlobal("location", { hostname: "sreetamdas-com.preview.workers.dev" });
		expect(resolveSentryEnvironment()).toBe("preview");
	});
});
