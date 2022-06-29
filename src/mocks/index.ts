/* eslint-disable @typescript-eslint/no-var-requires */
import { SetupWorkerApi, SharedOptions } from "msw";

import { SENTRY_ENVELOPE_URL } from "@/domains/sentry";

type UnhandledRequestStrategy = NonNullable<SharedOptions["onUnhandledRequest"]>;
type UnhandledRequestCallback = Parameters<
	Exclude<UnhandledRequestStrategy, "bypass" | "warn" | "error">
>;

function onUnhandledRequest(
	request: UnhandledRequestCallback[0],
	print: UnhandledRequestCallback[1]
) {
	// Ignore unhandled Sentry requests.
	if (request.url.href.startsWith(SENTRY_ENVELOPE_URL)) {
		return;
	}

	// Otherwise, execute the default warning/error/ strategy.
	print.warning(); // or "print.error()"
}

if (typeof window === "undefined") {
	const { server } = require("./server");
	server.listen({
		onUnhandledRequest,
	});
} else {
	const { worker } = require("./browser") as { worker: SetupWorkerApi };
	worker.start({
		onUnhandledRequest,
	});
}

export {};
