"use client";

import remdxCss from "@nkzw/remdx/style.css?inline";
import { render } from "@nkzw/remdx";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

export const Route = createFileRoute("/slides/mdx/")({
	component: MainLayout,
});

const STYLE_ID = "remdx-route-styles";

function MainLayout() {
	const hasRenderedRef = useRef(false);

	const setContainerRef = useCallback((node: HTMLElement | null) => {
		if (!node || hasRenderedRef.current) {
			return;
		}

		const style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = remdxCss;
		document.head.appendChild(style);

		hasRenderedRef.current = true;
		const slidesModule = import("./slides.re.mdx") as Parameters<typeof render>[1];
		void render(node, slidesModule);

		return () => {
			document.getElementById(STYLE_ID)?.remove();
			hasRenderedRef.current = false;
		};
	}, []);

	return <main id="main-content" ref={setContainerRef} />;
}
