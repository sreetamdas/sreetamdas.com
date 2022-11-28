import { Inter } from "@next/font/google";
import localFont from "@next/font/local";

export const interFont = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});
export const iosevkaFont = localFont({
	variable: "--font-iosevka",
	src: [
		{
			path: "../../public/fonts/iosevka/woff2/iosevka-regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/iosevka/woff2/iosevka-italic.woff2",
			weight: "400",
			style: "italic",
		},
	],
});
