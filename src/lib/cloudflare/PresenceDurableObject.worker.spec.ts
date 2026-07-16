/*
Worker-runtime coverage for the global presence Durable Object. These tests use
real WebSocket upgrades in workerd so counting, hibernatable attachments, alarm
re-arming, and app-level heartbeat behavior are verified together.
*/

import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("PresenceDurableObject", () => {
	it("returns a no-store HTTP count", async () => {
		const response = await presence(uniquePresence("http")).fetch("https://example.com/");
		const body: unknown = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(getCount(body)).toBe(0);
		expect(getHunters(body)).toBe(0);
	});

	it("rejects websocket connections from disallowed origins", async () => {
		const response = await presence(uniquePresence("origin")).fetch(
			"https://example.com/?clientId=viewer-origin",
			{
				headers: { Upgrade: "websocket", Origin: "https://evil.example" },
			},
		);

		expect(response.status).toBe(403);
		expect(response.webSocket).toBe(null);
	});

	it("rejects websocket connections without a valid client id", async () => {
		const response = await presence(uniquePresence("client-id")).fetch("https://example.com/", {
			headers: { Upgrade: "websocket", Origin: "https://example.com" },
		});
		const unsafe = await presence(uniquePresence("unsafe-client-id")).fetch(
			"https://example.com/?clientId=bad%20id",
			{
				headers: { Upgrade: "websocket", Origin: "https://example.com" },
			},
		);

		expect(response.status).toBe(400);
		expect(response.webSocket).toBe(null);
		expect(unsafe.status).toBe(400);
		expect(unsafe.webSocket).toBe(null);
	});

	it("counts distinct client ids instead of raw sockets", async () => {
		const name = uniquePresence("distinct");
		const first = await openSocket(name, "same-client");
		startClientPings(first);
		await waitForCount(first, 1);

		const reconnect = await openSocket(name, "same-client");
		startClientPings(reconnect);
		await waitForCount(reconnect, 1);
		expect(await fetchCount(name)).toBe(1);

		const secondViewer = await openSocket(name, "other-client");
		startClientPings(secondViewer);
		await waitForCount(secondViewer, 2);
		expect(await fetchCount(name)).toBe(2);

		first.close();
		reconnect.close();
		secondViewer.close();
	});

	it("deduplicates hunter count by device-stable hunterId over per-tab clientId", async () => {
		const name = uniquePresence("device-hunters");
		const firstTab = await openSocket(name, "tab-alpha", true, "device-one");
		startClientPings(firstTab);
		await waitForHunters(firstTab, 1);

		const secondTab = await openSocket(name, "tab-bravo", true, "device-one");
		startClientPings(secondTab);
		await waitForHunters(secondTab, 1);

		const otherDevice = await openSocket(name, "tab-charlie", true, "device-two");
		startClientPings(otherDevice);
		await waitForHunters(otherDevice, 2);
		expect(await fetchHunters(name)).toBe(2);

		firstTab.close();
		secondTab.close();
		otherDevice.close();
	});

	it("falls back to clientId dedup when hunterId is absent", async () => {
		const name = uniquePresence("hunters");
		const viewer = await openSocket(name, "ordinary-viewer");
		startClientPings(viewer);

		const firstHunter = await openSocket(name, "hunter-one", true);
		startClientPings(firstHunter);
		await waitForHunters(firstHunter, 1);

		const duplicateHunter = await openSocket(name, "hunter-one", true);
		startClientPings(duplicateHunter);
		await waitForHunters(duplicateHunter, 1);

		const secondHunter = await openSocket(name, "hunter-two", true);
		startClientPings(secondHunter);
		await waitForHunters(secondHunter, 2);
		expect(await fetchHunters(name)).toBe(2);

		viewer.close();
		firstHunter.close();
		duplicateHunter.close();
		secondHunter.close();
	});

	it("re-arms alarms while live clients remain responsive", async () => {
		const name = uniquePresence("rearm");
		const socket = await openSocket(name, "responsive-client");
		startClientPings(socket);
		await waitForCount(socket, 1);

		await sleep(650);
		expect(await fetchCount(name)).toBe(1);

		socket.close();
		await waitForHttpCount(name, 0);
	});

	it("does not send server heartbeat messages", async () => {
		const name = uniquePresence("server-heartbeat");
		const socket = await openSocket(name, "no-server-heartbeat-client");
		const messages: string[] = [];
		socket.addEventListener("message", (event) => {
			if (typeof event.data === "string") messages.push(event.data);
		});
		await waitForCount(socket, 1);

		await sleep(650);

		expect(messages).not.toContain(JSON.stringify({ type: "ping" }));
		expect(await fetchCount(name)).toBe(0);
		socket.close();
	});

	it("reaps a ghost socket by alarm without waiting for incoming traffic", async () => {
		const name = uniquePresence("stale");
		const socket = await openSocket(name, "ghost-client");
		await waitForCount(socket, 1);

		await waitForHttpCount(name, 0);
		expect(socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED).toBe(
			true,
		);
	});
});

function presence(name: string) {
	if (!env.SITE_PRESENCE) {
		throw new Error("SITE_PRESENCE binding should be available in worker tests");
	}
	return env.SITE_PRESENCE.getByName(name);
}

async function openSocket(name: string, clientId: string, hunter = false, hunterId?: string) {
	const url = new URL("https://example.com/");
	url.searchParams.set("clientId", clientId);
	if (hunter) url.searchParams.set("hunter", "1");
	if (hunterId) url.searchParams.set("hunterId", hunterId);
	const response = await presence(name).fetch(url.toString(), {
		headers: { Upgrade: "websocket", Origin: "https://example.com" },
	});
	const socket = response.webSocket;
	if (!socket) {
		throw new Error(`Expected websocket upgrade, got ${response.status}`);
	}
	socket.accept();
	return socket;
}

function startClientPings(socket: WebSocket) {
	const timer = setInterval(() => {
		if (socket.readyState === WebSocket.OPEN) socket.send("ping");
	}, 100);
	socket.addEventListener("close", () => clearInterval(timer));
}

function waitForCount(socket: WebSocket, count: number) {
	return waitForMessage(socket, (value) => getCount(value) === count);
}

function waitForHunters(socket: WebSocket, count: number) {
	return waitForMessage(socket, (value) => getHunters(value) === count);
}

function waitForMessage(socket: WebSocket, matches: (value: unknown) => boolean) {
	return new Promise<unknown>((resolve, reject) => {
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

async function fetchCount(name: string) {
	const response = await presence(name).fetch("https://example.com/");
	const body: unknown = await response.json();
	return getCount(body);
}

async function fetchHunters(name: string) {
	const response = await presence(name).fetch("https://example.com/");
	const body: unknown = await response.json();
	return getHunters(body);
}

function waitForHttpCount(name: string, expected: number) {
	return waitForValue(
		async () => fetchCount(name),
		(value) => value === expected,
	);
}

function waitForValue<T>(read: () => Promise<T>, matches: (value: T) => boolean) {
	return new Promise<T>((resolve, reject) => {
		const startedAt = Date.now();

		async function check() {
			const value = await read();
			if (matches(value)) {
				resolve(value);
				return;
			}

			if (Date.now() - startedAt > 1_500) {
				reject(new Error("Timed out waiting for value"));
				return;
			}

			setTimeout(() => void check(), 25);
		}

		void check();
	});
}

function getCount(value: unknown) {
	if (typeof value !== "object" || value === null || !("count" in value)) {
		throw new Error("Expected count payload");
	}
	if (typeof value.count !== "number") {
		throw new Error("Expected numeric count");
	}
	return value.count;
}

function getHunters(value: unknown) {
	if (typeof value !== "object" || value === null || !("hunters" in value)) {
		throw new Error("Expected hunters payload");
	}
	if (typeof value.hunters !== "number") {
		throw new Error("Expected numeric hunters");
	}
	return value.hunters;
}

function uniquePresence(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
