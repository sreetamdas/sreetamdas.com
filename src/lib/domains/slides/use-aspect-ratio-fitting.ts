import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Scales content to fit the viewport while maintaining a target aspect ratio.
 * Returns a ref to attach to the container and inline styles for the content wrapper.
 */
export function useAspectRatioFitting(aspectRatio: number) {
	const targetWidth = 1366;
	const targetHeight = targetWidth / aspectRatio;
	const containerRef = useRef<HTMLDivElement>(null);
	const [scaleFactor, setScaleFactor] = useState(1);
	const [transformOrigin, setTransformOrigin] = useState({ x: 0, y: 0 });

	const recalculate = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;

		const containerWidth = el.clientWidth || 0.01;
		const containerHeight = el.clientHeight || 0.01;

		const containerRatio = containerWidth / containerHeight;
		const targetRatio = targetWidth / targetHeight;
		const useVertical = containerRatio > targetRatio;

		const scale = useVertical ? containerHeight / targetHeight : containerWidth / targetWidth;

		const scaledWidth = targetWidth * scale;
		const scaledHeight = targetHeight * scale;

		let x0 = 0;
		if (useVertical) {
			x0 = (0.5 * (containerWidth - scaledWidth)) / (1 - scale);
		}

		let y0 = 0;
		if (!useVertical) {
			y0 = (0.5 * (containerHeight - scaledHeight)) / (1 - scale);
		}

		setScaleFactor(scale);
		setTransformOrigin({ x: x0, y: y0 });
	}, [targetWidth, targetHeight]);

	useLayoutEffect(() => {
		recalculate();
	}, [recalculate]);

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const observer = new ResizeObserver(() => recalculate());
		observer.observe(el);
		return () => observer.disconnect();
	}, [recalculate]);

	const style: React.CSSProperties = {
		height: targetHeight,
		overflow: "hidden",
		position: "relative",
		transform: `scale(${scaleFactor})`,
		transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,
		width: targetWidth,
	};

	return [containerRef, style] as const;
}
