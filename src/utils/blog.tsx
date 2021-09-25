import { promises as fs } from "fs";
import path from "path";

import { bundleMDX } from "mdx-bundler";
import remarkSlug from "remark-slug";

import { TBlogPostFrontmatter, TBlogPostPageProps } from "typings/blog";

const PATH = path.resolve(process.cwd(), "src");
const BLOG_DIR = path.resolve(PATH, "content", "blog");

export const getBlogPreviewImageURL = ({ slug }: { slug: TBlogPostFrontmatter["slug"] }) =>
	`${process.env.SITE_URL}/blog/${slug}/preview.png`;

export const getAllBlogPostsData = async () => {
	const files = (await fs.readdir(BLOG_DIR)).filter((file) => file.endsWith(".mdx"));

	const postsData = await Promise.all(
		files.map(async (file) => {
			const name = path.resolve(BLOG_DIR, file);
			const mdxSource = await fs.readFile(name, "utf8");
			const result = await bundleMDX(mdxSource, {
				cwd: path.dirname(name),
				// globals: { "next/link": "_nextLink" },
				xdmOptions(options) {
					// this is the recommended way to add custom remark/rehype plugins:
					// The syntax might look weird, but it protects you in case we add/remove
					// plugins in the future.
					options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkSlug];
					options.rehypePlugins = [...(options.rehypePlugins ?? [])];

					return options;
				},
				esbuildOptions(options) {
					options.platform = "node";
					// options.target = "esnext";

					return options;
				},
			});
			const slug = file.replace(/\.mdx?$/, "");

			return { ...result, slug };
		}) as unknown as Array<TBlogPostPageProps>
	);
	// .filter((meta) => process.env.NODE_ENV === "development" || meta.published)
	// .sort((a, b) => {
	// 	return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
	// });

	return postsData;
};

export async function getBlogPostsSlugs() {
	const postsSlugs = (await fs.readdir(BLOG_DIR))
		.filter((file) => file.endsWith(".mdx"))
		.map((slug) => slug.replace(/\.mdx?$/, ""));
	return postsSlugs;
}

type TGetMDXFileDataOptions = {
	cwd: string;
};
export async function getMDXFileData(filePath: string, options?: TGetMDXFileDataOptions) {
	const DIR = path.resolve(PATH, ...(options?.cwd ?? "content/blog").split("/"));

	const name = path.resolve(DIR ?? BLOG_DIR, `${filePath}.mdx`);
	const mdxSource = await fs.readFile(name, "utf8");

	const result = await bundleMDX(mdxSource, {
		cwd: path.dirname(name),
		xdmOptions(options) {
			// this is the recommended way to add custom remark/rehype plugins:
			// The syntax might look weird, but it protects you in case we add/remove
			// plugins in the future.
			options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkSlug];
			options.rehypePlugins = [...(options.rehypePlugins ?? [])];

			return options;
		},
		esbuildOptions(options) {
			options.platform = "node";
			// options.target = "esnext";

			return options;
		},
	});

	return result;
}

export async function getRootPagesData() {
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
