import { promises as fs } from "fs";
import path from "path";

import { bundleMDX } from "mdx-bundler";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";

import { rehypeImgSize } from "@/components/mdx/images/plugins";
import { getKarmaHighlighter } from "@/components/shiki/highlighter";
import { remarkShiki } from "@/components/shiki/plugin";
import { renderToHtml } from "@/components/shiki/renderer";
import { MDXBundledResultProps } from "@/typings/blog";

const PATH = path.resolve(process.cwd(), "src");
const BLOG_DIR = path.resolve(PATH, "content", "blog");

export async function getBlogPostsSlugs() {
	const postsSlugs = (await fs.readdir(BLOG_DIR))
		.filter((file) => file.endsWith(".mdx"))
		.map((slug) => slug.replace(/\.mdx?$/, ""));
	return postsSlugs;
}

export async function bundleMDXWithOptions<Frontmatter extends { [key: string]: unknown }>(
	filename: string
) {
	const mdxSource = await fs.readFile(filename, "utf8");
	const highlighter = await getKarmaHighlighter();

	const result = await bundleMDX<Frontmatter>({
		source: mdxSource,
		cwd: path.dirname(filename),
		mdxOptions(options, _frontmatter) {
			options.remarkPlugins = [
				...(options.remarkPlugins ?? []),
				[remarkShiki, { highlighter, renderToHtml }],
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

type GetMDXFileDataOptions = {
	cwd: string;
};
export async function getMDXFileData<Frontmatter extends { [key: string]: unknown }>(
	fileSlug: string,
	options?: GetMDXFileDataOptions
) {
	const DIR = path.resolve(PATH, ...(options?.cwd ?? "content").split("/"));
	const name = path.resolve(DIR ?? BLOG_DIR, `${fileSlug}.mdx`);
	const result = await bundleMDXWithOptions<Frontmatter>(name);

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
				} as Pick<MDXBundledResultProps, "frontmatter" | "slug">;
			})
		)
	)
		.filter(({ frontmatter: { published } }) => process.env.NODE_ENV === "development" || published)
		.sort(
			(a, b) =>
				new Date(b.frontmatter.publishedAt).getTime() -
				new Date(a.frontmatter.publishedAt).getTime()
		);
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
		.map((file) => ({
			page: file.replace(/\.mdx?$/, ""),
		}))
		.filter(({ page }) => existingRootPageFiles.indexOf(page) === -1);

	const pagesDataWithContent = pagesData.map((data) => ({
		...data,
	}));

	return pagesDataWithContent;
}
