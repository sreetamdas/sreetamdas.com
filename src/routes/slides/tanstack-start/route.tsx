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
import { validateSlideSearch } from "@/lib/domains/slides/route-search";
import { SlideDeckRouteShell } from "@/lib/domains/slides/route-shell";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { tanstackStartLivePolls } from "./-live-polls";

export const Route = createFileRoute("/slides/tanstack-start")({
	validateSearch: validateSlideSearch,
	component: MainLayout,
	head: () => {
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
			livePolls={tanstackStartLivePolls}
			onPositionChange={handlePositionChange}
		/>
	);
}
