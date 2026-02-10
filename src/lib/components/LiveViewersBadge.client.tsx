import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/helpers/utils";

type LiveViewersPayload = {
	type: "count";
	count: number;
};

const PING_INTERVAL_MS = 60_000;
const PING_JITTER_MAX_MS = 2_000;

function getWsUrl() {
	const url = new URL("/api/presence", window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	return url.toString();
}

export const LiveViewersBadge = ({ className }: { className?: string }) => {
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
					payload = JSON.parse(event.data) as LiveViewersPayload;
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

	return (
		<div
			className={cn(
				"text-foreground flex items-center gap-2 rounded-global border border-solid border-foreground/15 bg-background px-2 mx-4 py-1 font-mono text-xs",
				className,
			)}
			title={connected ? "Live viewers (real-time)" : "Live viewers (connecting...)"}
			aria-live="polite"
		>
			{connected ? (
				<span className="relative flex h-2 w-2">
					<span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
					<span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
				</span>
			) : (
				<span className="relative flex h-2 w-2">
					<span className="bg-foreground/30 relative inline-flex h-2 w-2 rounded-full" />
				</span>
			)}
			<span className="whitespace-nowrap">
				Live:{" "}
				<span className="text-primary">{count === null ? "..." : count.toLocaleString()}</span>
			</span>
		</div>
	);
};
