"use client";

/**
 * Typed Plausible event wrapper for client-only analytics calls. The script is
 * loaded through the first-party proxy route, so callers only depend on the
 * global function when it exists.
 */
import { useCallback } from "react";

declare global {
	interface Window {
		plausible?: (event: string, options?: PlausibleEventOptions) => void;
	}
}

type PlausibleEventProps = Record<string, string | number | boolean>;

type PlausibleEventOptions = {
	props?: PlausibleEventProps;
	revenue?: {
		currency: string;
		amount: number;
	};
	u?: string;
};

type PlausibleFn = (eventName: string, options?: PlausibleEventOptions) => void;

export function useCustomPlausible() {
	return useCallback<PlausibleFn>((eventName, options) => {
		if (typeof window === "undefined") {
			return;
		}

		const plausible = window.plausible;
		if (typeof plausible !== "function") {
			return;
		}

		plausible(eventName, options);
	}, []);
}
