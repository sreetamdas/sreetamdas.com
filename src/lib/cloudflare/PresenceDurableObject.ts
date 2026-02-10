import { DurableObject } from "cloudflare:workers";

type PresenceMessage = {
	type: "count";
	count: number;
};

type ConnectionAttachment = {
	connectedAt: number;
	lastSeenAt: number;
};

const PING_INTERVAL_MS = 60_000;
// Consider a connection stale after missing a couple of heartbeats.
const STALE_AFTER_MS = 3 * PING_INTERVAL_MS;
const PRUNE_MIN_INTERVAL_MS = PING_INTERVAL_MS;

export class PresenceDurableObject extends DurableObject<CloudflareEnv> {
	private lastPruneAt = 0;

	constructor(ctx: DurableObjectState, env: CloudflareEnv) {
		super(ctx, env);
		// Give hibernatable websockets a reasonable event timeout.
		this.ctx.setHibernatableWebSocketEventTimeout(60_000);
	}

	private isAllowedOrigin(request: Request) {
		const origin = request.headers.get("Origin");
		if (!origin) return true;
		let originUrl: URL;
		try {
			originUrl = new URL(origin);
		} catch {
			return false;
		}

		const reqUrl = new URL(request.url);
		const originHost = originUrl.hostname;
		const requestHost = reqUrl.hostname;

		// Most browsers set Origin to the page origin, which should match the request host.
		if (originHost === requestHost) return true;

		// Allow common production hosts.
		if (originHost === "sreetamdas.com" || originHost === "www.sreetamdas.com") return true;

		// Allow Workers dev subdomain during development.
		if (originHost.endsWith(".workers.dev") && requestHost.endsWith(".workers.dev")) return true;

		return false;
	}

	private getViewerCount() {
		return this.ctx.getWebSockets().length;
	}

	private broadcast(message: PresenceMessage) {
		const payload = JSON.stringify(message);
		for (const ws of this.ctx.getWebSockets()) {
			try {
				ws.send(payload);
			} catch {
				// Ignore failures; close events will reconcile the count.
			}
		}
	}

	private broadcastCount() {
		this.broadcast({ type: "count", count: this.getViewerCount() });
	}

	private maybePruneStaleConnections(now: number) {
		if (now - this.lastPruneAt < PRUNE_MIN_INTERVAL_MS) return false;
		this.lastPruneAt = now;

		let closedAny = false;
		for (const ws of this.ctx.getWebSockets()) {
			const attachment = ws.deserializeAttachment() as ConnectionAttachment | null;
			if (!attachment) continue;
			if (now - attachment.lastSeenAt <= STALE_AFTER_MS) continue;
			try {
				ws.close(1001, "stale");
				closedAny = true;
			} catch {
				// noop
			}
		}

		if (closedAny) {
			this.broadcastCount();
		}
		return closedAny;
	}

	async fetch(request: Request): Promise<Response> {
		if (request.method !== "GET") {
			return new Response("Method Not Allowed", { status: 405 });
		}

		const upgradeHeader = request.headers.get("Upgrade");
		if (upgradeHeader?.toLowerCase() === "websocket") {
			if (!this.isAllowedOrigin(request)) {
				return new Response("Forbidden", { status: 403 });
			}

			const pair = new WebSocketPair();
			const { 0: client, 1: server } = pair;

			this.ctx.acceptWebSocket(server, ["viewer"]);
			server.serializeAttachment({
				connectedAt: Date.now(),
				lastSeenAt: Date.now(),
			} satisfies ConnectionAttachment);

			const pruned = this.maybePruneStaleConnections(Date.now());
			// Broadcast the updated count (includes this connection).
			if (!pruned) this.broadcastCount();

			return new Response(null, { status: 101, webSocket: client });
		}

		return Response.json(
			{ count: this.getViewerCount() },
			{ headers: { "Cache-Control": "no-store" } },
		);
	}

	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		if (typeof message === "string" && message === "ping") {
			const now = Date.now();
			const prev = ws.deserializeAttachment() as ConnectionAttachment | null;
			ws.serializeAttachment({
				connectedAt: prev?.connectedAt ?? now,
				lastSeenAt: now,
			} satisfies ConnectionAttachment);
			this.maybePruneStaleConnections(now);
			return;
		}
	}

	webSocketClose(_ws: WebSocket, _code: number, reason: string) {
		if (reason !== "stale") {
			this.broadcastCount();
		}
	}

	webSocketError() {
		this.broadcastCount();
	}
}
