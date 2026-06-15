"use client";

import { useEffect, useRef, useState } from "react";

type LiveViewersPayload = {
	type: "count";
	count: number;
};

function isLiveViewersPayload(value: unknown): value is LiveViewersPayload {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("type" in value) || !("count" in value)) {
		return false;
	}

	return value.type === "count" && typeof value.count === "number";
}

const PING_INTERVAL_MS = 60_000;
const PING_JITTER_MAX_MS = 2_000;

function getWsUrl() {
	const url = new URL("/api/presence", window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	return url.toString();
}

export type LiveViewers = {
	count: number | null;
	connected: boolean;
};

/**
 * Opens a single websocket to the presence Durable Object and tracks the live
 * viewer count. Mount this in exactly one place per page — each consumer opens
 * its own connection, which the DO counts as a separate viewer.
 */
export function useLiveViewerCount(): LiveViewers {
	const [count, setCount] = useState<number | null>(null);
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimerRef = useRef<number | null>(null);
	const pingTimeoutRef = useRef<number | null>(null);
	const pingJitterMsRef = useRef<number | null>(null);
	const reconnectAttemptRef = useRef(0);

	useEffect(() => {
		let cancelled = false;

		function clearReconnectTimer() {
			if (reconnectTimerRef.current !== null) {
				window.clearTimeout(reconnectTimerRef.current);
				reconnectTimerRef.current = null;
			}
		}

		function clearPingTimer() {
			if (pingTimeoutRef.current !== null) {
				window.clearTimeout(pingTimeoutRef.current);
				pingTimeoutRef.current = null;
			}
		}

		function startUtcAlignedPings(ws: WebSocket, intervalMs: number) {
			clearPingTimer();

			if (pingJitterMsRef.current === null) {
				const jitterArray = new Uint32Array(1);
				crypto.getRandomValues(jitterArray);
				pingJitterMsRef.current = jitterArray[0] % PING_JITTER_MAX_MS;
			}
			const jitterMs = pingJitterMsRef.current;

			const scheduleNext = () => {
				const now = Date.now();
				const base = (Math.floor(now / intervalMs) + 1) * intervalMs;
				let next = base + jitterMs;
				if (next <= now) next += intervalMs;

				pingTimeoutRef.current = window.setTimeout(() => {
					try {
						ws.send("ping");
					} catch {
						// noop
					}
					scheduleNext();
				}, next - now);
			};

			scheduleNext();
		}

		function closeCurrent() {
			const current = wsRef.current;
			wsRef.current = null;
			clearPingTimer();
			if (current) {
				try {
					current.close();
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

		function connect() {
			if (cancelled) return;
			closeCurrent();
			pingJitterMsRef.current = null;

			let ws: WebSocket;
			try {
				ws = new WebSocket(getWsUrl());
			} catch {
				scheduleReconnect();
				return;
			}

			wsRef.current = ws;

			ws.onopen = () => {
				if (cancelled) return;
				reconnectAttemptRef.current = 0;
				setConnected(true);
				startUtcAlignedPings(ws, PING_INTERVAL_MS);
			};

			ws.onmessage = (event) => {
				if (cancelled) return;
				if (typeof event.data !== "string") return;
				let payload: LiveViewersPayload;
				try {
					const parsed: unknown = JSON.parse(event.data);
					if (!isLiveViewersPayload(parsed)) return;
					payload = parsed;
				} catch {
					return;
				}
				if (payload.type === "count" && Number.isFinite(payload.count)) {
					setCount(payload.count);
				}
			};

			ws.onclose = () => {
				if (cancelled) return;
				setConnected(false);
				clearPingTimer();
				scheduleReconnect();
			};

			ws.onerror = () => {
				if (cancelled) return;
				setConnected(false);
				clearPingTimer();
				try {
					ws.close();
				} catch {
					// noop
				}
			};
		}

		connect();

		return () => {
			cancelled = true;
			clearReconnectTimer();
			clearPingTimer();
			closeCurrent();
		};
	}, []);

	return { count, connected };
}
