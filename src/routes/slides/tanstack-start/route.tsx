"use client";

import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useCallback } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { type SlideSessionPollDefinition } from "@/lib/domains/slides/live-session";
import { SlideDeckRouteShell, validateSlideSearch } from "@/lib/domains/slides/route-shell";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/slides/tanstack-start")({
	validateSearch: validateSlideSearch,
	component: MainLayout,
	head: ({ matches }) => {
		if (matches.some((match) => match.routeId === "/slides/tanstack-start/showcase")) {
			return {};
		}

		return {
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
		};
	},
});

const slidesPromise = import("./slides.re.mdx");
const livePolls: Array<SlideSessionPollDefinition> = [
	{
		slide: 8,
		question: "Have you tried TanStack Start yet?",
		options: ["Yes", "Not yet", "Just here for vibes"],
	},
	{
		slide: 17,
		question: "Which rendering knob feels most useful?",
		options: ["Selective SSR", "Deferred hydration", "RSC as data"],
	},
];

function MainLayout() {
	const location = useLocation();
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

	if (location.pathname !== "/slides/tanstack-start") {
		return <Outlet />;
	}

	return (
		<SlideDeckRouteShell
			search={search}
			slidesPromise={slidesPromise}
			livePolls={livePolls}
			onPositionChange={handlePositionChange}
		/>
	);
}
