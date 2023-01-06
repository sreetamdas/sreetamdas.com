/* eslint-disable no-console */
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { sharedTransition } from "@/styles/components";

const workersWebSocketURL = process.env.NEXT_PUBLIC_WORKERS_WEBSOCKET_URL ?? "";

type ViewerData = [number, number, number] | [null, null, null];

function parseBroadcast(message: string) {
	const parsed = JSON.parse(message);
	console.log(parsed);
}

export const LiveViewsCounter = () => {
	const { asPath: path } = useRouter();
	const webSocketRef = useRef<WebSocket>();
	const webSocketConn = webSocketRef.current;

	const [[page, unique, total], setViewerData] = useState<ViewerData>([null, null, null]);

	function closeWebSocket() {
		if (webSocketConn?.OPEN) {
			webSocketConn?.close();
		}
	}

	useEffect(() => {
		const newWebSocket = new WebSocket(`${workersWebSocketURL}${path}`);
		newWebSocket.addEventListener("message", (event) => {
			parseBroadcast(event.data);
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
		<LiveViewsWrapper>
			<p>
				{page} on this page, {total} concurrent views, {unique} unique users
			</p>
		</LiveViewsWrapper>
	);
};

const LiveViewsWrapper = styled.div`
	display: flex;
	flex-direction: row;
	gap: 0.4rem;
	align-items: center;
	justify-content: center;
	margin: 20px auto 0;

	width: fit-content;
	padding: 5px 20px;

	& > p {
		margin: 0;
		font-size: 0.7rem;
	}
`;

const LiveViewCount = styled.span`
	font-size: 1rem;
	padding: 5px;
	font-family: var(--font-family-code);
	color: var(--color-primary-accent);
	border-radius: var(--border-radius);
	background-color: var(--color-background);
	border: 2px solid var(--color-primary-accent);

	${sharedTransition("color, background-color")}
`;
