"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";

import { getOrCreatePresenceClientId } from "@/lib/domains/Presence/client-id";
import { PRESENCE_HUNTER_ID_STORAGE_KEY } from "@/lib/domains/Presence/protocol";
import { createPresenceSocket, getPresenceWsUrl } from "@/lib/domains/Presence/socket";

export type HunterPresence = {
	connected: boolean;
	hunters: number | null;
};

const INITIAL_STATE: HunterPresence = { connected: false, hunters: null };

let _state: HunterPresence = INITIAL_STATE;
const _listeners = new Set<() => void>();

let _clientId: string | null = null;
let _hunterId: string | null = null;

const _enabledRefs = new Set<{ current: boolean }>();

function _hasEnabled() {
	for (const ref of _enabledRefs) {
		if (ref.current) return true;
	}
	return false;
}

function _setState(next: HunterPresence) {
	_state = next;
	for (const l of _listeners) l();
}

const _socket = createPresenceSocket({
	isActive: () => _hasEnabled() && _clientId !== null,
	getUrl: () => getPresenceWsUrl(_clientId ?? "", _hunterId),
	onConnected: (connected) => _setState({ ..._state, connected }),
	onMessage: (message) => _setState({ ..._state, hunters: message.hunters ?? 0 }),
});

function _disconnect(reason = "no enabled subscribers") {
	_socket.shutdown(reason);
	_setState(INITIAL_STATE);
}

function _subscribe(listener: () => void) {
	_listeners.add(listener);
	return () => {
		_listeners.delete(listener);
	};
}

/**
 * Shares one hunter-flagged presence socket across every mounted component, so
 * a page with both the Pixel and the dashboard open still counts as a single
 * hunter. The socket lives while at least one subscriber passes enabled=true.
 */
export function useSharedHunterPresence(enabled: boolean): HunterPresence {
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	useEffect(() => {
		_enabledRefs.add(enabledRef);

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

		if (enabled && !_socket.hasLiveSocket()) {
			_socket.connect();
		}

		return () => {
			_enabledRefs.delete(enabledRef);
			if (!_hasEnabled()) _disconnect();
		};
	}, [enabled]);

	return useSyncExternalStore(
		_subscribe,
		() => _state,
		() => INITIAL_STATE,
	);
}
