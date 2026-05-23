import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";

declare module "@tanstack/react-router" {
	interface Register {
		server: {
			requestContext: {
				env: CloudflareEnv;
			};
		};
	}
}
const cloudflareContextMiddleware = createMiddleware().server(async ({ next }) => {
	const workersModule = "cloudflare:workers";
	const { env } = await import(/* @vite-ignore */ workersModule);

	return next({
		context: { env },
	});
});

const csrfMiddleware = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

function createCustomFetch() {
	if (typeof process === "undefined") return fetch;
	return (url: RequestInfo | URL, init?: RequestInit) => {
		const headers = new Headers(init?.headers);
		headers.delete("accept-encoding");
		return fetch(url, { ...init, headers });
	};
}

export const startInstance = createStart(() => ({
	requestMiddleware: [csrfMiddleware, cloudflareContextMiddleware],
	serverFns: {
		fetch: createCustomFetch(),
	},
}));
