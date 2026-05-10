/**
 * Vite plugin that transforms .re.mdx files into slide deck modules.
 *
 * Instead of compiling MDX via @mdx-js/mdx (which requires @mdx-js/react and
 * global CSS), this plugin:
 *
 * 1. Extracts top-level import/export statements and hoists them to the module scope
 * 2. Splits the file on --- lines into individual slides (code-fence aware)
 * 3. Parses YAML frontmatter per slide using gray-matter
 * 4. Pre-computes MDAST + Shiki highlights at build time
 * 5. Generates a module where each slide is a lazy React component
 *
 * The output module exports:
 *   export default [{ Component: Slide1, data: {...} }, ...]
 */
import { type Plugin } from "vite-plus";

/**
 * Matches import/export statements at the start of a line, skipping content
 * inside backticks. Group 1 captures the import/export statement.
 */
const MODULE_REGEXP = /\\`|`(?:\\`|[^`])*`|(^(?:import|export)[^;]+;)/gm;

export function slideDeckPlugin(): Plugin {
	return {
		name: "slide-deck-transform",
		enforce: "pre",
		async transform(code: string, id: string) {
			if (!id.endsWith(".re.mdx")) return;

			const { default: matter } = await import("gray-matter");
			const { mdxParse } = await import("safe-mdx/parse");
			const { visit } = await import("unist-util-visit");
			const { getSlimKarmaHighlighter } = await import("../shiki/highlighter");
			const { renderCodeBlockToHtml } = await import("../shiki/plugin");

			const highlighter = await getSlimKarmaHighlighter();

			// Extract top-level import/export statements, then remove them from source
			const inlineModules: string[] = [];
			const sourceWithoutModules = code.replaceAll(MODULE_REGEXP, (value, group1) => {
				if (!group1) return value;
				inlineModules.push(value);
				return "";
			});
			const uniqueModules = [...new Set(inlineModules)];

			/**
			 * Split source into slide sections, respecting code fences.
			 * A --- line only starts a new slide when it's outside a ``` fence.
			 */
			function splitSlides(source: string): string[] {
				const lines = source.split("\n");
				const slides: string[] = [];
				let current: string[] = [];
				let inFence = false;
				let fenceChar = "";

				for (const line of lines) {
					const trimmed = line.trim();

					// Track code fences
					if (trimmed.startsWith("```")) {
						if (!inFence) {
							inFence = true;
							fenceChar = "```";
						} else if (fenceChar === "```") {
							inFence = false;
							fenceChar = "";
						}
					} else if (trimmed.startsWith("~~~")) {
						if (!inFence) {
							inFence = true;
							fenceChar = "~~~";
						} else if (fenceChar === "~~~") {
							inFence = false;
							fenceChar = "";
						}
					}

					if (!inFence && trimmed === "---") {
						if (current.length > 0) {
							slides.push(current.join("\n").trim());
							current = [];
						}
					} else {
						current.push(line);
					}
				}

				if (current.length > 0) {
					slides.push(current.join("\n").trim());
				}

				return slides;
			}

			const slideTexts = splitSlides(sourceWithoutModules);

			const compiledSlides = await Promise.all(
				slideTexts.map(async (text, index) => {
					const parsed = matter(text);
					const content = parsed.content.trim();
					const data = parsed.data as Record<string, string | undefined>;

					// Build MDAST
					const mdast = mdxParse(content);

					// Pre-compute Shiki highlights
					const shikiHighlights: Record<string, string> = {};
					visit(mdast, "code", (node: unknown) => {
						const codeNode = node as {
							type: string;
							lang?: string;
							meta?: string | null;
							value: string;
							position?: { start: { line: number; column: number } };
						};
						if (typeof codeNode.value !== "string") return;

						const html = renderCodeBlockToHtml(
							highlighter,
							codeNode.value,
							codeNode.lang,
							codeNode.meta ?? null,
						);
						if (html === null) return;

						const key = `${codeNode.position?.start.line ?? 0}:${codeNode.position?.start.column ?? 0}`;
						shikiHighlights[key] = html;
					});

					return {
						index,
						content,
						mdast: JSON.stringify(mdast),
						shikiHighlights,
						data,
					};
				}),
			);

			const slideComponents = compiledSlides
				.map(
					(slide) => `
					{
						Component: function Slide${slide.index}(props) {
							return _jsx(MDXContent, {
								source: ${JSON.stringify(slide.content)},
								mdast: ${JSON.stringify(slide.mdast)},
								shikiHighlights: ${JSON.stringify(slide.shikiHighlights)},
								...props
							});
						},
						data: ${JSON.stringify(slide.data)}
					}
				`,
			)
				.join(",\n");

			return `
				import { jsx as _jsx } from "react/jsx-runtime";
				import { MDXContent } from "@/lib/components/MDX";
				${uniqueModules.join("\n")}

				export default [${slideComponents}];
			`;
		},
	};
}
