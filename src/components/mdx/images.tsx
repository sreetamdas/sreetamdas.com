/**
 * Customized for use case from https://github.com/ksoichiro/rehype-img-size
 */
import path from "path";

import sizeOf from "image-size";
import { visit } from "unist-util-visit";

export function rehypeImgSize(options: { dir?: string }) {
	const opts = options || {};
	const dir = opts.dir;
	return transformer;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function transformer(tree: any) {
		visit(tree, "element", visitor);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function visitor(node: any) {
			if (node.tagName === "img" && node.properties.src.slice(-3) !== "mp4") {
				let src = node.properties.src;
				if (src.startsWith("http")) {
					return;
				}
				if (dir && src.startsWith("/")) {
					src = path.join(dir, src);
				}
				const dimensions = sizeOf(src);
				node.properties.width = dimensions.width;
				node.properties.height = dimensions.height;
			}
		}
	}
}
