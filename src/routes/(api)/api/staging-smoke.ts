import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

import buildInfo from "@/build-info.json";

type LikeRuntimeD1 = {
	prepare: (query: string) => {
		run: () => Promise<unknown> | unknown;
	};
};

type SmokeRuntimeEnv = {
	D1?: LikeRuntimeD1;
	LIKES_COOKIE_SECRET?: string;
	LIKES_IP_SALT?: string;
	STATS?: unknown;
	STATS_RPC?: unknown;
	ANALYTICS_PROJECT_SLUG?: string;
	RELAY_TOKEN?: string;
};

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

export async function getLikeRuntimeStatus(runtimeEnv: SmokeRuntimeEnv) {
	const cookieSecretConfigured = hasRuntimeValue(runtimeEnv.LIKES_COOKIE_SECRET);
	const ipSaltConfigured = hasRuntimeValue(runtimeEnv.LIKES_IP_SALT);
	const likeSchemaReady = await hasLikeSchema(runtimeEnv.D1);

	return {
		cookieSecretConfigured,
		ipSaltConfigured,
		likeSchemaReady,
		writeReady: cookieSecretConfigured && ipSaltConfigured && likeSchemaReady,
	};
}

export async function handleStagingSmokeGet(request: Request, runtimeEnv: SmokeRuntimeEnv = env) {
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
			likes: await getLikeRuntimeStatus(runtimeEnv),
			statsRelay: await getStatsRelayStatus(runtimeEnv),
			statsRpc: await getStatsRpcStatus(runtimeEnv),
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

export async function getStatsRelayStatus(runtimeEnv: SmokeRuntimeEnv) {
	const relayToken = runtimeEnv.RELAY_TOKEN;
	if (
		!hasFetcher(runtimeEnv.STATS) ||
		!runtimeEnv.ANALYTICS_PROJECT_SLUG ||
		!hasRuntimeValue(relayToken)
	) {
		return { ready: false };
	}
	try {
		const response = await runtimeEnv.STATS.fetch(
			`https://stats.internal/v1/relay/${runtimeEnv.ANALYTICS_PROJECT_SLUG}`,
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-relay-token": relayToken,
					"x-relay-ip": "192.0.2.1",
					"x-relay-ua": "staging-smoke",
				},
				body: "{}",
			},
		);
		return { ready: response.status === 400 };
	} catch {
		return { ready: false };
	}
}

export async function getStatsRpcStatus(runtimeEnv: SmokeRuntimeEnv) {
	if (!hasStatsRpc(runtimeEnv.STATS_RPC) || !runtimeEnv.ANALYTICS_PROJECT_SLUG) {
		return { ready: false };
	}
	try {
		const result: unknown = await runtimeEnv.STATS_RPC.getStats(
			runtimeEnv.ANALYTICS_PROJECT_SLUG,
			"7d",
		);
		if (typeof result !== "object" || result === null || !("status" in result)) {
			return { ready: false };
		}
		return { ready: result.status === "ready" };
	} catch {
		return { ready: false };
	}
}

function hasFetcher(value: unknown): value is {
	fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
} {
	return (
		typeof value === "object" &&
		value !== null &&
		"fetch" in value &&
		typeof value.fetch === "function"
	);
}

function hasStatsRpc(value: unknown): value is {
	getStats(projectSlug: string, period: string): Promise<unknown>;
} {
	return (
		typeof value === "object" &&
		value !== null &&
		"getStats" in value &&
		typeof value.getStats === "function"
	);
}

function hasRuntimeValue(value?: string): value is string {
	return Boolean(value?.trim());
}

async function hasLikeSchema(d1?: LikeRuntimeD1) {
	if (!d1) return false;

	try {
		await d1.prepare("SELECT ip_hash, salt_version FROM post_likes LIMIT 0").run();
		return true;
	} catch {
		return false;
	}
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
