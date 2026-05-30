"use client";

import WorldMap, { regions, type Data, type ISOCode } from "react-svg-worldmap";

import type { StatsCountryRow } from "@/lib/domains/Plausible/stats";

type StatsWorldMapProps = {
	countries: Array<StatsCountryRow>;
};

export function StatsWorldMap({ countries }: StatsWorldMapProps) {
	const data: Data = countries.flatMap((country) => {
		const code = country.code.toUpperCase();
		if (!isSupportedCountryCode(code)) {
			return [];
		}

		return { country: code, value: country.visitors };
	});

	if (data.length === 0) {
		return null;
	}

	return (
		<div className="[&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full [&_svg_path]:transition-colors">
			<WorldMap
				data={data}
				size="responsive"
				backgroundColor="transparent"
				borderColor="color-mix(in srgb, var(--color-foreground) 24%, transparent)"
				color="var(--color-primary)"
				strokeOpacity={0.65}
				tooltipBgColor="var(--color-foreground)"
				tooltipTextColor="var(--color-background)"
				valueSuffix=" visitors"
				styleFunction={({ countryValue, minValue, maxValue, color }) => {
					const value = typeof countryValue === "number" ? countryValue : 0;
					const range = Math.max(1, maxValue - minValue);
					const intensity = value === 0 ? 0 : (value - minValue) / range;

					return {
						fill:
							value === 0 ? "color-mix(in srgb, var(--color-foreground) 9%, transparent)" : color,
						fillOpacity: value === 0 ? 1 : 0.28 + intensity * 0.72,
						stroke: "color-mix(in srgb, var(--color-foreground) 24%, transparent)",
						strokeWidth: 0.6,
						cursor: value === 0 ? "default" : "help",
					};
				}}
				tooltipTextFunction={({ countryName, countryValue }) => {
					const visitors = typeof countryValue === "number" ? countryValue : 0;
					return `${countryName}: ${new Intl.NumberFormat("en-US").format(visitors)} visitors`;
				}}
			/>
		</div>
	);
}

function isSupportedCountryCode(code: string): code is ISOCode {
	return regions.some((region) => region.code === code);
}
