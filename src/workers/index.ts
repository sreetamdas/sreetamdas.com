import { WebSocket as CFWebSocket } from "@cloudflare/workers-types";

export interface Env {
	live_views_counter: DurableObjectNamespace;
}

export class LiveViewsCounter {
	state: DurableObjectState;
	env: Env;
	sessions: Array<{ userID: string; socket: CFWebSocket }>;
	uniqueUsers: Set<string>;

	constructor(controller: DurableObjectState, env: Env) {
		this.state = controller;
		this.env = env;

		this.sessions = [];
		this.uniqueUsers = new Set();

		this.state.blockConcurrencyWhile(async () => {
			await this.state.storage.put("live_views_counter", 0);
		});
	}

	broadcast(message: string) {
		this.sessions.forEach(({ socket, userID }) => {
			socket.send(message);
			console.log(`Broadcast to ${userID}`);
		});
	}

	async incrementLiveViewers() {
		const staleCount = (await this.state.storage.get<number>("live_views_counter")) ?? 0;
		const updatedCount = staleCount + 1;
		await this.state.storage.put("live_views_counter", updatedCount);

		this.broadcast(updatedCount.toString());
	}

	async handleNewSession(serverSocket: CFWebSocket, ip: string) {
		serverSocket.accept();

		const userID = this.env.live_views_counter.idFromName(ip).toString();

		// check if unique user
		const userIsAlreadyViewing = this.uniqueUsers.has(userID);

		if (!userIsAlreadyViewing) {
			this.uniqueUsers.add(userID);
			this.sessions.push({ userID, socket: serverSocket });
			await this.incrementLiveViewers();
		}

		serverSocket.addEventListener("message", (event) => {
			console.log(event.data);
			serverSocket.send("PONG");
		});
	}

	async fetch(request: Request) {
		const ip = request.headers.get("CF-Connecting-IP") ?? "";

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		await this.handleNewSession(server as unknown as CFWebSocket, ip);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}
}

async function handleWebSocketRequest(request: Request, env: Env) {
	const upgradeHeader = request.headers.get("Upgrade");

	if (!upgradeHeader || upgradeHeader !== "websocket") {
		return new Response("Expected Upgrade: websocket", { status: 426 });
	}

	const pathname = new URL(request.url).pathname;

	const id = env.live_views_counter.idFromName(pathname);
	const live_views_counter = env.live_views_counter.get(id);
	console.log({ pathname });

	return await live_views_counter.fetch(request);
}

export default {
	fetch: handleWebSocketRequest,
};
