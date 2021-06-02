import { useState, useRef, useEffect, RefObject } from "react";

import { BREAKPOINTS, TBreakpoint } from "utils/style";

export const random = (min: number, max: number) =>
	min + Math.random() * (max - min);

export const useHover: () => [RefObject<HTMLDivElement>, boolean] = () => {
	const [value, setValue] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const handleMouseOver = () => setValue(true);
	const handleMouseOut = () => setValue(false);

	useEffect(() => {
		const node = ref.current;

		if (node) {
			node.addEventListener("mouseover", handleMouseOver);
			node.addEventListener("mouseout", handleMouseOut);

			return () => {
				node.removeEventListener("mouseover", handleMouseOver);
				node.removeEventListener("mouseout", handleMouseOut);
			};
		}
	}, []);

	return [ref, value];
};

type Delay = number | null;
type CallbackFn = (...args: any[]) => void;

/**
 * Provides a declarative useInterval
 *
 * @param callback - Function that will be called every `delay` ms.
 * @param delay - Number representing the delay in ms. Set to `null` to "pause" the interval.
 */
export const useInterval = (callback: CallbackFn, delay: Delay) => {
	const savedCallback = useRef<CallbackFn>();

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const handler = (...args: any[]) => savedCallback.current!(...args);

		if (delay !== null) {
			const intervalId = setInterval(handler, delay);
			return () => clearInterval(intervalId);
		}
	}, [delay]);
};

/**
 * Provides a declarative useTimeout
 *
 * @param callback - Function that will be called after `delay` ms.
 * @param delay - Number representing the delay in ms.
 */
export const useTimeout = (callback: CallbackFn, delay: Delay) => {
	const savedCallback = useRef<CallbackFn>();

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const handler = (...args: any[]) => savedCallback.current!(...args);

		if (delay !== null) {
			const id = setTimeout(handler, delay);
			return () => clearTimeout(id);
		}
	}, [delay]);
};

export const useHasMounted = () => {
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);
	return hasMounted;
};

const getBreakpointOrSize = (breakpoint: TBreakpoint | number) => {
	if (typeof breakpoint === "string") {
		return BREAKPOINTS[breakpoint];
	}
	return breakpoint;
};

type TUseBreakpointProps = (
	{ from, to }: { from?: TBreakpoint | number; to: TBreakpoint | number },
	{ onEnter, onLeave }: { onEnter: () => void; onLeave: () => void }
) => void;

/**
 * Detect viewport size and handle -changes
 * @param viewportSize the viewport range to be tracked
 * @param callbackFn handler functions to be executed when the viewport is entering/leaving that size
 */
export const useBreakpointRange: TUseBreakpointProps = (
	{ from = 0, to },
	{ onEnter, onLeave }
) => {
	const [currentState, setCurrentState] = useState("");
	const fromSize = getBreakpointOrSize(from);
	const toSize = getBreakpointOrSize(to);

	useEffect(() => {
		function handleResize() {
			const screenWidth = window.innerWidth;
			const withinFrom = screenWidth > fromSize;
			const withinTo = !toSize || screenWidth < toSize;
			const newState = `${withinFrom}-${withinTo}`;

			// Ensures it runs once on enter and once on leave
			if (currentState !== newState) {
				setCurrentState(newState);

				if (withinFrom && withinTo && onEnter) {
					onEnter();
				} else if (onLeave) {
					onLeave();
				}
			}
		}

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, [fromSize, toSize, onEnter, onLeave, currentState, setCurrentState]);
};
