import { SetupWorkerApi, SharedOptions } from "msw";
import { SetupServerApi } from "msw/lib/node";

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
	// we're not adding this handler when SENTRY_ENVELOPE_URL is undefined
	if (
		typeof SENTRY_ENVELOPE_URL !== "undefined" &&
		request.url.href.startsWith(SENTRY_ENVELOPE_URL)
	) {
		return;
	}

	// Otherwise, execute the default warning/error/ strategy.
	print.warning(); // or "print.error()"
}

type ServerOptions = Parameters<SetupServerApi["listen"]>[0];
type WorkerOptions = Parameters<SetupWorkerApi["start"]>[0];

async function initMocks() {
	const workerOptions: ServerOptions | WorkerOptions = {
		onUnhandledRequest,
	};
	if (typeof window === "undefined") {
		// server
		const { server } = (await import("./server")) as { server: SetupServerApi };
		server.listen(workerOptions);
	} else {
		// worker
		if (typeof SENTRY_ENVELOPE_URL !== "undefined") {
			// eslint-disable-next-line no-console
			console.info("[MSW] Info: Sentry DSN found. Skipping logging unhandled Sentry API requests.");
		} else {
			// eslint-disable-next-line no-console
			console.warn("[MSW] Warning: Sentry DSN is missing. Logging unhandled Sentry API requests.");
		}
		const { worker } = (await import("./browser")) as { worker: SetupWorkerApi };
		worker.start(workerOptions);
	}
}

if (process.env.NEXT_PUBLIC_API_MOCKING_ENABLED === "true") {
	// eslint-disable-next-line no-console
	console.log("info: MOCKING IS ENABLED");

	initMocks();
}
