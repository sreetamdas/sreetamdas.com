import { DurableObject } from "cloudflare:workers";

type PresenceMessage =
	| {
			type: "count";
			count: number;
		}
	| {
			type: "pong";
		};

export class PresenceDurableObject extends DurableObject<CloudflareEnv> {
	constructor(ctx: DurableObjectState, env: CloudflareEnv) {
		super(ctx, env);
		// Give hibernatable websockets a reasonable event timeout.
		this.ctx.setHibernatableWebSocketEventTimeout(60_000);
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

	async fetch(request: Request): Promise<Response> {
		const upgradeHeader = request.headers.get("Upgrade");
		if (upgradeHeader?.toLowerCase() === "websocket") {
			const pair = new WebSocketPair();
			const { 0: client, 1: server } = pair;

			this.ctx.acceptWebSocket(server, ["viewer"]);

			// Send a count to the joining client immediately, then broadcast the updated count.
			try {
				server.send(JSON.stringify({ type: "count", count: this.getViewerCount() } satisfies PresenceMessage));
			} catch {
				// Ignore; a close event will follow.
			}
			this.broadcastCount();

			return new Response(null, { status: 101, webSocket: client });
		}

		return Response.json({ count: this.getViewerCount() });
	}

	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		if (typeof message === "string" && message === "ping") {
			try {
				ws.send(JSON.stringify({ type: "pong" } satisfies PresenceMessage));
			} catch {
				// noop
			}
			return;
		}
	}

	webSocketClose() {
		this.broadcastCount();
	}

	webSocketError() {
		this.broadcastCount();
	}
}
