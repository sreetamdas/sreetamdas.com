"use client";

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { type MDXComponents } from "mdx/types";
import { useCallback, Suspense, use } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { SlideDeck, type Slide } from "@/lib/domains/slides";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

interface SlideSearch {
	presenter?: string;
	slide?: number;
	step?: number;
}

export const Route = createFileRoute("/slides/tanstack-start")({
	validateSearch: (search: Record<string, string>): SlideSearch => {
		const parseNonNegativeInt = (raw: string | undefined): number | undefined => {
			if (!raw) return undefined;
			const n = Number(raw);
			return Number.isFinite(n) && Number.isInteger(n) && n >= 0 ? n : undefined;
		};
		return {
			presenter: search.presenter,
			slide: parseNonNegativeInt(search.slide),
			step: parseNonNegativeInt(search.step),
		};
	},
	component: MainLayout,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/slides/tanstack-start") }],
		meta: [
			{ title: `TanStack Start ${SITE_TITLE_APPEND}` },
			{
				property: "og:title",
				content: `TanStack Start ${SITE_TITLE_APPEND}`,
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:url",
				content: canonicalUrl("/slides/tanstack-start"),
			},
			{ property: "og:image", content: defaultOgImageUrl() },
			{
				name: "twitter:title",
				content: `TanStack Start ${SITE_TITLE_APPEND}`,
			},
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
});

const slidesPromise = import("./slides.re.mdx");

function SlideDeckLoader({
	slides,
	components,
	presenterMode,
	initialSlide,
	initialStep,
	onNavigate,
}: {
	slides: Slide[];
	components: MDXComponents;
	presenterMode: boolean;
	initialSlide?: number;
	initialStep?: number;
	onNavigate: (slide: number, step: number) => void;
}) {
	return (
		<SlideDeck
			slides={slides}
			components={components}
			presenterMode={presenterMode}
			initialSlide={initialSlide}
			initialStep={initialStep}
			onNavigate={onNavigate}
			transitions={false}
			hide_slide_index
		/>
	);
}

function MainLayout() {
	const search = useSearch({ from: "/slides/tanstack-start" });
	const navigate = useNavigate({ from: "/slides/tanstack-start" });
	const presenterMode = search.presenter === "1" || search.presenter === "true";

	const handleNavigate = useCallback(
		(slide: number, step: number) => {
			void navigate({
				search: (prev) => ({ ...prev, slide, step }),
				replace: true,
			});
		},
		[navigate],
	);

	return (
		<div className="fixed inset-0">
			<Suspense
				fallback={
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500">Loading slides...</p>
					</div>
				}
			>
				<SlideDeckLoader
					slides={use(slidesPromise).default}
					components={use(slidesPromise)._components}
					presenterMode={presenterMode}
					initialSlide={search.slide}
					initialStep={search.step}
					onNavigate={handleNavigate}
				/>
			</Suspense>
		</div>
	);
}
