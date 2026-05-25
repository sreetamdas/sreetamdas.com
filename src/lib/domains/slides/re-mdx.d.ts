declare module "*.re.mdx" {
	import type { MDXComponents } from "mdx/types";

	import type { Slide } from "./types";

	const slideModule: {
		default: Slide[];
		_components: MDXComponents;
	};

	export default slideModule.default;
	export const _components: typeof slideModule._components;
}
