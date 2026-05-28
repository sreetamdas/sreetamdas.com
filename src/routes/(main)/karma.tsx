import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { KarmaShowcase } from "@/lib/components/KarmaShowcase";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/karma")({
	component: KarmaPage,
	staleTime: 1000 * 60 * 60 * 24,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/karma") }],
		meta: [
			{
				title: `Karma ${SITE_TITLE_APPEND}`,
			},
			{
				name: "description",
				content: "A colorful VS Code theme by Sreetam Das",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/karma") },
			{
				property: "og:title",
				content: `Karma ${SITE_TITLE_APPEND}`,
			},
			{
				property: "og:description",
				content: "A colorful VS Code theme by Sreetam Das",
			},
			{
				property: "og:image",
				content: `${SITE_URL}/karma/karma-card.jpg`,
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:title",
				content: `Karma ${SITE_TITLE_APPEND}`,
			},
			{
				name: "twitter:description",
				content: "A colorful VS Code theme by Sreetam Das",
			},
			{
				name: "twitter:image",
				content: `${SITE_URL}/karma/karma-card.jpg`,
			},
		],
	}),
});

function KarmaPage() {
	return (
		<>
			<h1 className="pt-10 pb-20 text-center font-serif text-9xl leading-none font-bold">Karma</h1>
			<p className="text-center font-serif text-4xl font-medium tracking-tight">
				A colorful VS Code theme
			</p>

			<KarmaShowcase examples={showcaseImages} />

			<ViewsCounter />
		</>
	);
}

const themeLanguageMap = [
	{
		name: "React",
		defaultImage: "/karma/default/react.webp",
		lightImage: "/karma/light/react.webp",
	},
	{
		name: "Elixir",
		defaultImage: "/karma/default/elixir.webp",
		lightImage: "/karma/light/elixir.webp",
	},
	{
		name: "CSS",
		defaultImage: "/karma/default/css.webp",
		lightImage: "/karma/light/css.webp",
	},
	{
		name: "Go",
		defaultImage: "/karma/default/go.webp",
		lightImage: "/karma/light/go.webp",
	},
	{
		name: "Phoenix",
		defaultImage: "/karma/default/phoenix.webp",
		lightImage: "/karma/light/phoenix.webp",
	},
	{
		name: "Python",
		defaultImage: "/karma/default/python.webp",
		lightImage: "/karma/light/python.webp",
	},
	{
		name: "Rust",
		defaultImage: "/karma/default/rust.webp",
		lightImage: "/karma/light/rust.webp",
	},
	{
		name: "Svelte",
		defaultImage: "/karma/default/svelte.webp",
		lightImage: "/karma/light/svelte.webp",
	},
	{
		name: "TypeScript",
		defaultImage: "/karma/default/typescript.webp",
		lightImage: "/karma/light/typescript.webp",
	},
	{
		name: "Vue",
		defaultImage: "/karma/default/vue.webp",
		lightImage: "/karma/light/vue.webp",
	},
] as const;

const showcaseImages = themeLanguageMap.map(({ name, defaultImage, lightImage }) => ({
	name,
	dark: {
		src: defaultImage,
	},
	light: {
		src: lightImage,
	},
}));
