/* eslint-disable no-console */
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { Button } from "@/components/Button";

const workersWebSocketURL = process.env.NEXT_PUBLIC_WORKERS_WEBSOCKET_URL ?? "";

export const LiveViewsCounter = () => {
	const { asPath: path } = useRouter();
	const webSocketRef = useRef<WebSocket>();
	const webSocketConn = webSocketRef.current;

	function handleWebSocket() {
		webSocketConn?.send("PING");
	}
	function closeWebSocket() {
		if (webSocketConn?.OPEN) {
			webSocketConn?.close();
		} else {
			console.log("?>");
		}
	}

	useEffect(() => {
		const newWebSocket = new WebSocket(`${workersWebSocketURL}${path}`);
		newWebSocket.addEventListener("message", (event) => {
			console.log("server:", event.data);
		});

		newWebSocket.addEventListener("open", () => {
			newWebSocket.send("PING");
			webSocketRef.current = newWebSocket;
		});

		return () => {
			console.log("Closing WebSocket");
			closeWebSocket();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
			<Button onClick={handleWebSocket}>PING</Button>
			<Button onClick={closeWebSocket}>{webSocketConn?.OPEN ? "Close" : "Closed"}</Button>
		</div>
	);
};
