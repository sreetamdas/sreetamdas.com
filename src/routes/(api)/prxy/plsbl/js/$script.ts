import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(api)/prxy/plsbl/js/$script")({
	server: {
		handlers: {
			GET: async ({ params, request }: { params: { script: string }; request: Request }) => {
				const incomingUrl = new URL(request.url);
				const targetUrl = new URL(`https://plausible.io/js/${params.script}`);
				targetUrl.search = incomingUrl.search;

				const upstream = await fetch(targetUrl, {
					method: "GET",
					headers: {
						"user-agent": request.headers.get("user-agent") ?? "",
						accept: request.headers.get("accept") ?? "*/*",
					},
				});

				return new Response(upstream.body, {
					status: upstream.status,
					headers: upstream.headers,
				});
			},
		},
	},
});
