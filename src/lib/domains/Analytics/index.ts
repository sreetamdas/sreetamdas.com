"use client";

import { useCallback } from "react";

declare global {
	interface Window {
		statsTracker?: {
			loaded?: boolean;
			event: (eventName: string, props?: Record<string, string>) => void;
			q?: Array<[string, Record<string, string> | undefined]>;
		};
	}
}

type EventProps = Record<string, string | number | boolean>;

export function useTrackEvent() {
	return useCallback((eventName: string, options?: { props?: EventProps }) => {
		if (typeof window === "undefined") return;
		const props = options?.props
			? Object.fromEntries(
					Object.entries(options.props).map(([key, value]) => [key, String(value)]),
				)
			: undefined;
		const tracker = window.statsTracker;
		if (tracker?.loaded && typeof tracker.event === "function") {
			tracker.event(eventName, props);
			return;
		}
		const queuedTracker = tracker ?? { q: [], event: () => undefined };
		queuedTracker.q ??= [];
		queuedTracker.q.push([eventName, props]);
		window.statsTracker = queuedTracker;
	}, []);
}
