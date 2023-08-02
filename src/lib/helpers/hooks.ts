import { useEffect, useRef, useState } from "react";

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
	const savedCallback = useRef<CallbackFn>();

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
