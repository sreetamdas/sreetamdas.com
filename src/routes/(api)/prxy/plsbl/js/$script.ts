/**
 * First-party Plausible script proxy. Keeping the script URL same-origin lets
 * the root document reference `/prxy/plsbl/...` while still serving the current
 * upstream Plausible script and preserving query parameters.
 */
import { createFileRoute } from "@tanstack/react-router";

export async function handlePlausibleScriptGet(
	script: string,
	request: Request,
): Promise<Response> {
	const incomingUrl = new URL(request.url);
	const targetUrl = new URL(`https://plausible.io/js/${script}`);
	targetUrl.search = incomingUrl.search;

	try {
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
	} catch {
		return Response.json({ error: "Plausible script upstream is unavailable" }, { status: 502 });
	}
}

export const Route = createFileRoute("/(api)/prxy/plsbl/js/$script")({
	server: {
		handlers: {
			GET: async ({ params, request }: { params: { script: string }; request: Request }) => {
				return handlePlausibleScriptGet(params.script, request);
			},
		},
	},
});
