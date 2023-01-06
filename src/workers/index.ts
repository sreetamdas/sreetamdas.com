/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WebSocket as CFWebSocket } from "@cloudflare/workers-types";

type Session = {
	session_id: string;
	user_id: string;
	path: string;
	socket: CFWebSocket;
};

type PagePath = `/${string}`;

type InitialStorageType = {
	totalViewers: number;
	uniqueUsers: Set<string>;
};
type StorageType = InitialStorageType & {
	[updatedPage: PagePath]: number;
};

type BroadcastMessage =
	| ({
			type: "update/increment" | "update/decrement";
	  } & StorageType)
	| string;

export class LiveViewsCounter {
	state: DurableObjectState;
	env: Env;

	sessions: Array<Session>;
	uniqueUsersSet: Set<string>;

	constructor(controller: DurableObjectState, env: Env) {
		this.state = controller;
		this.env = env;

		this.sessions = [];
		this.uniqueUsersSet = new Set();

		this.state.blockConcurrencyWhile(async () => {
			await this.state.storage.put<InitialStorageType[keyof InitialStorageType]>({
				totalViewers: 0,
				uniqueUsers: new Set(),
			});
		});
	}

	broadcast(messageRaw: BroadcastMessage) {
		let message: string;
		// Apply JSON if we weren't given a string to start with.
		if (typeof messageRaw !== "string") {
			message = JSON.stringify({ ...messageRaw, uniqueUsers: messageRaw.uniqueUsers.size });
		} else {
			message = messageRaw;
		}

		this.sessions.forEach(({ socket }) => {
			socket.send(message);
		});
	}

	async getPersistentStorage(pathname: PagePath) {
		const stale = await this.state.storage.get<StorageType[keyof StorageType]>([
			"totalViewers",
			"uniqueUsers",
			pathname,
		]);

		const staleCount = stale.get("totalViewers")! as number;
		const uniqueUsers = stale.get("uniqueUsers")! as Set<string>;
		const pathUsers = (stale.get(pathname) as number) ?? 0;

		return { staleCount, uniqueUsers, pathUsers };
	}

	async incrementLiveViewers(userID: string, pathname: PagePath) {
		const { staleCount, uniqueUsers, pathUsers } = await this.getPersistentStorage(pathname);

		uniqueUsers.add(userID);
		const updated = { uniqueUsers, totalViewers: staleCount + 1, [pathname]: pathUsers + 1 };

		await this.state.storage.put(updated);
		this.broadcast({ type: "update/increment", ...updated });
	}

	async decrementLiveViewers(pathname: PagePath) {
		const { staleCount, uniqueUsers, pathUsers } = await this.getPersistentStorage(pathname);

		// TODO compute uniqueUsers ƒ
		const updated = { uniqueUsers, totalViewers: staleCount - 1, [pathname]: pathUsers - 1 };

		await this.state.storage.put(updated);
		this.broadcast({ type: "update/decrement", ...updated });
	}

	async handleEndSession(id: string, pathname: PagePath) {
		this.sessions = this.sessions.filter(({ session_id }) => session_id !== id);

		await this.decrementLiveViewers(pathname);
	}

	async handleNewSession(socket: CFWebSocket, request: Request) {
		const ip = request.headers.get("CF-Connecting-IP") ?? "";
		const path = new URL(request.url).pathname as PagePath;

		const userID = this.env.live_views_counter.idFromName(ip).toString();
		const sessionID = this.env.live_views_counter.newUniqueId().toString();

		socket.addEventListener("error", (err) => {
			throw new Error("webSocket error inside Cloudflare Worker", { cause: err });
		});
		socket.addEventListener("close", async (_event) => {
			await this.handleEndSession(sessionID, path);
		});

		socket.accept();

		this.sessions.push({ session_id: sessionID, user_id: userID, path, socket });

		await this.incrementLiveViewers(userID, path);
	}

	async fetch(request: Request) {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		await this.handleNewSession(server as unknown as CFWebSocket, request);

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

	const id = env.live_views_counter.idFromName(env.SITE_URL);
	const live_views_counter = env.live_views_counter.get(id);

	return await live_views_counter.fetch(request);
}

export default {
	fetch: handleWebSocketRequest,
};
