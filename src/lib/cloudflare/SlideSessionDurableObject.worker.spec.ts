/*
Worker-runtime coverage for the slide session Durable Object. These tests exercise
real WebSocket upgrades, role authorization, slide-scoped polls, vote de-duping,
and viewer reactions inside workerd.
*/

import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import {
	isSlideSessionReaction,
	isSlideSessionSnapshot,
	type SlideSessionSnapshot,
} from "@/lib/domains/slides/live-session-protocol";

describe("SlideSessionDurableObject", () => {
	it("returns a no-store default snapshot over HTTP", async () => {
		const response = await slideSession("http-default").fetch("https://example.com/");
		const body: unknown = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(isSlideSessionSnapshot(body)).toBe(true);
		if (isSlideSessionSnapshot(body)) {
			expect(body.position).toMatchObject({ slide: 0, step: 0 });
			expect(body.poll).toBe(null);
		}
	});

	it("rejects websocket connections from disallowed origins", async () => {
		const session = uniqueSession("origin");
		const response = await slideSession(session).fetch("https://example.com/", {
			headers: { Upgrade: "websocket", Origin: "https://evil.example" },
		});

		expect(response.status).toBe(403);
		expect(response.webSocket).toBe(null);
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

		expect(isSlideSessionSnapshot(body)).toBe(true);
		if (isSlideSessionSnapshot(body)) {
			expect(body.position.slide).toBe(3);
			expect(body.position.step).toBe(1);
		}

		master.close();
		viewer.close();
	});

	it("does not trust a client role query without the server role header", async () => {
		const session = uniqueSession("forged-master");
		const forgedMaster = await openSocketWithoutTrustedRole(session, "master", "forged-master");
		const viewer = await openSocket(session, "viewer", "viewer-forged-master");

		forgedMaster.send(JSON.stringify({ type: "set-slide", slide: 7, step: 0 }));
		await sleep(50);
		const response = await slideSession(session).fetch("https://example.com/");
		const body: unknown = await response.json();

		expect(isSlideSessionSnapshot(body)).toBe(true);
		if (isSlideSessionSnapshot(body)) {
			expect(body.position.slide).toBe(0);
			expect(body.position.step).toBe(0);
		}

		forgedMaster.close();
		viewer.close();
	});

	it("treats invalid trusted role headers as viewers", async () => {
		const session = uniqueSession("invalid-role-header");
		const forgedMaster = await openSocketWithTrustedRoleHeader(
			session,
			"master",
			"forged-invalid-header",
			"admin",
		);

		forgedMaster.send(JSON.stringify({ type: "set-slide", slide: 5, step: 2 }));
		await sleep(50);
		const response = await slideSession(session).fetch("https://example.com/");
		const body: unknown = await response.json();

		expect(isSlideSessionSnapshot(body)).toBe(true);
		if (isSlideSessionSnapshot(body)) {
			expect(body.position.slide).toBe(0);
			expect(body.position.step).toBe(0);
			expect(body.viewers).toBe(1);
			expect(body.masters).toBe(0);
		}

		forgedMaster.close();
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
		expect(isSlideSessionSnapshot(viewerAHttp)).toBe(true);
		if (isSlideSessionSnapshot(viewerAHttp)) {
			expect(viewerAHttp.poll?.selectedOptionId).toBe("0");
		}
		expect(isSlideSessionSnapshot(viewerBHttp)).toBe(true);
		if (isSlideSessionSnapshot(viewerBHttp)) {
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

	it("ignores viewer attempts to create or close polls", async () => {
		const session = uniqueSession("viewer-poll");
		const master = await openSocket(session, "master", "master-viewer-poll");
		const viewer = await openSocket(session, "viewer", "viewer-viewer-poll");

		viewer.send(JSON.stringify({ type: "create-poll", question: "hijack?", options: ["a", "b"] }));
		await sleep(50);
		const afterCreate = await slideSession(session).fetch("https://example.com/");
		const afterCreateBody: unknown = await afterCreate.json();
		expect(isSlideSessionSnapshot(afterCreateBody)).toBe(true);
		if (isSlideSessionSnapshot(afterCreateBody)) {
			expect(afterCreateBody.poll).toBe(null);
		}

		master.send(
			JSON.stringify({
				type: "create-poll",
				question: "Which runtime wins?",
				options: ["Cloudflare", "Node"],
			}),
		);
		await waitForSnapshot(master, (snapshot) => snapshot.poll?.open === true);

		viewer.send(JSON.stringify({ type: "close-poll" }));
		await sleep(50);
		const afterClose = await slideSession(session).fetch("https://example.com/");
		const afterCloseBody: unknown = await afterClose.json();
		expect(isSlideSessionSnapshot(afterCloseBody)).toBe(true);
		if (isSlideSessionSnapshot(afterCloseBody)) {
			expect(afterCloseBody.poll?.open).toBe(true);
		}

		master.close();
		viewer.close();
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
	const headers = new Headers({ Upgrade: "websocket", Origin: "https://example.com" });
	if (role === "master") {
		headers.set("x-sreetamdas-slide-role", "master");
	}
	const response = await slideSession(session).fetch(url.toString(), { headers });
	const socket = response.webSocket;
	if (!socket) {
		throw new Error(`Expected websocket upgrade, got ${response.status}`);
	}
	socket.accept();
	return socket;
}

async function openSocketWithoutTrustedRole(
	session: string,
	role: "master" | "viewer",
	client: string,
) {
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

async function openSocketWithTrustedRoleHeader(
	session: string,
	role: "master" | "viewer",
	client: string,
	trustedRoleHeader: string,
) {
	const url = new URL("https://example.com/");
	url.searchParams.set("role", role);
	url.searchParams.set("client", client);
	const response = await slideSession(session).fetch(url.toString(), {
		headers: {
			Upgrade: "websocket",
			Origin: "https://example.com",
			"x-sreetamdas-slide-role": trustedRoleHeader,
		},
	});
	const socket = response.webSocket;
	if (!socket) {
		throw new Error(`Expected websocket upgrade, got ${response.status}`);
	}
	socket.accept();
	return socket;
}

function waitForSnapshot(socket: WebSocket, matches: (snapshot: SlideSessionSnapshot) => boolean) {
	return waitForMessage(
		socket,
		(value): value is SlideSessionSnapshot => isSlideSessionSnapshot(value) && matches(value),
	);
}

function waitForReaction(socket: WebSocket) {
	return waitForMessage(socket, isSlideSessionReaction);
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

function uniqueSession(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
