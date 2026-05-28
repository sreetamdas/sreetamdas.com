import { createFileRoute } from "@tanstack/react-router";

import buildInfo from "@/build-info.json";

/**
 * Staging-only deploy marker used by agents/humans to prove the exact build
 * that reached the Cloudflare Workers staging hostname without exposing the
 * diagnostic endpoint on production.
 */
const STAGING_SMOKE_HOSTS = new Set([
	"staging.sreetamdas.com",
	"dev.sreetamdas.com",
	"localhost",
	"127.0.0.1",
	"::1",
]);

export function handleStagingSmokeGet(request: Request) {
	const url = new URL(request.url);
	if (!isStagingSmokeHost(url.hostname)) {
		return new Response("Not Found", {
			headers: {
				"cache-control": "no-store",
			},
			status: 404,
		});
	}

	return Response.json(
		{
			build: buildInfo,
			ok: true,
			purpose: "staging-deploy-verification",
		},
		{
			headers: {
				"cache-control": "no-store",
			},
		},
	);
}

export function isStagingSmokeHost(hostname: string) {
	return STAGING_SMOKE_HOSTS.has(hostname.toLowerCase());
}

export const Route = createFileRoute("/(api)/api/staging-smoke")({
	server: {
		handlers: {
			GET: ({ request }) => {
				return handleStagingSmokeGet(request);
			},
		},
	},
});
