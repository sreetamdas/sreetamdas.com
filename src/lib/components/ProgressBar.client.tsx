"use client";

import { useEffect, useRef } from "react";

export const ReadingProgress = () => {
	const spanRef = useRef<HTMLSpanElement>(null);

	function scrollListener(_event?: Event) {
		const scrollPercent = getScrollPercentage();

		if (spanRef?.current !== null) {
			spanRef.current.style.width = `${scrollPercent}%`;
		}
	}

	useEffect(() => {
		window.addEventListener("scroll", scrollListener, { passive: true });
		scrollListener();

		return () => {
			window.removeEventListener("scroll", scrollListener);
		};
	});

	return (
		<span
			ref={spanRef}
			className="duration-global fixed left-0 top-0 z-20 h-1 bg-gradient-to-r from-primary to-secondary ease-out"
		/>
	);
};

function getScrollPercentage() {
	if (typeof window === "undefined") return 0;

	return Math.ceil(
		Math.max(
			0,
			Math.min(
				100,
				(window.scrollY /
					(document.documentElement.scrollHeight - document.documentElement.clientHeight)) *
					100,
			),
		),
	);
}
