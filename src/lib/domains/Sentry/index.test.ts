import { describe, expect, test } from "vitest";

import { getSentryRuntimeOptions, isBrowserSentryRuntime } from "./index";

describe("Sentry runtime helpers", () => {
	test("skips runtime initialization when no DSN is configured", () => {
		expect(getSentryRuntimeOptions({})).toBe(undefined);
	});

	test("builds conservative runtime options from Cloudflare env", () => {
		expect(getSentryRuntimeOptions({ VITE_SENTRY_DSN: "https://example@sentry.io/1" })).toEqual({
			dsn: "https://example@sentry.io/1",
			enableLogs: true,
			sendDefaultPii: false,
			tracesSampleRate: 0.1,
		});
	});

	test("does not treat node tests as a browser Sentry runtime", () => {
		expect(isBrowserSentryRuntime()).toBe(false);
	});
});
