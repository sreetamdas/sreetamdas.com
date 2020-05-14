import { Fragment } from "react";
import fs from "fs";
import path from "path";
import styled from "styled-components";
import { GetStaticProps } from "next";
import { BlogPostsPreviewLayout, BlogPostPreview } from "components/Layouts";

const Title = styled.h1`
	font-size: 50px;
`;

const Index = ({ postsData }: { postsData: Array<TBlogPost> }) => {
	return (
		<Fragment>
			<Title>FooBar: The Blog</Title>
			<BlogPostsPreviewLayout>
				{postsData?.map((post, index) => (
					<BlogPostPreview {...{ post }} key={index} />
				))}
			</BlogPostsPreviewLayout>
		</Fragment>
	);
};

export const getStaticProps: GetStaticProps = async (_context) => {
	const META = /export\s+const\s+meta\s+=\s+(\{(\n|.)*?\n\})/;
	const DIR = path.join(process.cwd(), "pages/blog/posts");
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
				path: "/blog/posts/" + file.replace(/\.mdx?$/, ""),
			};
		})
		.filter((meta) => meta.published)
		.sort((a, b) => {
			return (
				new Date(b.publishedAt).getTime() -
				new Date(a.publishedAt).getTime()
			);
		});

	return {
		props: { postsData },
	};
};

export default Index;
