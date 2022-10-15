/* eslint-disable @typescript-eslint/no-var-requires */
import { SetupWorkerApi, SharedOptions } from "msw";

import { SENTRY_ENVELOPE_URL } from "@/domains/Sentry";

type UnhandledRequestStrategy = NonNullable<SharedOptions["onUnhandledRequest"]>;
type UnhandledRequestCallback = Parameters<
	Exclude<UnhandledRequestStrategy, "bypass" | "warn" | "error">
>;

function onUnhandledRequest(
	request: UnhandledRequestCallback[0],
	print: UnhandledRequestCallback[1]
) {
	// Ignore /_next/* requests
	if (request.url.pathname.startsWith("/_next/")) {
		return;
	}

	// Ignore unhandled Sentry requests.
	// @ts-expect-error we're not adding this handler when SENTRY_ENVELOPE_URL is undefined
	if (request.url.href.startsWith(SENTRY_ENVELOPE_URL)) {
		return;
	}

	// Otherwise, execute the default warning/error/ strategy.
	print.warning(); // or "print.error()"
}

let workerOptions;
if (typeof window === "undefined") {
	if (typeof SENTRY_ENVELOPE_URL !== "undefined") {
		workerOptions = {
			onUnhandledRequest,
		};
	}
	const { server } = require("./server");
	server.listen(workerOptions);
} else {
	if (typeof SENTRY_ENVELOPE_URL !== "undefined") {
		// eslint-disable-next-line no-console
		console.info("[MSW] Info: Sentry DSN found. Skipping logging unhandled Sentry API requests.");
		workerOptions = {
			onUnhandledRequest,
		};
	} else {
		// eslint-disable-next-line no-console
		console.warn("[MSW] Warning: Sentry DSN is missing. Logging unhandled Sentry API requests.");
	}
	const { worker } = require("./browser") as { worker: SetupWorkerApi };
	worker.start(workerOptions);
}

export {};
