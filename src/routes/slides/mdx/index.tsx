"use client";

import "@nkzw/remdx/style.css";
import { render } from "@nkzw/remdx";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/slides/mdx/")({
	component: MainLayout,
});

function MainLayout() {
	const containerRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		void render(containerRef.current, import("./slides.re.mdx"));
	}, []);

	return <main id="main-content" ref={containerRef} />;
}
