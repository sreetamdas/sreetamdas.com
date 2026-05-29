import { DurableObject } from "cloudflare:workers";

type SlideRole = "master" | "viewer";

type SlidePosition = {
	slide: number;
	step: number;
	updatedAt: number;
};

type PollRecord = {
	id: string;
	question: string;
	options: Array<{ id: string; label: string }>;
	open: boolean;
	slide: number | null;
	voters: Record<string, string>;
	createdAt: number;
};

type PublicPoll = {
	id: string;
	question: string;
	open: boolean;
	slide: number | null;
	selectedOptionId: string | null;
	options: Array<{ id: string; label: string; votes: number }>;
};

type SessionSnapshot = {
	type: "snapshot";
	position: SlidePosition;
	poll: PublicPoll | null;
	viewers: number;
	masters: number;
};

type ConnectionAttachment = {
	role: SlideRole;
	clientId: string;
};

const POSITION_KEY = "position";
const POLL_KEY = "poll";
const DEFAULT_POSITION: SlidePosition = { slide: 0, step: 0, updatedAt: 0 };
const MAX_POLL_OPTIONS = 6;

export class SlideSessionDurableObject extends DurableObject<CloudflareEnv> {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (request.method === "GET" && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
			return this.handleWebSocket(request, url);
		}

		if (request.method === "GET") {
			return Response.json(
				await this.getSnapshot(parseOptionalClientId(url.searchParams.get("client"))),
				{
					headers: { "Cache-Control": "no-store" },
				},
			);
		}

		return new Response("Method Not Allowed", { status: 405 });
	}

	private handleWebSocket(request: Request, url: URL): Response {
		if (!this.isAllowedOrigin(request)) {
			return new Response("Forbidden", { status: 403 });
		}

		const pair = new WebSocketPair();
		const { 0: client, 1: server } = pair;
		const role = parseRole(url.searchParams.get("role"));
		const clientId = parseClientId(url.searchParams.get("client"));

		this.ctx.acceptWebSocket(server, [role]);
		server.serializeAttachment({ role, clientId } satisfies ConnectionAttachment);
		void this.sendSnapshot(server);
		void this.broadcastSnapshot();

		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		if (typeof message !== "string") return;
		if (message === "ping") return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(message);
		} catch {
			return;
		}

		const attachment = parseAttachment(ws.deserializeAttachment());
		if (!attachment) return;

		if (isSetSlideMessage(parsed)) {
			if (attachment.role !== "master") return;
			await this.setPosition(parsed.slide, parsed.step);
			await this.broadcastSnapshot();
			return;
		}

		if (isCreatePollMessage(parsed)) {
			if (attachment.role !== "master") return;
			await this.createPoll(parsed.question, parsed.options, parsed.slide);
			await this.broadcastSnapshot();
			return;
		}

		if (isVoteMessage(parsed)) {
			await this.vote(attachment.clientId, parsed.pollId, parsed.optionId);
			await this.broadcastSnapshot();
			return;
		}

		if (isClosePollMessage(parsed)) {
			if (attachment.role !== "master") return;
			await this.closePoll();
			await this.broadcastSnapshot();
			return;
		}

		if (isResetPollMessage(parsed)) {
			if (attachment.role !== "master") return;
			await this.ctx.storage.delete(POLL_KEY);
			await this.broadcastSnapshot();
			return;
		}

		if (isReactionMessage(parsed)) {
			await this.broadcastReaction(parsed.emoji);
		}
	}

	webSocketClose() {
		void this.broadcastSnapshot();
	}

	webSocketError() {
		void this.broadcastSnapshot();
	}

	private async getSnapshot(clientId?: string): Promise<SessionSnapshot> {
		const position = (await this.ctx.storage.get<SlidePosition>(POSITION_KEY)) ?? DEFAULT_POSITION;
		const poll = await this.ctx.storage.get<PollRecord>(POLL_KEY);
		const { viewers, masters } = this.getConnectionCounts();
		return {
			type: "snapshot",
			position,
			poll: poll ? toPublicPoll(poll, clientId) : null,
			viewers,
			masters,
		};
	}

	private async sendSnapshot(ws: WebSocket) {
		try {
			const attachment = parseAttachment(ws.deserializeAttachment());
			ws.send(JSON.stringify(await this.getSnapshot(attachment?.clientId)));
		} catch {
			// noop
		}
	}

	private async broadcastSnapshot() {
		for (const ws of this.ctx.getWebSockets()) {
			try {
				const attachment = parseAttachment(ws.deserializeAttachment());
				const payload = JSON.stringify(await this.getSnapshot(attachment?.clientId));
				ws.send(payload);
			} catch {
				// noop
			}
		}
	}

	private broadcastReaction(emoji: string) {
		const payload = JSON.stringify({
			type: "reaction",
			id: crypto.randomUUID(),
			emoji,
			createdAt: Date.now(),
		});
		for (const ws of this.ctx.getWebSockets("master")) {
			try {
				ws.send(payload);
			} catch {
				// noop
			}
		}
	}

	private async setPosition(slide: number, step: number) {
		await this.ctx.storage.put(POSITION_KEY, {
			slide: normalizeIndex(slide),
			step: normalizeIndex(step),
			updatedAt: Date.now(),
		} satisfies SlidePosition);
	}

	private async createPoll(
		question: string,
		options: Array<string>,
		slide: number | null | undefined,
	) {
		const cleanQuestion = question.trim();
		const cleanOptions = options
			.map((option) => option.trim())
			.filter((option) => option.length > 0);
		if (!cleanQuestion || cleanOptions.length < 2) return;

		const poll: PollRecord = {
			id: crypto.randomUUID(),
			question: cleanQuestion,
			options: cleanOptions.slice(0, MAX_POLL_OPTIONS).map((label, index) => ({
				id: String(index),
				label,
			})),
			open: true,
			slide: normalizeSlideScope(slide),
			voters: {},
			createdAt: Date.now(),
		};
		await this.ctx.storage.put(POLL_KEY, poll);
	}

	private async vote(clientId: string, pollId: string, optionId: string) {
		const poll = await this.ctx.storage.get<PollRecord>(POLL_KEY);
		if (!poll || !poll.open || poll.id !== pollId) return;
		if (!poll.options.some((option) => option.id === optionId)) return;

		await this.ctx.storage.put(POLL_KEY, {
			...poll,
			voters: { ...poll.voters, [clientId]: optionId },
		} satisfies PollRecord);
	}

	private async closePoll() {
		const poll = await this.ctx.storage.get<PollRecord>(POLL_KEY);
		if (!poll) return;
		await this.ctx.storage.put(POLL_KEY, { ...poll, open: false } satisfies PollRecord);
	}

	private getConnectionCounts() {
		let viewers = 0;
		let masters = 0;
		for (const ws of this.ctx.getWebSockets()) {
			const attachment = parseAttachment(ws.deserializeAttachment());
			if (attachment?.role === "master") masters += 1;
			if (attachment?.role === "viewer") viewers += 1;
		}
		return { viewers, masters };
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
		if (originUrl.hostname === reqUrl.hostname) return true;
		if (originUrl.hostname === "sreetamdas.com" || originUrl.hostname === "www.sreetamdas.com") {
			return true;
		}
		return originUrl.hostname.endsWith(".workers.dev") && reqUrl.hostname.endsWith(".workers.dev");
	}
}

function parseRole(value: string | null): SlideRole {
	return value === "master" ? "master" : "viewer";
}

function parseClientId(value: string | null): string {
	if (value && /^[a-zA-Z0-9_-]{8,80}$/.test(value)) {
		return value;
	}
	return crypto.randomUUID();
}

function parseOptionalClientId(value: string | null): string | undefined {
	if (value && /^[a-zA-Z0-9_-]{8,80}$/.test(value)) {
		return value;
	}
	return undefined;
}

function parseAttachment(value: unknown): ConnectionAttachment | null {
	if (typeof value !== "object" || value === null) return null;
	if (!("role" in value) || !("clientId" in value)) return null;
	if ((value.role !== "master" && value.role !== "viewer") || typeof value.clientId !== "string") {
		return null;
	}
	return { role: value.role, clientId: value.clientId };
}

function normalizeIndex(value: number): number {
	if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) return 0;
	return value;
}

function normalizeSlideScope(value: number | null | undefined): number | null {
	if (value === null || value === undefined) return null;
	return normalizeIndex(value);
}

function toPublicPoll(poll: PollRecord, clientId?: string): PublicPoll {
	return {
		id: poll.id,
		question: poll.question,
		open: poll.open,
		slide: poll.slide,
		selectedOptionId: clientId ? (poll.voters[clientId] ?? null) : null,
		options: poll.options.map((option) => ({
			...option,
			votes: Object.values(poll.voters).filter((vote) => vote === option.id).length,
		})),
	};
}

function isSetSlideMessage(
	value: unknown,
): value is { type: "set-slide"; slide: number; step: number } {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "set-slide" &&
		"slide" in value &&
		"step" in value &&
		typeof value.slide === "number" &&
		typeof value.step === "number"
	);
}

function isCreatePollMessage(value: unknown): value is {
	type: "create-poll";
	question: string;
	options: Array<string>;
	slide?: number | null;
} {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "create-poll" &&
		"question" in value &&
		"options" in value &&
		typeof value.question === "string" &&
		Array.isArray(value.options) &&
		value.options.every((option) => typeof option === "string") &&
		(!("slide" in value) ||
			value.slide === null ||
			(typeof value.slide === "number" &&
				Number.isFinite(value.slide) &&
				Number.isInteger(value.slide) &&
				value.slide >= 0))
	);
}

function isVoteMessage(
	value: unknown,
): value is { type: "vote"; pollId: string; optionId: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "vote" &&
		"pollId" in value &&
		"optionId" in value &&
		typeof value.pollId === "string" &&
		typeof value.optionId === "string"
	);
}

function isClosePollMessage(value: unknown): value is { type: "close-poll" } {
	return (
		typeof value === "object" && value !== null && "type" in value && value.type === "close-poll"
	);
}

function isResetPollMessage(value: unknown): value is { type: "reset-poll" } {
	return (
		typeof value === "object" && value !== null && "type" in value && value.type === "reset-poll"
	);
}

function isReactionMessage(value: unknown): value is { type: "reaction"; emoji: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "reaction" &&
		"emoji" in value &&
		typeof value.emoji === "string" &&
		REACTION_EMOJIS.includes(value.emoji)
	);
}

const REACTION_EMOJIS = ["👍", "👏", "😂", "🤯", "❤️"];
