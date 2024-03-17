import { Suspense } from "react";

import { KarmaShowcase } from "./Showcase.client";

import { SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
// Image imports
import CSSDefault from "@/public/karma/default/css.webp";
import ElixirDefault from "@/public/karma/default/elixir.webp";
import GoDefault from "@/public/karma/default/go.webp";
import PhoenixDefault from "@/public/karma/default/phoenix.webp";
import PythonDefault from "@/public/karma/default/python.webp";
import ReactDefault from "@/public/karma/default/react.webp";
import RustDefault from "@/public/karma/default/rust.webp";
import SvelteDefault from "@/public/karma/default/svelte.webp";
import TypescriptDefault from "@/public/karma/default/typescript.webp";
import VueDefault from "@/public/karma/default/vue.webp";
import CSSLight from "@/public/karma/light/css.webp";
import ElixirLight from "@/public/karma/light/elixir.webp";
import GoLight from "@/public/karma/light/go.webp";
import PhoenixLight from "@/public/karma/light/phoenix.webp";
import PythonLight from "@/public/karma/light/python.webp";
import ReactLight from "@/public/karma/light/react.webp";
import RustLight from "@/public/karma/light/rust.webp";
import SvelteLight from "@/public/karma/light/svelte.webp";
import TypescriptLight from "@/public/karma/light/typescript.webp";
import VueLight from "@/public/karma/light/vue.webp";

export const runtime = "edge";
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
		// const { name, defaultImage, lightImage } = example;
		const { name, defaultImage, lightImage } = example;

		// const default_image_path = path.join("public", defaultImage);
		// const light_image_path = path.join("public", lightImage);

		// const default_dimensions = sizeOf(default_image_path);
		// const light_dimensions = sizeOf(light_image_path);
		// console.log({ default_image_path, default_dimensions });

		return {
			name,
			dark: {
				src: defaultImage,
				// height: default_dimensions.height,
				// width: default_dimensions.width,
			},
			light: {
				src: lightImage,
				// height: light_dimensions.height,
				// width: light_dimensions.width,
			},
		};
	});

	return (
		<>
			<h1 className="pb-20 pt-10 text-center font-serif text-9xl leading-none">Karma</h1>
			<p className="text-center font-serif text-4xl">A colorful VS Code theme</p>

			<KarmaShowcase examples={examples} />

			<Suspense>
				<ViewsCounter slug="/karma" />
			</Suspense>
		</>
	);
}

const theme_language_map = [
	{
		name: "React",
		// defaultImage: "/karma/default/react.webp",
		defaultImage: ReactDefault,
		// lightImage: "/karma/light/react.webp",
		lightImage: ReactLight,
	},
	{
		name: "Elixir",
		// defaultImage: "/karma/default/elixir.webp",
		defaultImage: ElixirDefault,
		// lightImage: "/karma/light/elixir.webp",
		lightImage: ElixirLight,
	},
	{
		name: "CSS",
		// defaultImage: "/karma/default/css.webp",
		defaultImage: CSSDefault,
		// lightImage: "/karma/light/css.webp",
		lightImage: CSSLight,
	},
	{
		name: "Go",
		// defaultImage: "/karma/default/go.webp",
		defaultImage: GoDefault,
		// lightImage: "/karma/light/go.webp",
		lightImage: GoLight,
	},
	{
		name: "Phoenix",
		// defaultImage: "/karma/default/phoenix.webp",
		defaultImage: PhoenixDefault,
		// lightImage: "/karma/light/phoenix.webp",
		lightImage: PhoenixLight,
	},
	{
		name: "Python",
		// defaultImage: "/karma/default/python.webp",
		defaultImage: PythonDefault,
		// lightImage: "/karma/light/python.webp",
		lightImage: PythonLight,
	},
	{
		name: "Rust",
		// defaultImage: "/karma/default/rust.webp",
		defaultImage: RustDefault,
		// lightImage: "/karma/light/rust.webp",
		lightImage: RustLight,
	},
	{
		name: "Svelte",
		// defaultImage: "/karma/default/svelte.webp",
		defaultImage: SvelteDefault,
		// lightImage: "/karma/light/svelte.webp",
		lightImage: SvelteLight,
	},
	{
		name: "TypeScript",
		// defaultImage: "/karma/default/typescript.webp",
		defaultImage: TypescriptDefault,
		// lightImage: "/karma/light/typescript.webp",
		lightImage: TypescriptLight,
	},
	{
		name: "Vue",
		// defaultImage: "/karma/default/vue.webp",
		defaultImage: VueDefault,
		// lightImage: "/karma/light/vue.webp",
		lightImage: VueLight,
	},
];
