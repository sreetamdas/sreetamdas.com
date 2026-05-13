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
let _getSlimKarmaHighlighter:
	| typeof import("../shiki/highlighter").getSlimKarmaHighlighter
	| undefined;
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
function parseFrontmatter(text: string): {
	data: Record<string, string | undefined>;
	content: string;
} {
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
			let trimmed = value.trim();
			if (
				(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
				(trimmed.startsWith("'") && trimmed.endsWith("'"))
			) {
				trimmed = trimmed.slice(1, -1);
			}
			data[key] = trimmed || undefined;
		}
	}

	return { data, content: lines.slice(end + 1).join("\n") };
}

/**
 * Extract top-level YAML frontmatter from the beginning of the source.
 * Only applies when the file starts with `---`. Returns the parsed data
 * and the source with the frontmatter block removed.
 */
function extractTopLevelFrontmatter(source: string): {
	data: Record<string, string | undefined>;
	source: string;
} {
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
 * Split slide content into step sections based on -- markers.
 * A -- line starts a new step when it's outside a code fence.
 * Returns an array of step content strings.
 */
function splitSteps(source: string): string[] {
	const lines = source.split("\n");
	const steps: string[] = [];
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

		if (!inFence && trimmed === "--") {
			if (current.length > 0) {
				steps.push(current.join("\n").trim());
				current = [];
			}
		} else {
			current.push(line);
		}
	}

	if (current.length > 0) {
		steps.push(current.join("\n").trim());
	}

	return steps.length > 0 ? steps : [source];
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
 * Parse import statements to extract the named/default identifiers that
 * could be used as MDX components. Returns a map like { SlideTitle: SlideTitle }.
 */
function extractComponentBindings(modules: string[]): string {
	const bindings: string[] = [];

	for (const mod of modules) {
		// Named imports: import { Foo, Bar } from "..."
		const namedMatch = mod.match(/import\s*\{([^}]+)\}\s*from/);
		if (namedMatch) {
			const names = namedMatch[1].split(",").map((n) => {
				const trimmed = n.trim();
				// Handle "X as Y" — use the local binding name
				const asMatch = trimmed.match(/\bas\s+(\w+)/);
				return asMatch ? asMatch[1] : trimmed;
			});
			bindings.push(...names);
		}

		// Default import: import Foo from "..."
		const defaultMatch = mod.match(/import\s+(\w+)\s+from/);
		if (defaultMatch) {
			bindings.push(defaultMatch[1]);
		}

		// Namespace import: import * as Foo from "..."
		const nsMatch = mod.match(/import\s*\*\s*as\s+(\w+)\s+from/);
		if (nsMatch) {
			bindings.push(nsMatch[1]);
		}
	}

	if (bindings.length === 0) return "components: { ..._slideMDXComponents },";

	const entries = bindings
		.filter((b) => /^[A-Z]/.test(b))
		.map((b) => `${JSON.stringify(b)}: ${b}`)
		.join(", ");

	return entries
		? `components: { ..._slideMDXComponents, ${entries} },`
		: "components: { ..._slideMDXComponents },";
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
				const { mdxParse, visit, getSlimKarmaHighlighter, renderCodeBlockToHtml } =
					await loadDeps();

				const highlighter = await getSlimKarmaHighlighter();

				// Extract import/export statements (code-fence aware)
				const { modules, source } = extractTopLevelModules(code);
				const uniqueModules = [...new Set(modules)];
				const componentsProp = extractComponentBindings(uniqueModules);

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

						const { content: noNotesContent, notes } = extractNotes(matterContent);

						// Split into steps based on -- markers
						const stepTexts = splitSteps(noNotesContent);

						const steps = await Promise.all(
							stepTexts.map(async (stepContent) => {
								const mdast = mdxParse(stepContent);
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
									content: stepContent,
									mdast: JSON.stringify(mdast),
									shikiHighlights,
								};
							}),
						);

						return {
							index,
							steps,
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
							const stepIndex = props.stepIndex ?? 0;
							const step = ${JSON.stringify(slide.steps)}[stepIndex] || ${JSON.stringify(slide.steps)}[0];
							return _jsx(MDXContent, {
								source: step.content,
								mdast: step.mdast,
								shikiHighlights: step.shikiHighlights,
								${componentsProp}
								...props
							});
						},
						stepCount: ${slide.steps.length},
						data: ${JSON.stringify(slide.data)},
						notes: ${JSON.stringify(slide.notes)}
					}
				`,
					)
					.join(",\n");

				return `
				import { jsx as _jsx } from "react/jsx-runtime";
				import { MDXContent } from "@/lib/components/MDX";
				import { slideMDXComponents as _slideMDXComponents } from "@/lib/components/MDX/slide-components";
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
