import { createMiddleware, createStart } from "@tanstack/react-start";

declare module "@tanstack/react-router" {
	interface Register {
		server: {
			requestContext: {
				env: CloudflareEnv;
			};
		};
	}
}

let cachedEnv: CloudflareEnv | undefined;

async function getCloudflareEnv(): Promise<CloudflareEnv> {
	if (cachedEnv) {
		return cachedEnv;
	}

	const workersModule = "cloudflare:workers";
	const { env } = await import(/* @vite-ignore */ workersModule);
	cachedEnv = env;

	return env;
}

const cloudflareContextMiddleware = createMiddleware().server(async ({ next }) => {
	const env = await getCloudflareEnv();

	return next({
		context: { env },
	});
});

export const startInstance = createStart(() => ({
	requestMiddleware: [cloudflareContextMiddleware],
}));
