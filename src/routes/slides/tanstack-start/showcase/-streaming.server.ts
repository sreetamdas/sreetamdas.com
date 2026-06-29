import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Deliberately slow so the streaming boundary is *visible* on stage. The route
 * loader returns this promise WITHOUT awaiting it, so TanStack Start flushes the
 * page shell immediately and streams this panel into the same HTTP response when
 * it resolves. This is the same React streaming Next.js PPR uses for its dynamic
 * holes — but note the difference: PPR also *prebuilds a static shell* at build
 * time, whereas this shell is server-rendered per request. We have the streaming
 * half (a deferred loader promise + `<Await>`), not the partial-prerender half.
 */
export const STREAMING_DEMO_DELAY_MS = 1200;

export type StreamingShowcaseData = {
	durationMs: number;
	renderedAtIso: string;
	requestId: string;
	rows: Array<{ label: string; value: string }>;
};

export const getStreamingShowcaseData = createServerFn({ method: "GET" }).handler(
	async (): Promise<StreamingShowcaseData> => {
		const startedAt = Date.now();
		await new Promise((resolve) => setTimeout(resolve, STREAMING_DEMO_DELAY_MS));

		const cfRay = getRequestHeader("cf-ray");
		const requestId = cfRay?.split("-")[0] ?? crypto.randomUUID().slice(0, 8);

		return {
			durationMs: Date.now() - startedAt,
			renderedAtIso: new Date().toISOString(),
			requestId,
			rows: [
				{ label: "page shell", value: "flushed first, before this resolved" },
				{ label: "this panel", value: `streamed in after ~${STREAMING_DEMO_DELAY_MS}ms` },
				{ label: "transport", value: "one response, progressively flushed" },
				{ label: "delivery", value: "server-streamed, not a client fetch" },
			],
		};
	},
);
