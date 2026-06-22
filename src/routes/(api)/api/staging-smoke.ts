import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

import buildInfo from "@/build-info.json";

type LikeRuntimeEnv = Partial<Pick<CloudflareEnv, "LIKES_COOKIE_SECRET" | "LIKES_IP_SALT">>;

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

export function getLikeRuntimeStatus(runtimeEnv: LikeRuntimeEnv) {
	const cookieSecretConfigured = hasRuntimeValue(runtimeEnv.LIKES_COOKIE_SECRET);
	const ipSaltConfigured = hasRuntimeValue(runtimeEnv.LIKES_IP_SALT);

	return {
		cookieSecretConfigured,
		ipSaltConfigured,
		writeReady: cookieSecretConfigured && ipSaltConfigured,
	};
}

export function handleStagingSmokeGet(request: Request, runtimeEnv: LikeRuntimeEnv = env) {
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
			likes: getLikeRuntimeStatus(runtimeEnv),
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

function hasRuntimeValue(value?: string) {
	return Boolean(value?.trim());
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
