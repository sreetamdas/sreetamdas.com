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

export const startInstance = createStart(() => ({
	requestMiddleware: [csrfMiddleware, cloudflareContextMiddleware],
}));
