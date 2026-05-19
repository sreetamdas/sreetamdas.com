import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: async ({ request, context }: { request: Request; context: { env: CloudflareEnv } }) => {
				const env = context.env;
				if (!env?.SITE_PRESENCE) {
					throw new Error("SITE_PRESENCE binding is not available");
				}

				const stub = env.SITE_PRESENCE.getByName("global");
				return stub.fetch(request);
			},
		},
	},
});
