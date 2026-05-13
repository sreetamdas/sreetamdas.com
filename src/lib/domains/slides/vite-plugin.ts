/**
 * Vite plugin that transforms .re.mdx files into slide deck modules.
 *
 * Instead of compiling MDX via @mdx-js/mdx (which requires @mdx-js/react and
 * global CSS), this plugin:
 *
 * 1. Hoists top-level import/export statements to the module scope
 * 2. Splits on --- lines into slides (code-fence aware)
 * 3. Parses YAML frontmatter per slide
 * 4. Splits each slide on -- lines into steps (code-fence aware)
 * 5. Extracts <Notes> blocks from step content
 * 6. Runs mdxParseWithShiki per step to pre-compute MDAST + Shiki highlights
 * 7. Exports slide data and component bindings for the runtime SlideDeck renderer
 *
 * The output module exports:
 *   export default [{ steps, stepCount, data, notes }, ...]
 *   export const _components = { ..._slideMDXComponents, ...userImports }
 */
import { type Plugin } from "vite-plus";

const NOTES_REGEXP = /<Notes>([\s\S]*?)<\/Notes>/g;

/**
 * Split source on delimiter lines, respecting code fences (``` and ~~~).
 * A delimiter line only triggers a split when outside a fence.
 */
function splitOnDelimiter(source: string, delimiter: string): string[] {
	const lines = source.split("\n");
	const segments: string[] = [];
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

		if (!inFence && trimmed === delimiter) {
			if (current.length > 0) {
				segments.push(current.join("\n").trim());
				current = [];
			}
		} else {
			current.push(line);
		}
	}

	if (current.length > 0) {
		segments.push(current.join("\n").trim());
	}

	return segments;
}

/**
 * Split source into slide sections. A --- line starts a new slide.
 */
function splitSlides(source: string): string[] {
	const slides = splitOnDelimiter(source, "---");
	return slides.length > 0 ? slides : [source];
}

/**
 * Split slide content into step sections based on -- markers.
 */
function splitSteps(source: string): string[] {
	const steps = splitOnDelimiter(source, "--");
	return steps.length > 0 ? steps : [source];
}

/**
 * Parse simple YAML frontmatter (key: value pairs only).
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

function extractTopLevelFrontmatter(source: string): {
	data: Record<string, string | undefined>;
	source: string;
} {
	const result = parseFrontmatter(source);
	return { data: result.data, source: result.content };
}

/**
 * Extract top-level import/export statements that are NOT inside code fences.
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
 * could be used as MDX components. Returns a map like { Gradient: "Gradient" }.
 */
function extractComponentBindings(modules: string[]): Record<string, string> {
	const bindings: Record<string, string> = {};

	for (const mod of modules) {
		const namedMatch = mod.match(/import\s*\{([^}]+)\}\s*from/);
		if (namedMatch) {
			for (const name of namedMatch[1].split(",")) {
				const trimmed = name.trim();
				const asMatch = trimmed.match(/\bas\s+(\w+)/);
				const binding = asMatch ? asMatch[1] : trimmed;
				if (/^[A-Z]/.test(binding)) bindings[binding] = binding;
			}
		}

		const defaultMatch = mod.match(/import\s+(\w+)\s+from/);
		if (defaultMatch?.[1] && /^[A-Z]/.test(defaultMatch[1])) {
			bindings[defaultMatch[1]] = defaultMatch[1];
		}

		const nsMatch = mod.match(/import\s*\*\s*as\s+(\w+)\s+from/);
		if (nsMatch?.[1] && /^[A-Z]/.test(nsMatch[1])) {
			bindings[nsMatch[1]] = nsMatch[1];
		}
	}

	return bindings;
}

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
				const { modules, source } = extractTopLevelModules(code);
				const uniqueModules = [...new Set(modules)];

				const userBindings = extractComponentBindings(uniqueModules);

				const topLevelData = extractTopLevelFrontmatter(source);

				const slideTexts = splitSlides(topLevelData.source);

				const { mdxParseWithShiki } = await import("@/lib/components/MDX/parse");

				const slides = await Promise.all(
					slideTexts.map(async (text, index) => {
						const { data: slideData, content: slideContent } = parseFrontmatter(text);

						const data = index === 0 ? { ...topLevelData.data, ...slideData } : slideData;

						const { content: noNotesContent, notes } = extractNotes(slideContent.trim());

						const stepTexts = splitSteps(noNotesContent);

						const steps = await Promise.all(
							stepTexts.map(async (content) => ({
								content,
								...(await mdxParseWithShiki(content)),
							})),
						);

						return { steps, stepCount: steps.length, data, notes };
					}),
				);

				const bindingsBlock = Object.entries(userBindings).length
					? `{ ..._slideMDXComponents, ${Object.entries(userBindings)
							.map(([k]) => `${k}: ${k}`)
							.join(", ")} }`
					: "{ ..._slideMDXComponents }";

				return `
				import { slideMDXComponents as _slideMDXComponents } from "@/lib/components/MDX/slide-components";
				${uniqueModules.join("\n")}

				export default ${JSON.stringify(slides)};

				export const _components = ${bindingsBlock};
			`;
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				throw new Error(`slide-deck-transform failed for ${id}: ${message}`);
			}
		},
	};
}
