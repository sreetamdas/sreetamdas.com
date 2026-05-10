/**
 * Vite plugin that transforms .re.mdx files into slide deck modules.
 *
 * Instead of compiling MDX via @mdx-js/mdx (which requires @mdx-js/react and
 * global CSS), this plugin:
 *
 * 1. Extracts top-level import/export statements and hoists them to the module scope
 * 2. Splits the file on --- lines into individual slides (code-fence aware)
 * 3. Parses YAML frontmatter per slide using gray-matter
 * 4. Extracts <Notes> blocks from slide content
 * 5. Pre-computes MDAST + Shiki highlights at build time
 * 6. Generates a module where each slide is a lazy React component
 *
 * The output module exports:
 *   export default [{ Component: Slide1, data: {...}, notes: "..." }, ...]
 */
import { type Plugin } from "vite-plus";

/**
 * Matches <Notes>...</Notes> blocks. Extracts content between tags.
 * Supports multiline content.
 */
const NOTES_REGEXP = /<Notes>([\s\S]*?)<\/Notes>/g;

/**
 * Cached lazy imports — resolved once on first transform call.
 */
let _mdxParse: typeof import("safe-mdx/parse").mdxParse | undefined;
let _visit: typeof import("unist-util-visit").visit | undefined;
let _getSlimKarmaHighlighter: typeof import("../shiki/highlighter").getSlimKarmaHighlighter | undefined;
let _renderCodeBlockToHtml: typeof import("../shiki/plugin").renderCodeBlockToHtml | undefined;

async function loadDeps() {
	if (!_mdxParse) {
		const parseMod = await import("safe-mdx/parse");
		_mdxParse = parseMod.mdxParse;
	}
	if (!_visit) {
		const visitMod = await import("unist-util-visit");
		_visit = visitMod.visit;
	}
	if (!_getSlimKarmaHighlighter) {
		const highlighterMod = await import("../shiki/highlighter");
		_getSlimKarmaHighlighter = highlighterMod.getSlimKarmaHighlighter;
	}
	if (!_renderCodeBlockToHtml) {
		const pluginMod = await import("../shiki/plugin");
		_renderCodeBlockToHtml = pluginMod.renderCodeBlockToHtml;
	}
	return {
		mdxParse: _mdxParse!,
		visit: _visit!,
		getSlimKarmaHighlighter: _getSlimKarmaHighlighter!,
		renderCodeBlockToHtml: _renderCodeBlockToHtml!,
	};
}

/**
 * Parse simple YAML frontmatter (key: value pairs only).
 * Returns parsed data and the remaining content.
 */
function parseFrontmatter(text: string): { data: Record<string, string | undefined>; content: string } {
	const lines = text.split("\n");
	if (lines[0]?.trim() !== "---") {
		return { data: {}, content: text };
	}

	let end = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i]?.trim() === "---") {
			end = i;
			break;
		}
	}

	if (end === -1) {
		return { data: {}, content: text };
	}

	const data: Record<string, string | undefined> = {};
	for (let i = 1; i < end; i++) {
		const line = lines[i];
		const match = line.match(/^(\w[\w-]*):\s*(.*)$/);
		if (match) {
			const [, key, value] = match;
			data[key] = value.trim() || undefined;
		}
	}

	return { data, content: lines.slice(end + 1).join("\n") };
}

/**
 * Extract top-level YAML frontmatter from the beginning of the source.
 * Only applies when the file starts with `---`. Returns the parsed data
 * and the source with the frontmatter block removed.
 */
function extractTopLevelFrontmatter(source: string): { data: Record<string, string | undefined>; source: string } {
	const result = parseFrontmatter(source);
	return { data: result.data, source: result.content };
}

/**
 * Split source into slide sections, respecting code fences.
 * A --- line only starts a new slide when it's outside a ``` or ~~~ fence.
 */
function splitSlides(source: string): string[] {
	const lines = source.split("\n");
	const slides: string[] = [];
	let current: string[] = [];
	let inFence = false;
	let fenceChar = "";

	for (const line of lines) {
		const trimmed = line.trim();

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

/**
 * Extract top-level import/export statements that are NOT inside code fences.
 * Returns { modules: string[], source: string } with imports hoisted and removed.
 */
function extractTopLevelModules(source: string): { modules: string[]; source: string } {
	const lines = source.split("\n");
	const modules: string[] = [];
	const kept: string[] = [];
	let inFence = false;
	let fenceChar = "";

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.startsWith("```")) {
			if (!inFence) {
				inFence = true;
				fenceChar = "```";
			} else if (fenceChar === "```") {
				inFence = false;
				fenceChar = "";
			}
			kept.push(line);
			continue;
		}
		if (trimmed.startsWith("~~~")) {
			if (!inFence) {
				inFence = true;
				fenceChar = "~~~";
			} else if (fenceChar === "~~~") {
				inFence = false;
				fenceChar = "";
			}
			kept.push(line);
			continue;
		}

		if (!inFence && /^(?:import|export)\s/.test(trimmed) && trimmed.endsWith(";")) {
			modules.push(line);
		} else {
			kept.push(line);
		}
	}

	return { modules, source: kept.join("\n") };
}

/**
 * Extracts <Notes> blocks from slide content and returns
 * the cleaned content (without notes) and the notes text.
 */
function extractNotes(text: string): { content: string; notes: string | null } {
	const notes: string[] = [];
	const content = text.replaceAll(NOTES_REGEXP, (_match, noteContent) => {
		notes.push(noteContent.trim());
		return "";
	});
	return {
		content: content.trim(),
		notes: notes.length > 0 ? notes.join("\n\n") : null,
	};
}

export function slideDeckPlugin(): Plugin {
	return {
		name: "slide-deck-transform",
		enforce: "pre",
		async transform(code: string, id: string) {
			if (!id.endsWith(".re.mdx")) return;

			try {
				const { matter, mdxParse, visit, getSlimKarmaHighlighter, renderCodeBlockToHtml } =
					await loadDeps();

				const highlighter = await getSlimKarmaHighlighter();

				// Extract import/export statements (code-fence aware)
				const { modules, source } = extractTopLevelModules(code);
				const uniqueModules = [...new Set(modules)];

				// Extract top-level frontmatter (code-fence aware)
				const topLevelData = extractTopLevelFrontmatter(source);

				// Split into slides
				const slideTexts = splitSlides(topLevelData.source);

				const compiledSlides = await Promise.all(
					slideTexts.map(async (text, index) => {
						const { data: slideData, content: slideContent } = parseFrontmatter(text);
						const matterContent = slideContent.trim();

						// Merge top-level frontmatter into the first slide.
						const data = index === 0 ? { ...topLevelData.data, ...slideData } : slideData;

						const { content, notes } = extractNotes(matterContent);

						const mdast = mdxParse(content);

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
							notes,
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
						data: ${JSON.stringify(slide.data)},
						notes: ${JSON.stringify(slide.notes)}
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
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				throw new Error(`slide-deck-transform failed for ${id}: ${message}`);
			}
		},
	};
}
