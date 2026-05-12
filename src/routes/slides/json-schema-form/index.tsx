"use client";

import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Suspense, use } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { SlideDeck, type Slide } from "@/lib/domains/slides";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/slides/json-schema-form/")({
	component: MainLayout,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/slides/json-schema-form") }],
		meta: [
			{ title: `Match made on the server: JSON Schema Forms ${SITE_TITLE_APPEND}` },
			{
				name: "description",
				content: "How to add a moving RGB effect to your text using styled-components",
			},
			{
				property: "og:title",
				content: `Match made on the server: JSON Schema Forms ${SITE_TITLE_APPEND}`,
			},
			{
				property: "og:description",
				content: "How to add a moving RGB effect to your text using styled-components",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:url",
				content: canonicalUrl("/slides/json-schema-form"),
			},
			{ property: "og:image", content: defaultOgImageUrl() },
			{
				name: "twitter:title",
				content: `Match made on the server: JSON Schema Forms ${SITE_TITLE_APPEND}`,
			},
			{
				name: "twitter:description",
				content: "How to add a moving RGB effect to your text using styled-components",
			},
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
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
	const search = useSearch({ from: "/slides/json-schema-form/" }) as { presenter?: string };
	const presenterMode = search.presenter === "1" || search.presenter === "true";

	return (
		<div className="fixed inset-0">
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
