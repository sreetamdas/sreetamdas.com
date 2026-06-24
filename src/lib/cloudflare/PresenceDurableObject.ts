import { DurableObject } from "cloudflare:workers";

import {
	PRESENCE_CLIENT_ID_PARAM,
	isPresenceClientId,
	type PresenceServerMessage,
} from "@/lib/domains/Presence/protocol";

import { isAllowedWebSocketOrigin } from "./origin";

type ConnectionAttachment = {
	clientId: string;
	connectedAt: number;
	lastSeenAt: number;
};

type PresenceTimings = {
	heartbeatIntervalMs: number;
	staleAfterMs: number;
};

const DEFAULT_HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_TO_STALE_MULTIPLIER = 3;
const MIN_HEARTBEAT_INTERVAL_MS = 50;
const MAX_HEARTBEAT_INTERVAL_MS = DEFAULT_HEARTBEAT_INTERVAL_MS;
const PRESENCE_HEARTBEAT_INTERVAL_ENV = "PRESENCE_HEARTBEAT_INTERVAL_MS";

function parseConnectionAttachment(value: unknown): ConnectionAttachment | null {
	if (typeof value !== "object" || value === null) {
		return null;
	}

	if (!("clientId" in value) || !("connectedAt" in value) || !("lastSeenAt" in value)) {
		return null;
	}

	if (!isPresenceClientId(value.clientId)) {
		return null;
	}

	if (typeof value.connectedAt !== "number" || typeof value.lastSeenAt !== "number") {
		return null;
	}

	return {
		clientId: value.clientId,
		connectedAt: value.connectedAt,
		lastSeenAt: value.lastSeenAt,
	};
}

function clampHeartbeatInterval(value: number) {
	return Math.min(MAX_HEARTBEAT_INTERVAL_MS, Math.max(MIN_HEARTBEAT_INTERVAL_MS, value));
}

function getPresenceTimings(platformEnv: CloudflareEnv): PresenceTimings {
	const configured = Reflect.get(platformEnv, PRESENCE_HEARTBEAT_INTERVAL_ENV);
	const parsed = typeof configured === "string" ? Number(configured) : Number.NaN;
	const heartbeatIntervalMs = Number.isFinite(parsed)
		? clampHeartbeatInterval(parsed)
		: DEFAULT_HEARTBEAT_INTERVAL_MS;

	return {
		heartbeatIntervalMs,
		staleAfterMs: heartbeatIntervalMs * HEARTBEAT_TO_STALE_MULTIPLIER,
	};
}

function getClientId(request: Request) {
	const value = new URL(request.url).searchParams.get(PRESENCE_CLIENT_ID_PARAM);
	return isPresenceClientId(value) ? value : null;
}

export class PresenceDurableObject extends DurableObject<CloudflareEnv> {
	private readonly heartbeatIntervalMs: number;
	private readonly staleAfterMs: number;

	constructor(ctx: DurableObjectState, platformEnv: CloudflareEnv) {
		super(ctx, platformEnv);
		const timings = getPresenceTimings(platformEnv);
		this.heartbeatIntervalMs = timings.heartbeatIntervalMs;
		this.staleAfterMs = timings.staleAfterMs;

		// Give hibernatable websockets a reasonable event timeout.
		this.ctx.setHibernatableWebSocketEventTimeout(60_000);
		this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
	}

	private getLastSeenAt(ws: WebSocket, attachment: ConnectionAttachment) {
		const autoResponseAt = this.ctx.getWebSocketAutoResponseTimestamp(ws)?.getTime() ?? 0;
		return Math.max(attachment.lastSeenAt, autoResponseAt);
	}

	private touch(ws: WebSocket, now: number) {
		const prev = parseConnectionAttachment(ws.deserializeAttachment());
		if (!prev) return;
		ws.serializeAttachment({
			clientId: prev.clientId,
			connectedAt: prev.connectedAt,
			lastSeenAt: now,
		} satisfies ConnectionAttachment);
	}

	private isSocketActive(ws: WebSocket, now: number) {
		if (ws.readyState !== WebSocket.OPEN) return false;
		const attachment = parseConnectionAttachment(ws.deserializeAttachment());
		if (!attachment) return false;
		return now - this.getLastSeenAt(ws, attachment) <= this.staleAfterMs;
	}

	private getViewerCount(now = Date.now()) {
		const clientIds = new Set<string>();
		for (const ws of this.ctx.getWebSockets()) {
			if (!this.isSocketActive(ws, now)) continue;
			const attachment = parseConnectionAttachment(ws.deserializeAttachment());
			if (attachment) clientIds.add(attachment.clientId);
		}
		return clientIds.size;
	}

	private broadcast(message: PresenceServerMessage, now = Date.now()) {
		const payload = JSON.stringify(message);
		for (const ws of this.ctx.getWebSockets()) {
			if (!this.isSocketActive(ws, now)) continue;
			try {
				ws.send(payload);
			} catch {
				// Ignore failures; close/error events or the next alarm reconcile the count.
			}
		}
	}

	private broadcastCount(now = Date.now()) {
		this.broadcast({ type: "count", count: this.getViewerCount(now) }, now);
	}

	private pruneStaleConnections(now: number) {
		const before = this.getViewerCount(now);
		let closedAny = false;

		for (const ws of this.ctx.getWebSockets()) {
			if (ws.readyState !== WebSocket.OPEN) continue;

			const attachment = parseConnectionAttachment(ws.deserializeAttachment());
			if (!attachment) {
				this.closeSocket(ws, "invalid");
				closedAny = true;
				continue;
			}

			const lastSeenAt = this.getLastSeenAt(ws, attachment);
			if (lastSeenAt > attachment.lastSeenAt) {
				ws.serializeAttachment({ ...attachment, lastSeenAt } satisfies ConnectionAttachment);
			}

			if (now - lastSeenAt <= this.staleAfterMs) continue;
			this.closeSocket(ws, "stale");
			closedAny = true;
		}

		return { closedAny, countChanged: before !== this.getViewerCount(now) };
	}

	private closeSocket(ws: WebSocket, reason: string) {
		try {
			ws.close(1001, reason);
		} catch {
			// noop
		}
	}

	private async syncAlarm(now = Date.now()) {
		const hasOpenSockets = this.ctx.getWebSockets().some((ws) => ws.readyState === WebSocket.OPEN);

		if (hasOpenSockets) {
			await this.ctx.storage.setAlarm(now + this.heartbeatIntervalMs);
			return;
		}

		await this.ctx.storage.deleteAlarm();
	}

	async fetch(request: Request): Promise<Response> {
		if (request.method !== "GET") {
			return new Response("Method Not Allowed", { status: 405 });
		}

		const upgradeHeader = request.headers.get("Upgrade");
		if (upgradeHeader?.toLowerCase() === "websocket") {
			if (!isAllowedWebSocketOrigin(request)) {
				return new Response("Forbidden", { status: 403 });
			}

			const clientId = getClientId(request);
			if (!clientId) {
				return new Response("Invalid presence client id", { status: 400 });
			}

			const pair = new WebSocketPair();
			const { 0: client, 1: server } = pair;
			const now = Date.now();

			this.ctx.acceptWebSocket(server, ["viewer", `client:${clientId}`]);
			server.serializeAttachment({
				clientId,
				connectedAt: now,
				lastSeenAt: now,
			} satisfies ConnectionAttachment);

			this.pruneStaleConnections(now);
			this.broadcastCount(now);
			await this.syncAlarm(now);

			return new Response(null, { status: 101, webSocket: client });
		}

		const now = Date.now();
		const pruned = this.pruneStaleConnections(now);
		if (pruned.closedAny || pruned.countChanged) this.broadcastCount(now);
		await this.syncAlarm(now);

		return Response.json(
			{ count: this.getViewerCount(now) },
			{ headers: { "Cache-Control": "no-store" } },
		);
	}

	async alarm() {
		const now = Date.now();
		const pruned = this.pruneStaleConnections(now);
		if (pruned.closedAny || pruned.countChanged) {
			this.broadcastCount(now);
		}
		await this.syncAlarm(now);
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		if (typeof message !== "string") return;
		if (message !== "ping") return;

		const now = Date.now();
		this.touch(ws, now);
		try {
			ws.send("pong");
		} catch {
			// noop
		}
		await this.syncAlarm(now);
	}

	async webSocketClose() {
		this.broadcastCount();
		await this.syncAlarm();
	}

	async webSocketError() {
		this.broadcastCount();
		await this.syncAlarm();
	}
}
