import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const interFont = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});
export const iosevkaFont = localFont({
	variable: "--font-iosevka",
	src: [
		{
			path: "../../../public/fonts/iosevka/iosevka-das-version-regular.subset.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../../public/fonts/iosevka/iosevka-das-version-italic.subset.woff2",
			weight: "400",
			style: "italic",
		},
	],
});
export const madeDillanFont = localFont({
	variable: "--font-made-dillan",
	src: [
		{
			path: "../../../public/fonts/made-dillan/MADE-Dillan.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../../public/fonts/made-dillan/MADE-Dillan.otf",
			weight: "700",
			style: "normal",
		},
	],
});
