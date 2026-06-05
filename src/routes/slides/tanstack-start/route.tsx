"use client";

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { type SlideSessionPollDefinition } from "@/lib/domains/slides/live-session";
import { SlideDeckRouteShell, validateSlideSearch } from "@/lib/domains/slides/route-shell";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/slides/tanstack-start")({
	validateSearch: validateSlideSearch,
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
const livePolls: Array<SlideSessionPollDefinition> = [
	{
		slide: 0,
		question: "Have you tried TanStack Start yet?",
		options: ["Yes", "Not yet", "Just here for vibes"],
	},
	{
		slide: 2,
		question: "What should we dig into after this?",
		options: ["Routing", "Server functions", "Cloudflare deploys"],
	},
];

function MainLayout() {
	const search = useSearch({ from: "/slides/tanstack-start" });
	const navigate = useNavigate({ from: "/slides/tanstack-start" });
	const handlePositionChange = useCallback(
		(slide: number, step: number) => {
			void navigate({
				search: (prev) => ({ ...prev, slide, step }),
				replace: true,
			});
		},
		[navigate],
	);

	return (
		<SlideDeckRouteShell
			search={search}
			slidesPromise={slidesPromise}
			livePolls={livePolls}
			onPositionChange={handlePositionChange}
		/>
	);
}
