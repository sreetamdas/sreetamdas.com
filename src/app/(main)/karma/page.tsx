import path from "node:path";

import sizeOf from "image-size";

import { KarmaShowcase } from "./Showcase.client";

import { SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

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

export default function KarmaPage() {
	const examples = theme_language_map.map((example) => {
		const { name, defaultImage, lightImage } = example;

		const default_image_path = path.join(path.resolve(), "public", defaultImage);
		const light_image_path = path.join(path.resolve(), "public", lightImage);

		const default_dimensions = sizeOf(default_image_path);
		const light_dimensions = sizeOf(light_image_path);

		return {
			name,
			dark: {
				src: defaultImage,
				height: default_dimensions.height,
				width: default_dimensions.width,
			},
			light: {
				src: lightImage,
				height: light_dimensions.height,
				width: light_dimensions.width,
			},
		};
	});

	return (
		<>
			<h1 className="pb-20 pt-10 text-center font-serif text-9xl leading-none">Karma</h1>
			<p className="text-center font-serif text-4xl">A colorful VS Code theme</p>

			<KarmaShowcase examples={examples} />

			<ViewsCounter slug="/karma" />
		</>
	);
}

const theme_language_map = [
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
];
