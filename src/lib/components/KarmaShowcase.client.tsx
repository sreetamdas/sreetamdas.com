"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useState } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { Image } from "@/lib/components/Image";

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

type Props = {
	examples: Array<{
		name: string;
		dark: {
			src: string;
		};
		light: {
			src: string;
		};
	}>;
};
export const KarmaShowcase = ({ examples }: Props) => {
	// default is dark mode :)
	const [isDefaultTheme, setIsDefaultTheme] = useState(true);

	function handleThemeToggle(checked: boolean) {
		setIsDefaultTheme(checked);
	}

	console.log({ examples });

	return (
		<>
			<div className="flex flex-wrap items-center justify-center gap-4 pt-12 sm:justify-between">
				{(isDefaultTheme ? KARMA_COLOR_PALETTE : KARMA_LIGHT_COLOR_PALETTE).map((color) => (
					<div
						key={color}
						data-dark-theme={isDefaultTheme ? isDefaultTheme : undefined}
						className="rounded-global text-foreground data-[dark-theme=true]:text-background grid h-28 w-20 place-content-center font-mono"
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
					{examples.map(({ name }) => (
						<li key={name.toLowerCase()} className="inline list-none">
							<LinkTo href={`#${name.toLowerCase()}`}>{name}</LinkTo>
						</li>
					))}
				</ul>
			</div>
			<div className="flex items-center justify-center">
				<label htmlFor="theme-switch" className="text-foreground text-[15px] leading-none">
					Light mode
				</label>
				<SwitchPrimitive.Root
					id="theme-switch"
					checked={isDefaultTheme}
					onCheckedChange={handleThemeToggle}
					className="bg-primary relative mx-4 h-[25px] w-[42px] cursor-default rounded-full outline-none"
				>
					<SwitchPrimitive.Thumb className="block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-(--transition-duration) will-change-transform data-[state=checked]:translate-x-[19px]" />
				</SwitchPrimitive.Root>
				<label htmlFor="theme-switch" className="text-foreground text-[15px] leading-none">
					Dark mode
				</label>
			</div>
			<div className="col-span-full! flex flex-col gap-y-24 pt-24">
				{examples.map(({ name, dark, light }, index) => {
					const image = isDefaultTheme ? dark : light;

					return (
						<article key={name.toLowerCase()} className="flex flex-col items-center">
							<h2 id={name.toLowerCase()} className="font-serif text-5xl font-bold tracking-tight">
								{name}
							</h2>
							<span className="rounded-global h-auto w-full max-w-[95vw] sm:max-w-[75vw]">
								<Image
									src={image.src}
									alt={`Karma ${isDefaultTheme ? "" : "Light "}theme screenshot for ${name}`}
									fetchPriority={index < 3 ? "high" : "auto"}
								/>
							</span>
						</article>
					);
				})}
			</div>
		</>
	);
};
