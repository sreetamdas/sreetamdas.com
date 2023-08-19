import { Inter, EB_Garamond } from "next/font/google";
import localFont from "next/font/local";

export const inter_font = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});
export const eb_garamond_font = EB_Garamond({
	variable: "--font-eb-garamond",
	subsets: ["latin"],
});
export const iosevka_font = localFont({
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
