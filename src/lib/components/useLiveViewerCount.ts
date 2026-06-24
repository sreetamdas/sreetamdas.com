"use client";

import { useEffect, useRef, useState } from "react";

import { getOrCreatePresenceClientId } from "@/lib/domains/Presence/client-id";
import { PRESENCE_CLIENT_ID_PARAM, isPresenceServerMessage } from "@/lib/domains/Presence/protocol";

const CLIENT_PING_INTERVAL_MS = 25_000;
const CLIENT_SILENCE_TIMEOUT_MS = 70_000;

function getWsUrl(clientId: string) {
	const url = new URL("/api/presence", window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set(PRESENCE_CLIENT_ID_PARAM, clientId);
	return url.toString();
}

export type LiveViewers = {
	count: number | null;
	connected: boolean;
};

/**
 * Opens a single websocket to the presence Durable Object and tracks the live
 * viewer count. The Durable Object counts one stable sessionStorage client id,
 * not raw sockets, so a reconnect from the same tab does not temporarily count
 * as an extra viewer while Cloudflare finishes closing the old socket.
 */
export function useLiveViewerCount(): LiveViewers {
	const [count, setCount] = useState<number | null>(null);
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimerRef = useRef<number | null>(null);
	const pingIntervalRef = useRef<number | null>(null);
	const silenceTimerRef = useRef<number | null>(null);
	const reconnectAttemptRef = useRef(0);

	useEffect(() => {
		let cancelled = false;
		const clientId = getOrCreatePresenceClientId(window.sessionStorage);

		function clearReconnectTimer() {
			if (reconnectTimerRef.current !== null) {
				window.clearTimeout(reconnectTimerRef.current);
				reconnectTimerRef.current = null;
			}
		}

		function clearPingInterval() {
			if (pingIntervalRef.current !== null) {
				window.clearInterval(pingIntervalRef.current);
				pingIntervalRef.current = null;
			}
		}

		function clearSilenceTimer() {
			if (silenceTimerRef.current !== null) {
				window.clearTimeout(silenceTimerRef.current);
				silenceTimerRef.current = null;
			}
		}

		function send(ws: WebSocket, message: string) {
			if (ws.readyState !== WebSocket.OPEN) return false;
			try {
				ws.send(message);
				return true;
			} catch {
				return false;
			}
		}

		function closeCurrent(reason = "presence reconnect") {
			const current = wsRef.current;
			wsRef.current = null;
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
			if (cancelled) return;
			clearReconnectTimer();
			const attempt = reconnectAttemptRef.current;
			const delayMs = Math.min(10_000, 250 * 2 ** attempt);
			reconnectAttemptRef.current = Math.min(attempt + 1, 6);
			reconnectTimerRef.current = window.setTimeout(connect, delayMs);
		}

		function handleSilence(ws: WebSocket) {
			if (cancelled || wsRef.current !== ws) return;
			setConnected(false);
			closeCurrent("presence heartbeat timeout");
			scheduleReconnect();
		}

		function markServerMessage(ws: WebSocket) {
			clearSilenceTimer();
			silenceTimerRef.current = window.setTimeout(
				() => handleSilence(ws),
				CLIENT_SILENCE_TIMEOUT_MS,
			);
		}

		function startClientHeartbeat(ws: WebSocket) {
			clearPingInterval();
			clearSilenceTimer();
			markServerMessage(ws);
			pingIntervalRef.current = window.setInterval(() => {
				if (!send(ws, "ping")) {
					handleSilence(ws);
				}
			}, CLIENT_PING_INTERVAL_MS);
		}

		function connect() {
			if (cancelled) return;
			closeCurrent();

			let ws: WebSocket;
			try {
				ws = new WebSocket(getWsUrl(clientId));
			} catch {
				scheduleReconnect();
				return;
			}

			wsRef.current = ws;

			ws.onopen = () => {
				if (cancelled || wsRef.current !== ws) return;
				reconnectAttemptRef.current = 0;
				setConnected(true);
				startClientHeartbeat(ws);
			};

			ws.onmessage = (event) => {
				if (cancelled || wsRef.current !== ws) return;
				if (typeof event.data !== "string") return;

				if (event.data === "pong") {
					markServerMessage(ws);
					return;
				}

				let parsed: unknown;
				try {
					parsed = JSON.parse(event.data);
				} catch {
					return;
				}

				if (!isPresenceServerMessage(parsed)) return;
				markServerMessage(ws);

				setCount(parsed.count);
			};

			ws.onclose = () => {
				if (cancelled || wsRef.current !== ws) return;
				setConnected(false);
				clearPingInterval();
				clearSilenceTimer();
				scheduleReconnect();
			};

			ws.onerror = () => {
				if (cancelled || wsRef.current !== ws) return;
				setConnected(false);
				closeCurrent("presence websocket error");
				scheduleReconnect();
			};
		}

		connect();

		return () => {
			cancelled = true;
			clearReconnectTimer();
			closeCurrent("presence hook cleanup");
		};
	}, []);

	return { count, connected };
}
