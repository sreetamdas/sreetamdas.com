import { GetStaticProps } from "next";
import { useEffect, useRef } from "react";

import { Button } from "@/components/Button";
import { DocumentHead } from "@/components/shared/seo";
import { Center } from "@/styles/layouts";
import { Paragraph, Title } from "@/styles/typography";

const workersWebSocketURL = process.env.NEXT_PUBLIC_WORKERS_WEBSOCKET_URL ?? "";

const Index = () => (
	<>
		<DocumentHead title="Dev" />
		<Center>
			<Title $size={5} $codeFont>
				/dev
			</Title>
			<Paragraph>A non-Prod environment.</Paragraph>
			<WebSocketComponent />
		</Center>
	</>
);

export const getStaticProps: GetStaticProps = () => {
	const isNotProduction = process.env.NODE_ENV !== "production";

	if (isNotProduction) return { props: {} };
	return { notFound: true };
};

export default Index;

const WebSocketComponent = () => {
	const webSocketRef = useRef<WebSocket>();
	const webSocketConn = webSocketRef.current;

	async function handleWebSocket() {
		webSocketConn?.send("PING");
	}

	useEffect(() => {
		const newWebSocket = new WebSocket(`${workersWebSocketURL}/hello-world`);
		newWebSocket.addEventListener("message", (event) => {
			console.log("server:", event.data);
		});

		newWebSocket.addEventListener("open", () => {
			newWebSocket.send("PING");
			webSocketRef.current = newWebSocket;
		});
	}, []);

	return <Button onClick={handleWebSocket}>WebSocket</Button>;
};
