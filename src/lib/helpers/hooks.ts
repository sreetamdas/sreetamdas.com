import { random } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";

export function useHasMounted() {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	return hasMounted;
}

type Delay = number | null;
type CallbackFn = (...args: unknown[]) => void;
/**
 * Provides a declarative useInterval
 *
 * @param callback - Function that will be called every `delay` ms.
 * @param delay - Number representing the delay in ms. Set to `null` to "pause" the interval.
 */
export function useInterval(callback: CallbackFn, delay: Delay) {
	const savedCallback = useRef<CallbackFn>(null);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const handler: CallbackFn = (...args) => savedCallback.current?.(...args);

		if (delay !== null) {
			const intervalId = setInterval(handler, delay);
			return () => clearInterval(intervalId);
		}
	}, [delay]);
}

export function useRandomInterval(
	callback: () => void,
	minDelay: null | number,
	maxDelay: null | number,
) {
	const timeoutId = useRef<number | null>(null);
	const savedCallback = useRef(callback);
	useEffect(() => {
		savedCallback.current = callback;
	});
	useEffect(() => {
		if (typeof minDelay === "number" && typeof maxDelay === "number") {
			const handleTick = () => {
				const nextTickAt = random(minDelay, maxDelay);
				timeoutId.current = window.setTimeout(() => {
					savedCallback.current();
					handleTick();
				}, nextTickAt);
			};
			handleTick();
		}

		return () => {
			if (timeoutId.current !== null) {
				window.clearTimeout(timeoutId.current);
			}
		};
	}, [minDelay, maxDelay]);
	const cancel = useCallback(function () {
		{
			if (timeoutId.current !== null) {
				window.clearTimeout(timeoutId.current);
			}
		}
	}, []);
	return cancel;
}

const QUERY = "(prefers-reduced-motion: no-preference)";
const isRenderingOnServer = typeof window === "undefined";
function getInitialState() {
	/**
	 * For our initial server render, we won't know if the userprefers reduced motion, but it
	 * doesn't matter. This value will be overwritten on the client, before any animations occur.
	 */
	return isRenderingOnServer ? true : !window.matchMedia(QUERY).matches;
}
/**
 * Get user's preference for reduced-motion
 * @returns preference for reduced-motion
 */
export function usePrefersReducedMotion() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialState);

	useEffect(() => {
		const mediaQueryList = window.matchMedia(QUERY);
		function listener(event: MediaQueryListEvent) {
			setPrefersReducedMotion(!event.matches);
		}

		if (mediaQueryList.addEventListener) {
			mediaQueryList.addEventListener("change", listener);
		} else {
			mediaQueryList.addListener(listener);
		}
		return () => {
			if (mediaQueryList.removeEventListener) {
				mediaQueryList.removeEventListener("change", listener);
			} else {
				mediaQueryList.removeListener(listener);
			}
		};
	}, []);

	return prefersReducedMotion;
}
