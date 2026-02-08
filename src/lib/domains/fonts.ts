import { Bricolage_Grotesque, Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter_font = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});
export const bricolage_grotesque_font = Bricolage_Grotesque({
	variable: "--font-bricolage-grotesque",
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
		{
			path: "../../../public/fonts/iosevka/iosevka-das-version-bold.subset.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../../public/fonts/iosevka/iosevka-das-version-bold-italic.subset.woff2",
			weight: "700",
			style: "italic",
		},
	],
});
