/*
Worker-runtime coverage for the slide session Durable Object. These tests exercise
real WebSocket upgrades, role authorization, slide-scoped polls, vote de-duping,
and viewer reactions inside workerd.
*/

import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

type Snapshot = {
	type: "snapshot";
	position: {
		slide: number;
		step: number;
		updatedAt: number;
	};
	poll: {
		id: string;
		question: string;
		open: boolean;
		slide: number | null;
		selectedOptionId: string | null;
		options: Array<{ id: string; label: string; votes: number }>;
	} | null;
	viewers: number;
	masters: number;
};

type Reaction = {
	type: "reaction";
	id: string;
	emoji: string;
	createdAt: number;
};

describe("SlideSessionDurableObject", () => {
	it("returns a no-store default snapshot over HTTP", async () => {
		const response = await slideSession("http-default").fetch("https://example.com/");
		const body: unknown = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(isSnapshot(body)).toBe(true);
		if (isSnapshot(body)) {
			expect(body.position).toMatchObject({ slide: 0, step: 0 });
			expect(body.poll).toBe(null);
		}
	});

	it("lets masters move slides but ignores viewer navigation attempts", async () => {
		const session = uniqueSession("nav");
		const master = await openSocket(session, "master", "master-nav");
		const viewer = await openSocket(session, "viewer", "viewer-nav");

		master.send(JSON.stringify({ type: "set-slide", slide: 3, step: 1 }));
		const moved = await waitForSnapshot(
			viewer,
			(snapshot) => snapshot.position.slide === 3 && snapshot.position.step === 1,
		);
		expect(moved.position.slide).toBe(3);
		expect(moved.position.step).toBe(1);

		viewer.send(JSON.stringify({ type: "set-slide", slide: 9, step: 0 }));
		await sleep(50);
		const response = await slideSession(session).fetch("https://example.com/");
		const body: unknown = await response.json();

		expect(isSnapshot(body)).toBe(true);
		if (isSnapshot(body)) {
			expect(body.position.slide).toBe(3);
			expect(body.position.step).toBe(1);
		}

		master.close();
		viewer.close();
	});

	it("supports slide-scoped polls, deduped votes, close, and reset", async () => {
		const session = uniqueSession("poll");
		const master = await openSocket(session, "master", "master-poll");
		const viewerA = await openSocket(session, "viewer", "viewer-a");
		const viewerB = await openSocket(session, "viewer", "viewer-b");

		master.send(
			JSON.stringify({
				type: "create-poll",
				question: "Which runtime wins?",
				options: ["Cloudflare", "Node"],
				slide: 4,
			}),
		);
		const created = await waitForSnapshot(master, (snapshot) => snapshot.poll?.slide === 4);
		expect(created.poll?.question).toBe("Which runtime wins?");
		expect(created.poll?.options.map((option) => option.label)).toEqual(["Cloudflare", "Node"]);

		if (!created.poll) throw new Error("poll should exist after create-poll");
		viewerA.send(JSON.stringify({ type: "vote", pollId: created.poll.id, optionId: "0" }));
		viewerA.send(JSON.stringify({ type: "vote", pollId: created.poll.id, optionId: "0" }));
		viewerB.send(JSON.stringify({ type: "vote", pollId: created.poll.id, optionId: "1" }));

		const voted = await waitForSnapshot(master, (snapshot) => {
			const options = snapshot.poll?.options;
			return options?.[0]?.votes === 1 && options?.[1]?.votes === 1;
		});
		expect(voted.poll?.options).toMatchObject([
			{ id: "0", votes: 1 },
			{ id: "1", votes: 1 },
		]);
		expect(voted.poll?.selectedOptionId).toBe(null);

		const viewerAHttpResponse = await slideSession(session).fetch(
			"https://example.com/?client=viewer-a",
		);
		const viewerBHttpResponse = await slideSession(session).fetch(
			"https://example.com/?client=viewer-b",
		);
		const viewerAHttp: unknown = await viewerAHttpResponse.json();
		const viewerBHttp: unknown = await viewerBHttpResponse.json();
		expect(isSnapshot(viewerAHttp)).toBe(true);
		if (isSnapshot(viewerAHttp)) {
			expect(viewerAHttp.poll?.selectedOptionId).toBe("0");
		}
		expect(isSnapshot(viewerBHttp)).toBe(true);
		if (isSnapshot(viewerBHttp)) {
			expect(viewerBHttp.poll?.selectedOptionId).toBe("1");
		}

		master.send(JSON.stringify({ type: "close-poll" }));
		const closed = await waitForSnapshot(viewerA, (snapshot) => snapshot.poll?.open === false);
		expect(closed.poll?.open).toBe(false);

		master.send(JSON.stringify({ type: "reset-poll" }));
		const reset = await waitForSnapshot(viewerB, (snapshot) => snapshot.poll === null);
		expect(reset.poll).toBe(null);

		master.close();
		viewerA.close();
		viewerB.close();
	});

	it("broadcasts viewer reactions to presenter sockets", async () => {
		const session = uniqueSession("reaction");
		const master = await openSocket(session, "master", "master-reaction");
		const viewer = await openSocket(session, "viewer", "viewer-reaction");

		viewer.send(JSON.stringify({ type: "reaction", emoji: "👏" }));
		const reaction = await waitForReaction(master);

		expect(reaction.emoji).toBe("👏");
		expect(reaction.id).not.toBe("");
		expect(reaction.createdAt).toBeGreaterThan(0);

		master.close();
		viewer.close();
	});
});

function slideSession(name: string) {
	if (!env.SLIDE_SESSIONS) {
		throw new Error("SLIDE_SESSIONS binding should be available in worker tests");
	}
	return env.SLIDE_SESSIONS.getByName(name);
}

async function openSocket(session: string, role: "master" | "viewer", client: string) {
	const url = new URL("https://example.com/");
	url.searchParams.set("role", role);
	url.searchParams.set("client", client);
	const response = await slideSession(session).fetch(url.toString(), {
		headers: { Upgrade: "websocket", Origin: "https://example.com" },
	});
	const socket = response.webSocket;
	if (!socket) {
		throw new Error(`Expected websocket upgrade, got ${response.status}`);
	}
	socket.accept();
	return socket;
}

function waitForSnapshot(socket: WebSocket, matches: (snapshot: Snapshot) => boolean) {
	return waitForMessage(socket, (value): value is Snapshot => isSnapshot(value) && matches(value));
}

function waitForReaction(socket: WebSocket) {
	return waitForMessage(socket, isReaction);
}

function waitForMessage<T>(socket: WebSocket, matches: (value: unknown) => value is T) {
	return new Promise<T>((resolve, reject) => {
		const timeout = setTimeout(() => {
			socket.removeEventListener("message", handleMessage);
			reject(new Error("Timed out waiting for websocket message"));
		}, 1_000);

		function handleMessage(event: MessageEvent) {
			if (typeof event.data !== "string") return;
			let parsed: unknown;
			try {
				parsed = JSON.parse(event.data);
			} catch {
				return;
			}
			if (!matches(parsed)) return;
			clearTimeout(timeout);
			socket.removeEventListener("message", handleMessage);
			resolve(parsed);
		}

		socket.addEventListener("message", handleMessage);
	});
}

function isSnapshot(value: unknown): value is Snapshot {
	if (typeof value !== "object" || value === null) return false;
	if (!("type" in value) || value.type !== "snapshot") return false;
	if (!("position" in value) || !isPosition(value.position)) return false;
	if (!("poll" in value) || (value.poll !== null && !isPoll(value.poll))) return false;
	return (
		"viewers" in value &&
		"masters" in value &&
		typeof value.viewers === "number" &&
		typeof value.masters === "number"
	);
}

function isPosition(value: unknown): value is Snapshot["position"] {
	return (
		typeof value === "object" &&
		value !== null &&
		"slide" in value &&
		"step" in value &&
		"updatedAt" in value &&
		typeof value.slide === "number" &&
		typeof value.step === "number" &&
		typeof value.updatedAt === "number"
	);
}

function isPoll(value: unknown): value is NonNullable<Snapshot["poll"]> {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"question" in value &&
		"open" in value &&
		"slide" in value &&
		"selectedOptionId" in value &&
		"options" in value &&
		typeof value.id === "string" &&
		typeof value.question === "string" &&
		typeof value.open === "boolean" &&
		(value.slide === null || typeof value.slide === "number") &&
		(value.selectedOptionId === null || typeof value.selectedOptionId === "string") &&
		Array.isArray(value.options) &&
		value.options.every(isPollOption)
	);
}

function isPollOption(value: unknown): value is NonNullable<Snapshot["poll"]>["options"][number] {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"label" in value &&
		"votes" in value &&
		typeof value.id === "string" &&
		typeof value.label === "string" &&
		typeof value.votes === "number"
	);
}

function isReaction(value: unknown): value is Reaction {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "reaction" &&
		"id" in value &&
		"emoji" in value &&
		"createdAt" in value &&
		typeof value.id === "string" &&
		typeof value.emoji === "string" &&
		typeof value.createdAt === "number"
	);
}

function uniqueSession(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
