"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SlideDeck, type Slide } from "@/lib/domains/slides";

export const Route = createFileRoute("/slides/mdx/")({
	component: MainLayout,
});

function MainLayout() {
	const [slides, setSlides] = useState<Slide[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Vite transforms .re.mdx files via slideDeckPlugin at build time.
		// TypeScript doesn't recognize this non-standard extension, so we
		// suppress the error. The module is guaranteed to exist at runtime.
		// @ts-expect-error .re.mdx is transformed by custom Vite plugin
		import("./slides.re.mdx")
			.then((mod: { default: Slide[] }) => {
				setSlides(mod.default);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to load slides.");
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
				<p className="text-gray-500">Loading slides...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	if (slides.length === 0) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
				<p className="text-gray-500">No slides found</p>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-white dark:bg-gray-900">
			<SlideDeck slides={slides} />
		</div>
	);
}
