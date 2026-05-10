"use client";

import { Suspense, use } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";

import { SlideDeck, type Slide } from "@/lib/domains/slides";

export const Route = createFileRoute("/slides/mdx/")({
	component: MainLayout,
});

// Module-level promise starts loading immediately when the chunk is parsed.
// React.use() suspends until it resolves, letting Suspense show a fallback.
// @ts-expect-error .re.mdx is transformed by custom Vite plugin
const slidesPromise = import("./slides.re.mdx") as Promise<{ default: Slide[] }>;

function SlideDeckLoader({ presenterMode }: { presenterMode: boolean }) {
	const mod = use(slidesPromise);
	return <SlideDeck slides={mod.default} presenterMode={presenterMode} />;
}

function MainLayout() {
	const search = useSearch({ from: "/slides/mdx/" }) as { presenter?: string };
	const presenterMode = search.presenter === "1" || search.presenter === "true";

	return (
		<div className="fixed inset-0 bg-white dark:bg-gray-900">
			<Suspense
				fallback={
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500">Loading slides...</p>
					</div>
				}
			>
				<SlideDeckLoader presenterMode={presenterMode} />
			</Suspense>
		</div>
	);
}
