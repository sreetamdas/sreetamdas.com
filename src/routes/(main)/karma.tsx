import { createFileRoute } from "@tanstack/react-router";
import { SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { KarmaShowcase } from "@/lib/components/KarmaShowcase.client";
import { imageSizeFromFile } from "image-size/fromFile";
import path from "node:path";

export const metadata = {
	title: `Karma ${SITE_TITLE_APPEND}`,
	description: "A colorful VS Code theme by Sreetam Das",
	openGraph: {
		title: `Karma ${SITE_TITLE_APPEND}`,
		description: "A colorful VS Code theme by Sreetam Das",
		images: { url: `${SITE_URL}/karma/karma-card.jpg` },
	},
	twitter: {
		title: `Karma ${SITE_TITLE_APPEND}`,
		description: "A colorful VS Code theme by Sreetam Das",
		images: { url: `${SITE_URL}/karma/karma-card.jpg` },
	},
};

export const Route = createFileRoute("/(main)/karma")({
	component: KarmaPage,
	loader: async () => {
		return await getShowcaseImagesInfo();
	},
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

			<ViewsCounter slug="/karma" />
		</>
	);
}

async function getShowcaseImagesInfo() {
	return await Promise.all(
		theme_language_map.map(async ({ name, default_image, light_image }) => {
			const default_dimensions = await imageSizeFromFile(path.join("./public", default_image));
			const light_dimensions = await imageSizeFromFile(path.join("./public", light_image));

			return {
				name,
				dark: {
					src: default_image,
					...default_dimensions,
				},
				light: {
					src: default_image,
					...light_dimensions,
				},
			};
		}),
	);
}

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
