import { createMiddleware, createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * The typed server boundary behind the "client → middleware → server" demo. The
 * function middleware has a `.client()` half (runs in the browser, tags who
 * initiated the call) and a `.server()` half (runs on the server, injects a
 * request id and server-only context). The handler receives the merged, typed
 * context.
 */
export type BoundarySnapshot = {
	boundaryLabel: string;
	clientRuntime: string;
	requestId: string;
	serverRuntime: string;
};

const getServerOnlyBoundaryLabel = createServerOnlyFn(
	() => "server-only code stayed behind the boundary",
);

const boundaryFunctionMiddleware = createMiddleware({ type: "function" })
	.client(async ({ next }) => {
		return next({
			sendContext: {
				clientRuntime: typeof document === "undefined" ? "server render" : "browser call",
			},
		});
	})
	.server(async ({ context, next }) => {
		const cfRay = getRequestHeader("cf-ray");
		const requestId = cfRay?.split("-")[0] ?? crypto.randomUUID();
		return next({
			context: {
				clientRuntime: context.clientRuntime,
				requestId,
				serverRuntime: "server function middleware",
			},
		});
	});

export const getBoundarySnapshot = createServerFn({ method: "GET" })
	.middleware([boundaryFunctionMiddleware])
	.handler(async ({ context }): Promise<BoundarySnapshot> => {
		return {
			boundaryLabel: getServerOnlyBoundaryLabel(),
			clientRuntime: context.clientRuntime,
			requestId: context.requestId,
			serverRuntime: context.serverRuntime,
		};
	});
