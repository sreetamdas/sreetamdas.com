"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useState } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Image } from "@/lib/components/Image";
import ImageCSS from "@/public/karma/default/css.webp";
import ImageElixir from "@/public/karma/default/elixir.webp";
import ImageGo from "@/public/karma/default/go.webp";
import ImagePhoenix from "@/public/karma/default/phoenix.webp";
import ImagePython from "@/public/karma/default/python.webp";
import ImageReact from "@/public/karma/default/react.webp";
import ImageRust from "@/public/karma/default/rust.webp";
import ImageSvelte from "@/public/karma/default/svelte.webp";
import ImageTypeScript from "@/public/karma/default/typescript.webp";
import ImageVue from "@/public/karma/default/vue.webp";
import ImageCSSLight from "@/public/karma/light/css.webp";
import ImageElixirLight from "@/public/karma/light/elixir.webp";
import ImageGoLight from "@/public/karma/light/go.webp";
import ImagePhoenixLight from "@/public/karma/light/phoenix.webp";
import ImagePythonLight from "@/public/karma/light/python.webp";
import ImageReactLight from "@/public/karma/light/react.webp";
import ImageRustLight from "@/public/karma/light/rust.webp";
import ImageSvelteLight from "@/public/karma/light/svelte.webp";
import ImageTypeScriptLight from "@/public/karma/light/typescript.webp";
import ImageVueLight from "@/public/karma/light/vue.webp";

export const KARMA_COLOR_PALETTE = [
	"#FC618D",
	"#51C7DA",
	"#AF98E6",
	"#E3CF65",
	"#7BD88F",
	"#FD9353",
] as const;
export const KARMA_LIGHT_COLOR_PALETTE = [
	"#FC618D",
	"#5688C7",
	"#6F42C1",
	"#FFAA33",
	"#2D972F",
	"#FA8D3E",
] as const;

export const KarmaShowcase = () => {
	// default is dark mode :)
	const [isDefaultTheme, setIsDefaultTheme] = useState(true);

	function handleThemeToggle(checked: boolean) {
		setIsDefaultTheme(checked);
	}

	return (
		<>
			<div className="flex flex-wrap items-center justify-center gap-4 pt-12 sm:justify-between">
				{(isDefaultTheme ? KARMA_COLOR_PALETTE : KARMA_LIGHT_COLOR_PALETTE).map((color) => (
					<div
						key={color}
						data-dark-theme={isDefaultTheme ? isDefaultTheme : undefined}
						className="grid h-28 w-20 place-content-center rounded-global font-mono text-background data-[dark-theme=true]:text-foreground"
						style={{ backgroundColor: color }}
					>
						{color}
					</div>
				))}
			</div>
			<div className="flex justify-center gap-20 py-10">
				<LinkTo href="https://marketplace.visualstudio.com/items?itemName=SreetamD.karma">
					Install from VS Code marketplace
				</LinkTo>

				<LinkTo href="https://github.com/sreetamdas/karma">View source</LinkTo>
			</div>
			<div className="flex gap-8 pb-12">
				<p className="sm:shrink-0">Check out examples:</p>
				<ul className="flex flex-wrap gap-x-8 gap-y-2">
					{themeLanguageMap.map(({ name }) => (
						<li key={name.toLowerCase()} className="inline list-none">
							<LinkTo href={`#${name.toLowerCase()}`}>{name}</LinkTo>
						</li>
					))}
				</ul>
			</div>
			<div className="flex items-center justify-center">
				<label htmlFor="theme-switch" className="text-[15px] leading-none text-foreground">
					Light mode
				</label>
				<SwitchPrimitive.Root
					id="theme-switch"
					checked={isDefaultTheme}
					onCheckedChange={handleThemeToggle}
					className="relative mx-4 h-[25px] w-[42px] cursor-default rounded-full bg-primary outline-none"
				>
					<SwitchPrimitive.Thumb className="block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-primary bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
				</SwitchPrimitive.Root>
				<label htmlFor="theme-switch" className="text-[15px] leading-none text-foreground">
					Dark mode
				</label>
			</div>
			<div className="!col-span-full flex flex-col gap-y-24 pt-24">
				{themeLanguageMap.map(({ name, defaultImage, lightImage }, index) => {
					const image = isDefaultTheme ? defaultImage : lightImage;

					return (
						<article key={name.toLowerCase()} className="flex flex-col items-center">
							<h2 id={name.toLowerCase()} className="font-serif text-5xl">
								{name}
							</h2>
							<span className="h-auto w-full max-w-[95vw] rounded-global sm:max-w-[75vw]">
								<Image
									src={image}
									alt={`Karma ${isDefaultTheme ? "" : "Light "}theme screenshot for ${name}`}
									priority={index === 0}
									quality={100}
									placeholder="blur"
									unoptimized
									isWrapped
								/>
							</span>
						</article>
					);
				})}
			</div>
		</>
	);
};

const themeLanguageMap = [
	{
		name: "React",
		defaultImage: ImageReact,
		lightImage: ImageReactLight,
	},
	{
		name: "Elixir",
		defaultImage: ImageElixir,
		lightImage: ImageElixirLight,
	},
	{
		name: "CSS",
		defaultImage: ImageCSS,
		lightImage: ImageCSSLight,
	},
	{
		name: "Go",
		defaultImage: ImageGo,
		lightImage: ImageGoLight,
	},
	{
		name: "Phoenix",
		defaultImage: ImagePhoenix,
		lightImage: ImagePhoenixLight,
	},
	{
		name: "Python",
		defaultImage: ImagePython,
		lightImage: ImagePythonLight,
	},
	{
		name: "Rust",
		defaultImage: ImageRust,
		lightImage: ImageRustLight,
	},
	{
		name: "Svelte",
		defaultImage: ImageSvelte,
		lightImage: ImageSvelteLight,
	},
	{
		name: "TypeScript",
		defaultImage: ImageTypeScript,
		lightImage: ImageTypeScriptLight,
	},
	{
		name: "Vue",
		defaultImage: ImageVue,
		lightImage: ImageVueLight,
	},
];
