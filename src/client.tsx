/**
 * TanStack Start client entry. Sentry must initialize before any other code runs
 * so errors and events before hydration are captured.
 */
import "./instrument.client";
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
	);
});
