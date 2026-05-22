"use client";

import { useCallback } from "react";

import { type FoobarFlag } from "@/lib/domains/foobar/flags";

declare global {
	interface Window {
		plausible?: (event: string, options?: Record<string, unknown>) => void;
	}
}

export type PlausibleEventsType = {
	foobar: { achievement: FoobarFlag };
};

type PlausibleEventOptions<EventName extends keyof PlausibleEventsType> = {
	props?: PlausibleEventsType[EventName];
	revenue?: {
		currency: string;
		amount: number;
	};
	u?: string;
};

type PlausibleFn = <EventName extends keyof PlausibleEventsType>(
	eventName: EventName,
	options?: PlausibleEventOptions<EventName>,
) => void;

export function useCustomPlausible() {
	return useCallback<PlausibleFn>((eventName, options) => {
		if (typeof window === "undefined") {
			return;
		}

		const plausible = window.plausible;
		if (typeof plausible !== "function") {
			return;
		}

		plausible(eventName as string, options);
	}, []);
}
