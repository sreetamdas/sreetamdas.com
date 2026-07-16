"use client";

import { useEffect, useState } from "react";

import { getOrCreatePresenceClientId } from "@/lib/domains/Presence/client-id";
import { createPresenceSocket, getPresenceWsUrl } from "@/lib/domains/Presence/socket";

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

	useEffect(() => {
		let cancelled = false;
		const clientId = getOrCreatePresenceClientId(window.sessionStorage);

		const socket = createPresenceSocket({
			isActive: () => !cancelled,
			getUrl: () => getPresenceWsUrl(clientId),
			onConnected: setConnected,
			onMessage: (message) => setCount(message.count),
		});

		socket.connect();

		return () => {
			cancelled = true;
			socket.shutdown("presence hook cleanup");
		};
	}, []);

	return { count, connected };
}
