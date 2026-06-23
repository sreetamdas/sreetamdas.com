"use client";

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { type SlideSessionPollDefinition } from "@/lib/domains/slides/live-session";
import { validateSlideSearch } from "@/lib/domains/slides/route-search";
import { SlideDeckRouteShell } from "@/lib/domains/slides/route-shell";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/slides/json-schema-form")({
	validateSearch: validateSlideSearch,
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

const slidesPromise = import("./slides.re.mdx");
const livePolls: Array<SlideSessionPollDefinition> = [
	{
		slide: 3,
		question: "How painful are forms in your app?",
		options: ["Very", "Manageable", "Not my problem"],
	},
	{
		slide: 8,
		question: "Where does validation usually drift first?",
		options: ["Frontend", "Backend", "Product rules"],
	},
	{
		slide: 15,
		question: "Would schema-driven forms work for your team?",
		options: ["Yes", "Maybe", "No"],
	},
];

function MainLayout() {
	const search = useSearch({ from: "/slides/json-schema-form" });
	const navigate = useNavigate({ from: "/slides/json-schema-form" });
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
