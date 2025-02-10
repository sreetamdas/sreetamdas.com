import path from "node:path";

import sizeOf from "image-size";
import { type Node } from "unist";
import { visit } from "unist-util-visit";

type TreeNode = Node & {
	tagName: string;
	properties: Record<string, string | number | undefined> & {
		src: string;
	};
};

/**
 * Customized for use case from https://github.com/ksoichiro/rehype-img-size
 */
export function rehypeImgSize(options: { dir?: string }) {
	const opts = options || {};
	const dir = opts.dir;

	return (tree: TreeNode) => {
		function visitor(node: TreeNode) {
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

		visit(tree, "element", visitor);
	};
}
