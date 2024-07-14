import type { ReactElement } from "react";

declare module "*.mdx" {
	let MDXComponent: (props: unknown) => ReactElement;
	export default MDXComponent;
}
