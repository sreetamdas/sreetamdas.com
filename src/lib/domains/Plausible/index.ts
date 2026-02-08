import { useCallback } from "react";

import { type FoobarFlag } from "@/lib/domains/foobar/flags";

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

		const plausible = (window as Window & { plausible?: (...args: unknown[]) => void }).plausible;
		if (typeof plausible !== "function") {
			return;
		}

		plausible(eventName as string, options);
	}, []);
}
