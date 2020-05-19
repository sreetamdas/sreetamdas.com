import styled from "styled-components";

export const BlogPostsPreviewLayout = styled.div`
	width: 100%;
	display: grid;
	max-width: 550px;
	grid-gap: 2rem;
`;

export const Card = styled.div`
	padding: 15px;
	border-radius: 10px;
	/* background: #ffffff; */
	border: 1px solid grey;
`;

export const BlogPostTitle = styled.h2`
	color: var(--color-primary-accent);
	margin: 0;
`;

export const Datestamp = styled.p`
	font-size: 12px;
	padding-bottom: 10px;
	margin: 0; /* thanks @mxstbr! */
`;

export const BlogPostPreview = ({ post }: { post: TBlogPost }) => {
	return (
		<Card>
			<BlogPostTitle>{post.title}</BlogPostTitle>
			<Datestamp>
				{new Date(post.publishedAt).toLocaleDateString("en-US", {
					month: "long",
					year: "numeric",
					day: "numeric",
				})}
			</Datestamp>
			<SmallText>{post.summary}</SmallText>
		</Card>
	);
};

export const Title = styled.h1`
	font-size: 32px;
	padding-top: 30px;
`;

export const Text = styled.p<{ paddedTop?: boolean }>`
	font-size: 18px;
	line-height: 1.4;
	margin: 0; /* thanks @mxstbr! */
	padding: 15px 0;
	padding-top: ${({ paddedTop }) => (paddedTop ? "150px" : null)};
`;

export const SmallText = styled.p`
	font-size: 14px;
	margin: 0; /* thanks @mxstbr! */
	padding-bottom: 10px;
`;

export const ExternalLink = styled.a`
	text-decoration: none;
	color: var(--color-primary-accent);
	cursor: pointer;

	&:visited {
		text-decoration: none;
	}

	&:hover {
		text-decoration: underline;
	}
`;

export const Layout = styled.div`
	/* padding: 0 200px; */
	max-width: 550px;
`;

export const Center = styled.div`
	display: grid;
	justify-items: center;
	grid-column: 2;
`;
