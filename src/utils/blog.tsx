import { promises as fs } from "fs";
import path from "path";

import { bundleMDX } from "mdx-bundler";
import remarkSlug from "remark-slug";

import { TBlogPostFrontmatter, TBlogPostPageProps } from "typings/blog";

const PATH = path.resolve(process.cwd(), "src");
const BLOG_DIR = path.resolve(PATH, "content", "blog");

export function getBlogPreviewImageURL({ slug }: { slug: TBlogPostFrontmatter["slug"] }) {
	return `${process.env.SITE_URL}/blog/${slug}/preview.png`;
}

export async function getBlogPostsSlugs() {
	const postsSlugs = (await fs.readdir(BLOG_DIR))
		.filter((file) => file.endsWith(".mdx"))
		.map((slug) => slug.replace(/\.mdx?$/, ""));
	return postsSlugs;
}

type TGetMDXFileDataOptions = {
	cwd: string;
};
export async function getMDXFileData(fileSlug: string, options?: TGetMDXFileDataOptions) {
	const DIR = path.resolve(PATH, ...(options?.cwd ?? "content").split("/"));

	const name = path.resolve(DIR ?? BLOG_DIR, `${fileSlug}.mdx`);
	const mdxSource = await fs.readFile(name, "utf8");

	const result = await bundleMDX(mdxSource, {
		cwd: path.dirname(name),
		xdmOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkSlug];
			options.rehypePlugins = [...(options.rehypePlugins ?? [])];

			return options;
		},
		esbuildOptions(options) {
			options.platform = "node";

			return options;
		},
	});

	return result;
}

export async function getAllBlogPostsData() {
	const files = (await fs.readdir(BLOG_DIR)).filter((file) => file.endsWith(".mdx"));

	const postsData = await Promise.all(
		files.map(async (file) => {
			const slug = file.replace(/\.mdx?$/, "");
			const result = (await getMDXFileData(slug, {
				cwd: "content/blog",
			})) as unknown as TBlogPostPageProps;

			return { ...result, slug };
		})
	);
	// .filter((meta) => process.env.NODE_ENV === "development" || meta.published)
	// .sort((a, b) => {
	// 	return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
	// });
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
