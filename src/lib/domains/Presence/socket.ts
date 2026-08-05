"use client";

import {
	PRESENCE_CLIENT_ID_PARAM,
	PRESENCE_HUNTER_ID_PARAM,
	PRESENCE_HUNTER_PARAM,
	type PresenceServerMessage,
	isPresenceServerMessage,
} from "./protocol";

/** SessionStorage key that overrides the presence room (see getPresenceWsUrl). */
export const PRESENCE_ROOM_OVERRIDE_KEY = "presence-room";

const CLIENT_PING_INTERVAL_MS = 25_000;
const CLIENT_SILENCE_TIMEOUT_MS = 70_000;

export function getPresenceWsUrl(clientId: string, hunterId?: string | null) {
	const url = new URL("/api/presence", window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set(PRESENCE_CLIENT_ID_PARAM, clientId);
	// Presence can be namespaced into a scoped room for isolated consumers
	// (for example parallel e2e workers); real visitors never set this.
	const roomOverride = window.sessionStorage.getItem(PRESENCE_ROOM_OVERRIDE_KEY);
	if (roomOverride) url.searchParams.set("room", roomOverride);
	if (hunterId !== undefined) {
		url.searchParams.set(PRESENCE_HUNTER_PARAM, "1");
		if (hunterId) url.searchParams.set(PRESENCE_HUNTER_ID_PARAM, hunterId);
	}
	return url.toString();
}

type PresenceSocketOptions = {
	/** When this returns false the engine stops reconnecting and ignores late socket events. */
	isActive: () => boolean;
	getUrl: () => string;
	onConnected: (connected: boolean) => void;
	onMessage: (message: PresenceServerMessage) => void;
};

/**
 * Connection engine for the presence Durable Object: one websocket with
 * exponential-backoff reconnects, a client ping heartbeat, and a silence
 * timeout that recycles sockets the server has stopped answering.
 */
export function createPresenceSocket({
	isActive,
	getUrl,
	onConnected,
	onMessage,
}: PresenceSocketOptions) {
	let ws: WebSocket | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let pingInterval: ReturnType<typeof setInterval> | null = null;
	let silenceTimer: ReturnType<typeof setTimeout> | null = null;
	let reconnectAttempt = 0;

	function clearReconnectTimer() {
		if (reconnectTimer !== null) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	}

	function clearPingInterval() {
		if (pingInterval !== null) {
			clearInterval(pingInterval);
			pingInterval = null;
		}
	}

	function clearSilenceTimer() {
		if (silenceTimer !== null) {
			clearTimeout(silenceTimer);
			silenceTimer = null;
		}
	}

	function send(socket: WebSocket, message: string) {
		if (socket.readyState !== WebSocket.OPEN) return false;
		try {
			socket.send(message);
			return true;
		} catch {
			return false;
		}
	}

	function closeCurrent(reason = "presence reconnect") {
		const current = ws;
		ws = null;
		clearPingInterval();
		clearSilenceTimer();
		if (current) {
			try {
				current.close(1000, reason);
			} catch {
				// noop
			}
		}
	}

	function scheduleReconnect() {
		clearReconnectTimer();
		if (!isActive()) return;
		const delayMs = Math.min(10_000, 250 * 2 ** reconnectAttempt);
		reconnectAttempt = Math.min(reconnectAttempt + 1, 6);
		reconnectTimer = setTimeout(connect, delayMs);
	}

	function handleSilence(socket: WebSocket) {
		if (ws !== socket || !isActive()) return;
		onConnected(false);
		closeCurrent("presence heartbeat timeout");
		scheduleReconnect();
	}

	function markServerMessage(socket: WebSocket) {
		clearSilenceTimer();
		silenceTimer = setTimeout(() => handleSilence(socket), CLIENT_SILENCE_TIMEOUT_MS);
	}

	function startClientHeartbeat(socket: WebSocket) {
		clearPingInterval();
		clearSilenceTimer();
		markServerMessage(socket);
		pingInterval = setInterval(() => {
			if (!send(socket, "ping")) handleSilence(socket);
		}, CLIENT_PING_INTERVAL_MS);
	}

	function connect() {
		clearReconnectTimer();
		if (!isActive()) return;
		closeCurrent();

		let socket: WebSocket;
		try {
			socket = new WebSocket(getUrl());
		} catch {
			scheduleReconnect();
			return;
		}

		ws = socket;

		socket.onopen = () => {
			if (ws !== socket || !isActive()) return;
			reconnectAttempt = 0;
			onConnected(true);
			startClientHeartbeat(socket);
		};

		socket.onmessage = (event) => {
			if (ws !== socket || !isActive()) return;
			if (typeof event.data !== "string") return;

			if (event.data === "pong") {
				markServerMessage(socket);
				return;
			}

			let parsed: unknown;
			try {
				parsed = JSON.parse(event.data);
			} catch {
				return;
			}

			if (!isPresenceServerMessage(parsed)) return;
			markServerMessage(socket);
			onMessage(parsed);
		};

		socket.onclose = () => {
			if (ws !== socket) return;
			onConnected(false);
			clearPingInterval();
			clearSilenceTimer();
			scheduleReconnect();
		};

		socket.onerror = () => {
			if (ws !== socket) return;
			onConnected(false);
			closeCurrent("presence websocket error");
			scheduleReconnect();
		};
	}

	function shutdown(reason?: string) {
		clearReconnectTimer();
		closeCurrent(reason);
		reconnectAttempt = 0;
	}

	function hasLiveSocket() {
		return ws !== null && ws.readyState <= WebSocket.OPEN;
	}

	return { connect, shutdown, hasLiveSocket };
}
