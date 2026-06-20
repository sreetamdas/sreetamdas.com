"use client";

/**
 * Transport for live slide sessions: opens the Durable Object WebSocket for a
 * `live` room, keeps it alive with pings and exponential-backoff reconnects,
 * mirrors the presenter's position to viewers, and falls back to HTTP snapshot
 * polling as a best-effort safety net.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
	isSlideSessionReaction,
	isSlideSessionSnapshot,
	type SlideSessionOutgoingMessage,
	type SlideSessionReaction,
	type SlideSessionRole,
	type SlideSessionSnapshot,
} from "./live-session-protocol";

type UseSlideSessionParams = {
	sessionId: string | undefined;
	role: SlideSessionRole;
	localSlide: number;
	localStep: number;
	onRemoteNavigate: (slide: number, step: number) => void;
};

const CLIENT_ID_KEY = "slides-live-client-id";
const PING_INTERVAL_MS = 30_000;
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 5_000;
const SNAPSHOT_POLL_MS = 1_000;
const REACTION_TTL_MS = 4_000;

export function useSlideSession({
	sessionId,
	role,
	localSlide,
	localStep,
	onRemoteNavigate,
}: UseSlideSessionParams) {
	const browserHref = useBrowserHref();
	const [snapshot, setSnapshot] = useState<SlideSessionSnapshot | null>(null);
	const [connected, setConnected] = useState(false);
	const [reactions, setReactions] = useState<Array<SlideSessionReaction>>([]);
	const wsRef = useRef<WebSocket | null>(null);
	const pingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
	const lastSentPositionRef = useRef("");
	const onRemoteNavigateRef = useRef(onRemoteNavigate);
	onRemoteNavigateRef.current = onRemoteNavigate;

	const send = useCallback((message: SlideSessionOutgoingMessage) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		ws.send(JSON.stringify(message));
		return true;
	}, []);

	useEffect(() => {
		if (!sessionId || !browserHref) return;

		const liveSessionId = sessionId;
		const liveSessionHref = browserHref;
		let cancelled = false;
		let reconnectAttempt = 0;
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

		function clearPingTimer() {
			if (pingTimerRef.current) {
				clearInterval(pingTimerRef.current);
				pingTimerRef.current = undefined;
			}
		}

		function clearReconnectTimer() {
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = undefined;
			}
		}

		function scheduleReconnect() {
			if (cancelled) return;
			clearReconnectTimer();
			const delay = Math.min(RECONNECT_BASE_MS * 2 ** reconnectAttempt, RECONNECT_MAX_MS);
			reconnectAttempt += 1;
			reconnectTimer = setTimeout(connect, delay);
		}

		function connect() {
			clearReconnectTimer();
			clearPingTimer();
			const wsUrl = getSlideSessionWsUrl(liveSessionId, role, getClientId(), liveSessionHref);
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				if (cancelled || wsRef.current !== ws) return;
				reconnectAttempt = 0;
				setConnected(true);
				clearPingTimer();
				pingTimerRef.current = setInterval(() => {
					try {
						ws.send("ping");
					} catch {
						// noop
					}
				}, PING_INTERVAL_MS);
			};

			ws.onmessage = (event) => {
				if (cancelled || wsRef.current !== ws || typeof event.data !== "string") return;
				let parsed: unknown;
				try {
					parsed = JSON.parse(event.data);
				} catch {
					return;
				}

				if (isSlideSessionSnapshot(parsed)) {
					setSnapshot(parsed);
					if (role === "viewer") {
						onRemoteNavigateRef.current(parsed.position.slide, parsed.position.step);
					}
					return;
				}

				if (isSlideSessionReaction(parsed)) {
					setReactions((current) => [...current, parsed]);
				}
			};

			ws.onclose = () => {
				if (cancelled || wsRef.current !== ws) return;
				setConnected(false);
				clearPingTimer();
				scheduleReconnect();
			};

			ws.onerror = () => {
				if (cancelled || wsRef.current !== ws) return;
				setConnected(false);
			};
		}

		connect();

		return () => {
			cancelled = true;
			clearPingTimer();
			clearReconnectTimer();
			setConnected(false);
			const ws = wsRef.current;
			try {
				ws?.close();
			} catch {
				// noop
			}
			wsRef.current = null;
		};
	}, [browserHref, role, sessionId]);

	useEffect(() => {
		if (!sessionId || role !== "master" || !connected) return;
		const key = `${localSlide}:${localStep}`;
		if (lastSentPositionRef.current === key) return;
		if (send({ type: "set-slide", slide: localSlide, step: localStep })) {
			lastSentPositionRef.current = key;
		}
	}, [connected, localSlide, localStep, role, send, sessionId]);

	useEffect(() => {
		// Only poll while the socket is down; a connected socket pushes snapshots itself.
		if (!sessionId || role !== "viewer" || !browserHref || connected) return;

		let cancelled = false;
		let inFlight = false;
		const snapshotHref = browserHref;
		const snapshotUrl = getSlideSessionHttpUrl(sessionId, getClientId(), snapshotHref);

		async function refreshSnapshot() {
			if (cancelled || inFlight) return;
			inFlight = true;
			try {
				const response = await fetch(snapshotUrl, { cache: "no-store" });
				const parsed: unknown = await response.json();
				if (cancelled || !isSlideSessionSnapshot(parsed)) return;
				setSnapshot(parsed);
				onRemoteNavigateRef.current(parsed.position.slide, parsed.position.step);
			} catch {
				// The WebSocket remains the primary path; polling is a best-effort safety net.
			} finally {
				inFlight = false;
			}
		}

		void refreshSnapshot();
		const timer = setInterval(() => {
			void refreshSnapshot();
		}, SNAPSHOT_POLL_MS);

		return () => {
			cancelled = true;
			clearInterval(timer);
		};
	}, [browserHref, connected, role, sessionId]);

	useEffect(() => {
		if (reactions.length === 0) return;
		const timer = setTimeout(() => {
			const now = Date.now();
			setReactions((current) =>
				current.filter((reaction) => now - reaction.createdAt < REACTION_TTL_MS),
			);
		}, REACTION_TTL_MS);
		return () => clearTimeout(timer);
	}, [reactions]);

	return useMemo(
		() => ({
			connected,
			snapshot,
			reactions,
			createPoll: (question: string, options: Array<string>, slide?: number | null) =>
				send({ type: "create-poll", question, options, slide }),
			vote: (pollId: string, optionId: string) => send({ type: "vote", pollId, optionId }),
			sendReaction: (emoji: string) => send({ type: "reaction", emoji }),
			closePoll: () => send({ type: "close-poll" }),
			resetPoll: () => send({ type: "reset-poll" }),
		}),
		[connected, reactions, send, snapshot],
	);
}

function getSlideSessionWsUrl(
	sessionId: string,
	role: SlideSessionRole,
	clientId: string,
	baseHref: string,
) {
	const url = new URL(`/api/slides/session/${encodeURIComponent(sessionId)}`, baseHref);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set("role", role);
	url.searchParams.set("client", clientId);
	return url.toString();
}

function getSlideSessionHttpUrl(sessionId: string, clientId: string, baseHref: string) {
	const url = new URL(`/api/slides/session/${encodeURIComponent(sessionId)}`, baseHref);
	url.searchParams.set("client", clientId);
	return url.toString();
}

function getClientId() {
	try {
		const existing = globalThis.localStorage.getItem(CLIENT_ID_KEY);
		if (existing) return existing;
		const id = crypto.randomUUID();
		globalThis.localStorage.setItem(CLIENT_ID_KEY, id);
		return id;
	} catch {
		return crypto.randomUUID();
	}
}

export function useBrowserHref() {
	const [browserHref, setBrowserHref] = useState<string>();

	useEffect(() => {
		setBrowserHref(globalThis.location.href);
	}, []);

	return browserHref;
}
