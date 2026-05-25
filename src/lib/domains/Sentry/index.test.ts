import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getSentryRuntimeOptions, isBrowserSentryRuntime } from "./index";

describe("Sentry runtime helpers", () => {
	test("skips runtime initialization when no DSN is configured", () => {
		assert.equal(getSentryRuntimeOptions({}), undefined);
	});

	test("builds conservative runtime options from Cloudflare env", () => {
		assert.deepEqual(getSentryRuntimeOptions({ VITE_SENTRY_DSN: "https://example@sentry.io/1" }), {
			dsn: "https://example@sentry.io/1",
			enableLogs: true,
			sendDefaultPii: false,
			tracesSampleRate: 0.1,
		});
	});

	test("does not treat node tests as a browser Sentry runtime", () => {
		assert.equal(isBrowserSentryRuntime(), false);
	});
});
