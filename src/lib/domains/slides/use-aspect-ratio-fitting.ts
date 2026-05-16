import { useLayoutEffect, useRef, useState } from "react";

/**
 * Aspect-ratio fitting for the fixed-size slide canvas.
 *
 * The canvas itself stays at the design resolution so slide typography and
 * absolute positioning remain stable. The wrapper gets the scaled layout size,
 * and the canvas is transformed inside it.
 *
 * Avoid CSS `zoom` here. Mobile browsers can keep the unscaled 1366px canvas
 * in the scrollable page area, which makes portrait users pinch-zoom out before
 * the deck appears to fit.
 */
export function useAspectRatioFittingStyles(aspectRatio: number) {
	const targetWidth = 1366;
	const targetHeight = targetWidth / aspectRatio;
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);

	useLayoutEffect(() => {
		const node = containerRef.current;
		if (!node) return;

		const updateScale = () => {
			const { width, height } = node.getBoundingClientRect();
			if (width <= 0 || height <= 0) return;

			setScale(Math.min(width / targetWidth, height / targetHeight));
		};

		updateScale();

		const observer = new ResizeObserver(updateScale);
		observer.observe(node);

		return () => observer.disconnect();
	}, [targetHeight]);

	const containerStyle: React.CSSProperties = {
		alignItems: "center",
		display: "flex",
		justifyContent: "center",
	};

	const frameStyle: React.CSSProperties = {
		height: targetHeight * scale,
		position: "relative",
		width: targetWidth * scale,
	};

	const canvasStyle: React.CSSProperties = {
		height: targetHeight,
		overflow: "hidden",
		position: "relative",
		transform: `scale(${Number.isFinite(scale) ? scale : 1})`,
		transformOrigin: "top left",
		width: targetWidth,
	};

	return [containerRef, containerStyle, frameStyle, canvasStyle] as const;
}
