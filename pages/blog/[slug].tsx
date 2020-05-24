import { GetStaticPaths, GetStaticProps } from "next";
import path from "path";
import fs from "fs";
import dynamic from "next/dynamic";
import { getPostsData } from "utils/blog";
import { Layout } from "components/Layouts";
import { BlogPostTitle, BlogPostMDXContent, Datestamp } from "styled/blog";

const Post = ({ post }: { post: TBlogPost }) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`));

	return (
		<Layout>
			<BlogPostTitle>{post.title}</BlogPostTitle>
			<Datestamp>
				{new Date(post.publishedAt).toLocaleDateString("en-US", {
					month: "long",
					year: "numeric",
					day: "numeric",
				})}
			</Datestamp>
			<BlogPostMDXContent>
				<MDXPost />
			</BlogPostMDXContent>
		</Layout>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const META = /export\s+const\s+meta\s+=\s+(\{(\n|.)*?\n\})/;
	const DIR = path.join(process.cwd(), "content/blog");
	const files = fs.readdirSync(DIR).filter((file) => file.endsWith(".mdx"));

	const postsData: Array<TBlogPost> = files
		.map((file) => {
			const name = path.join(DIR, file);
			const contents = fs.readFileSync(name, "utf8");
			const match = META.exec(contents);

			if (!match || typeof match[1] !== "string")
				throw new Error(`${name} needs to export const meta = {}`);

			const meta = eval("(" + match[1] + ")");

			return {
				...meta,
				slug: file.replace(/\.mdx?$/, ""),
			};
		})
		.filter((meta) => meta.published)
		.sort((a, b) => {
			return (
				new Date(b.publishedAt).getTime() -
				new Date(a.publishedAt).getTime()
			);
		});

	// Get the paths we want to pre-render based on posts
	const paths = postsData.map((post) => ({
		params: { slug: post.slug },
	}));

	// We'll pre-render only these paths at build time.
	// { fallback: false } means other routes should 404.
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const postsData = getPostsData();

	const post = postsData.find((postData) => postData.slug === params.slug);
	return { props: { post } };
};

export default Post;
