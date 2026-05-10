import { type ReactElement } from "react";

declare module "*.mdx" {
	let MDXComponent: (props: unknown) => ReactElement;
	export default MDXComponent;
}

interface ReMdxSlideData {
	theme?: string;
	transition?: string;
	image?: string;
	[key: string]: string | undefined;
}

interface ReMdxSlide {
	Component: () => ReactElement;
	data: ReMdxSlideData;
	notes: string | null;
}

declare module "*.re.mdx" {
	const slides: ReMdxSlide[];
	export default slides;
}
