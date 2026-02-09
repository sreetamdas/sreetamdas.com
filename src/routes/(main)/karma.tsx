import { createFileRoute } from "@tanstack/react-router";
import { SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { KarmaShowcase } from "@/lib/components/KarmaShowcase.client";
import { createServerFn } from "@tanstack/react-start";
// import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

export const Route = createFileRoute("/(main)/karma")({
	component: KarmaPage,
	loader: () => {
		return getShowcaseImages();
	},
	head: () => ({
		meta: [
			{
				title: `Karma ${SITE_TITLE_APPEND}`,
			},
			{
				name: "description",
				content: "A colorful VS Code theme by Sreetam Das",
			},
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
	const examples = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 text-center font-serif text-9xl leading-none font-bold tracking-tighter">
				Karma
			</h1>
			<p className="text-center font-serif text-4xl font-medium tracking-tight">
				A colorful VS Code theme
			</p>

			<KarmaShowcase examples={examples} />

			<ViewsCounter />
		</>
	);
}

const getShowcaseImages = createServerFn({ method: "GET" })
	// .middleware([staticFunctionMiddleware])
	.handler(async () => {
		return theme_language_map.map(({ name, default_image, light_image }) => ({
			name,
			dark: {
				src: default_image,
			},
			light: {
				src: light_image,
			},
		}));
	});

const theme_language_map = [
	{
		name: "React",
		default_image: "/karma/default/react.webp",
		light_image: "/karma/light/react.webp",
	},
	{
		name: "Elixir",
		default_image: "/karma/default/elixir.webp",
		light_image: "/karma/light/elixir.webp",
	},
	{
		name: "CSS",
		default_image: "/karma/default/css.webp",
		light_image: "/karma/light/css.webp",
	},
	{
		name: "Go",
		default_image: "/karma/default/go.webp",
		light_image: "/karma/light/go.webp",
	},
	{
		name: "Phoenix",
		default_image: "/karma/default/phoenix.webp",
		light_image: "/karma/light/phoenix.webp",
	},
	{
		name: "Python",
		default_image: "/karma/default/python.webp",
		light_image: "/karma/light/python.webp",
	},
	{
		name: "Rust",
		default_image: "/karma/default/rust.webp",
		light_image: "/karma/light/rust.webp",
	},
	{
		name: "Svelte",
		default_image: "/karma/default/svelte.webp",
		light_image: "/karma/light/svelte.webp",
	},
	{
		name: "TypeScript",
		default_image: "/karma/default/typescript.webp",
		light_image: "/karma/light/typescript.webp",
	},
	{
		name: "Vue",
		default_image: "/karma/default/vue.webp",
		light_image: "/karma/light/vue.webp",
	},
];
