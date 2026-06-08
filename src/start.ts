/**
 * TanStack Start request setup.
 *
 * Cloudflare's `cloudflare:workers` module is the canonical runtime source
 * for bindings during Start request handling, including prerender/static
 * server-function execution.
 */
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
	requestMiddleware: [csrfMiddleware],
	functionMiddleware: [],
}));
