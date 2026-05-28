import { type MDXComponents } from "mdx/types";
import { SafeMdxRenderer } from "safe-mdx";
import { mdxParse } from "safe-mdx/parse";

import { ShikiCodeBlock } from "@/lib/domains/shiki/CodeBlock";

import type { ShikiHighlightMap } from "./parse";

import { customMDXComponents } from "./components";

export { customMDXComponents };

type CodeNode = {
	type: "code";
	lang?: string;
	meta?: string | null;
	value: string;
	position?: { start: { line: number; column: number } };
};

function isCodeNode(value: unknown): value is CodeNode {
	if (typeof value !== "object" || value === null || !("type" in value)) {
		return false;
	}

	return value.type === "code";
}

type MDXContentCodeType = {
	source?: string;
	/**
	 * JSON-serialized MDAST from build time. When provided, skips runtime mdxParse.
	 */
	mdast?: string;
	/**
	 * Map of "line:column" → Shiki HTML for each code block, pre-computed at build time.
	 */
	shikiHighlights?: ShikiHighlightMap;
	components?: MDXComponents;
	shikiCodeBlockClassName?: string;
};
export const MDXContent = ({
	source,
	mdast,
	shikiHighlights,
	components = {},
	shikiCodeBlockClassName,
}: MDXContentCodeType) => {
	const mergedComponents = { ...customMDXComponents, ...components };

	if (!source) {
		return null;
	}

	const tree = mdast ? JSON.parse(mdast) : mdxParse(source);

	return (
		<SafeMdxRenderer
			markdown={source}
			mdast={tree}
			components={mergedComponents}
			renderNode={
				shikiHighlights
					? (node) => {
							if (!isCodeNode(node)) return undefined;
							const codeNode = node;
							const pos = codeNode.position?.start;
							if (!pos) return undefined;
							const key = `${pos.line}:${pos.column}`;
							const html = shikiHighlights[key];
							if (!html) return undefined;
							return (
								<ShikiCodeBlock
									html={html}
									meta={codeNode.meta}
									className={shikiCodeBlockClassName}
								/>
							);
						}
					: undefined
			}
		/>
	);
};
