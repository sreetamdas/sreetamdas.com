/**
 * CSS-only aspect-ratio fitting using container query units and zoom.
 *
 * Unlike the previous JS approach (ResizeObserver → setState → layout shift),
 * this computes the scale purely in CSS so there is zero flash on mount.
 * Container query units resolve synchronously from the parent's size, and
 * `zoom` (unlike `transform: scale`) adjusts the element's layout box so
 * flex centering works without a manual transform-origin calculation.
 *
 * Browser support: container units (cqw/cqh) — Chrome 105, Firefox 110,
 * Safari 16. Browsers that don't support them will render the canvas at
 * its native 1366 × (1366/aspectRatio) size with no scaling.
 */
export function aspectRatioFittingStyles(aspectRatio: number) {
	const targetWidth = 1366;
	const targetHeight = targetWidth / aspectRatio;

	const containerStyle: React.CSSProperties = {
		alignItems: "center",
		containerType: "size",
		display: "flex",
		justifyContent: "center",
	};

	const canvasStyle: React.CSSProperties = {
		height: targetHeight,
		overflow: "hidden",
		position: "relative",
		width: targetWidth,
		zoom: `min(100cqw / ${targetWidth}px, 100cqh / ${targetHeight}px)`,
	};

	return [containerStyle, canvasStyle] as const;
}
