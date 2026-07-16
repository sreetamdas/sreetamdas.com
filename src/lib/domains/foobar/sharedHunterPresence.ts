"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";

import { getOrCreatePresenceClientId } from "@/lib/domains/Presence/client-id";
import {
	PRESENCE_CLIENT_ID_PARAM,
	PRESENCE_HUNTER_ID_PARAM,
	PRESENCE_HUNTER_ID_STORAGE_KEY,
	PRESENCE_HUNTER_PARAM,
	isPresenceServerMessage,
} from "@/lib/domains/Presence/protocol";

const CLIENT_PING_INTERVAL_MS = 25_000;
const CLIENT_SILENCE_TIMEOUT_MS = 70_000;

export type LiveViewers = {
	count: number | null;
	connected: boolean;
	hunters: number | null;
};

const INITIAL_STATE: LiveViewers = { count: null, connected: false, hunters: null };

type Listener = () => void;

let _state: LiveViewers = { ...INITIAL_STATE };
const _listeners = new Set<Listener>();

let _ws: WebSocket | null = null;
let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let _pingInterval: ReturnType<typeof setInterval> | null = null;
let _silenceTimer: ReturnType<typeof setTimeout> | null = null;
let _reconnectAttempt = 0;
let _clientId: string | null = null;
let _hunterId: string | null = null;

const _enabledRefs = new Set<{ current: boolean }>();

function _hasEnabled() {
	for (const ref of _enabledRefs) {
		if (ref.current) return true;
	}
	return false;
}

function _notify() {
	_state = { ..._state };
	for (const l of _listeners) l();
}

function _getWsUrl(clientId: string) {
	const url = new URL("/api/presence", window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set(PRESENCE_CLIENT_ID_PARAM, clientId);
	url.searchParams.set(PRESENCE_HUNTER_PARAM, "1");
	if (_hunterId) url.searchParams.set(PRESENCE_HUNTER_ID_PARAM, _hunterId);
	return url.toString();
}

function _send(ws: WebSocket, message: string) {
	if (ws.readyState !== WebSocket.OPEN) return false;
	try {
		ws.send(message);
		return true;
	} catch {
		return false;
	}
}

function _clearReconnectTimer() {
	if (_reconnectTimer !== null) {
		clearTimeout(_reconnectTimer);
		_reconnectTimer = null;
	}
}

function _clearPingInterval() {
	if (_pingInterval !== null) {
		clearInterval(_pingInterval);
		_pingInterval = null;
	}
}

function _clearSilenceTimer() {
	if (_silenceTimer !== null) {
		clearTimeout(_silenceTimer);
		_silenceTimer = null;
	}
}

function _closeCurrent(reason = "presence reconnect") {
	const current = _ws;
	_ws = null;
	_clearPingInterval();
	_clearSilenceTimer();
	if (current) {
		try {
			current.close(1000, reason);
		} catch {
			// noop
		}
	}
}

function _scheduleReconnect() {
	_clearReconnectTimer();
	if (!_hasEnabled()) return;
	const delayMs = Math.min(10_000, 250 * 2 ** _reconnectAttempt);
	_reconnectAttempt = Math.min(_reconnectAttempt + 1, 6);
	_reconnectTimer = setTimeout(_connect, delayMs);
}

function _handleSilence(ws: WebSocket) {
	if (_ws !== ws || !_hasEnabled()) return;
	_state = { ..._state, connected: false };
	_notify();
	_closeCurrent("presence heartbeat timeout");
	_scheduleReconnect();
}

function _markServerMessage(ws: WebSocket) {
	_clearSilenceTimer();
	_silenceTimer = setTimeout(() => _handleSilence(ws), CLIENT_SILENCE_TIMEOUT_MS);
}

function _startClientHeartbeat(ws: WebSocket) {
	_clearPingInterval();
	_clearSilenceTimer();
	_markServerMessage(ws);
	_pingInterval = setInterval(() => {
		if (!_send(ws, "ping")) _handleSilence(ws);
	}, CLIENT_PING_INTERVAL_MS);
}

function _connect() {
	_clearReconnectTimer();
	if (!_hasEnabled() || !_clientId) return;
	_closeCurrent();

	let ws: WebSocket;
	try {
		ws = new WebSocket(_getWsUrl(_clientId));
	} catch {
		_scheduleReconnect();
		return;
	}

	_ws = ws;

	ws.onopen = () => {
		if (_ws !== ws || !_hasEnabled()) return;
		_reconnectAttempt = 0;
		_state = { ..._state, connected: true };
		_notify();
		_startClientHeartbeat(ws);
	};

	ws.onmessage = (event) => {
		if (_ws !== ws || !_hasEnabled()) return;
		if (typeof event.data !== "string") return;

		if (event.data === "pong") {
			_markServerMessage(ws);
			return;
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(event.data);
		} catch {
			return;
		}

		if (!isPresenceServerMessage(parsed)) return;
		_markServerMessage(ws);

		_state = { ..._state, count: parsed.count, hunters: parsed.hunters ?? 0 };
		_notify();
	};

	ws.onclose = () => {
		if (_ws !== ws) return;
		_state = { ..._state, connected: false };
		_notify();
		_clearPingInterval();
		_clearSilenceTimer();
		_scheduleReconnect();
	};

	ws.onerror = () => {
		if (_ws !== ws) return;
		_state = { ..._state, connected: false };
		_notify();
		_closeCurrent("presence websocket error");
		_scheduleReconnect();
	};
}

function _disconnect(reason = "no enabled subscribers") {
	_clearReconnectTimer();
	_closeCurrent(reason);
	_reconnectAttempt = 0;
	_state = { ...INITIAL_STATE };
	_notify();
}

export function useSharedHunterPresence(enabled: boolean): LiveViewers {
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	useEffect(() => {
		_enabledRefs.add(enabledRef);

		if (typeof window !== "undefined") {
			if (!_clientId) {
				_clientId = getOrCreatePresenceClientId(window.sessionStorage);
			}
			if (!_hunterId) {
				_hunterId = getOrCreatePresenceClientId(
					window.localStorage,
					undefined,
					PRESENCE_HUNTER_ID_STORAGE_KEY,
				);
			}
		}

		if (enabled && _hasEnabled() && (!_ws || _ws.readyState > WebSocket.OPEN)) {
			_connect();
		}

		return () => {
			_enabledRefs.delete(enabledRef);
			if (!_hasEnabled()) _disconnect();
		};
	}, [enabled]);

	return useSyncExternalStore(
		(listener) => {
			_listeners.add(listener);
			return () => {
				_listeners.delete(listener);
			};
		},
		() => _state,
		() => INITIAL_STATE,
	);
}
