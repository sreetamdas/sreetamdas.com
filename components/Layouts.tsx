import styled from "styled-components";

export const BlogPostsPreviewLayout = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(2, minmax(200px, 1fr));
	grid-gap: 1rem;
`;

export const Card = styled.div`
	padding: 10px;
	border-radius: 10px;
	background: #ffffff;
	border: 1px solid grey;
`;

export const BlogPostTitle = styled.h2`
	color: purple;
	margin: 0;
	padding-bottom: 10px;
`;

export const BlogPostPreview = ({ post }: { post: TBlogPost }) => {
	return (
		<Card>
			<BlogPostTitle>{post.title}</BlogPostTitle>
			<small>
				{new Date(post.publishedAt).toLocaleDateString("en-US", {
					month: "long",
					year: "numeric",
					day: "numeric",
				})}
			</small>
			<div>{post.summary}</div>
		</Card>
	);
};
