import { promises as fs } from "fs";
import path from "path";

import { bundleMDX } from "mdx-bundler";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";
import { loadTheme, getHighlighter } from "shiki";

import { rehypeImgSize } from "@/components/mdx/images/plugins";
import { remarkShiki } from "@/components/shiki";
import { renderToHTML } from "@/components/shiki/renderer";
import { TBlogPostPageProps } from "@/typings/blog";

const PATH = path.resolve(process.cwd(), "src");
const BLOG_DIR = path.resolve(PATH, "content", "blog");

export async function getBlogPostsSlugs() {
	const postsSlugs = (await fs.readdir(BLOG_DIR))
		.filter((file) => file.endsWith(".mdx"))
		.map((slug) => slug.replace(/\.mdx?$/, ""));
	return postsSlugs;
}

export async function bundleMDXWithOptions(filename: string) {
	const mdxSource = await fs.readFile(filename, "utf8");
	const theme = await loadTheme("../@sreetamdas/karma/themes/Karma-color-theme.json");
	const highlighter = await getHighlighter({ theme });

	const result = await bundleMDX({
		source: mdxSource,
		cwd: path.dirname(filename),
		xdmOptions(options) {
			options.remarkPlugins = [
				...(options.remarkPlugins ?? []),
				[remarkShiki, { highlighter, renderToHTML }],
				remarkGfm,
				remarkSlug,
				[remarkToc, { tight: true }],
			];
			options.rehypePlugins = [
				...(options.rehypePlugins ?? []),
				[
					rehypeRaw,
					{
						passThrough: [
							"mdxFlowExpression",
							"mdxJsxFlowElement",
							"mdxJsxTextElement",
							"mdxTextExpression",
							"mdxjsEsm",
						],
					},
				],
				[rehypeImgSize, { dir: "public" }],
			];

			return options;
		},
		esbuildOptions(options) {
			options.platform = "node";

			return options;
		},
	});
	return result;
}

type TGetMDXFileDataOptions = {
	cwd: string;
};
export async function getMDXFileData(fileSlug: string, options?: TGetMDXFileDataOptions) {
	const DIR = path.resolve(PATH, ...(options?.cwd ?? "content").split("/"));
	const name = path.resolve(DIR ?? BLOG_DIR, `${fileSlug}.mdx`);
	const result = await bundleMDXWithOptions(name);

	return { ...result, slug: fileSlug };
}

export async function getAllBlogPostsPreviewData() {
	const files = (await fs.readdir(BLOG_DIR)).filter((file) => file.endsWith(".mdx"));

	const postsData = (
		await Promise.all(
			files.map(async (file) => {
				const slug = file.replace(/\.mdx?$/, "");
				const result = await getMDXFileData(slug, {
					cwd: "content/blog",
				});

				return {
					slug: result.slug,
					frontmatter: result.frontmatter,
				} as Pick<TBlogPostPageProps, "frontmatter" | "slug">;
			})
		)
	)
		.filter(({ frontmatter: { published } }) => process.env.NODE_ENV === "development" || published)
		.sort((a, b) => {
			return (
				new Date(b.frontmatter.publishedAt).getTime() -
				new Date(a.frontmatter.publishedAt).getTime()
			);
		});
	return postsData;
}

export async function getRootPagesSlugs() {
	/**
	 * so Next.js (correctly) prevents us from building a website wherein we're
	 * trying to dynamically trying to create a page that _already_ exists
	 * "statically" - in our repo this can be seen when using our traditional
	 * approach we were creating pages for all the .mdx files in from the /content
	 * dir, but we've already defined a pages/about.tsx
	 *
	 * to counter this, we'll add logic here in order to only create static paths
	 * for pages that _dont_ exist already
	 */

	const MAIN_DIR = path.resolve(process.cwd(), "src", "content");
	const ROOT_PAGES_DIR = path.resolve(process.cwd(), "src", "pages");

	const files = (await fs.readdir(MAIN_DIR)).filter((file) => file.endsWith(".mdx"));
	const existingRootPageFiles = (await fs.readdir(ROOT_PAGES_DIR))
		.filter((file) => file.endsWith(".tsx"))
		.map((file) => file.replace(/\.tsx?$/, ""));

	const pagesData: Array<{ page: string }> = files
		.map((file) => {
			return {
				page: file.replace(/\.mdx?$/, ""),
			};
		})
		.filter(({ page }) => existingRootPageFiles.indexOf(page) === -1);

	const pagesDataWithContent = pagesData.map((data) => {
		return {
			...data,
		};
	});

	return pagesDataWithContent;
}
