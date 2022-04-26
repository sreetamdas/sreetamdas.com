import {
	PreviewCard,
	ExtraInfoWrapper,
	PreviewMetadata,
	PostPreviewTitle,
	PostPreviewSummary,
	ReadMorePrompt,
} from "./PostPreview.styled";

import { PostNotPublishedWarning } from "@/styles/blog";
import { BlogPostsPreviewLayout } from "@/styles/layouts";
import { LinkTo } from "@/styles/typography";
import { TBlogPostPageProps } from "@/typings/blog";
import { useHover } from "@/utils/hooks";

type TBlogPostPreviewProps = Pick<TBlogPostPageProps, "frontmatter" | "slug">;
export const BlogPostPreview = ({ frontmatter, slug }: TBlogPostPreviewProps) => {
	const [hoverRef, isHovered] = useHover<HTMLAnchorElement>();

	return (
		<PreviewCard>
			<LinkTo href={`/blog/${slug}`} scroll={false} passHref>
				<PostPreviewTitle $isHovered={isHovered}>{frontmatter.title}</PostPreviewTitle>
			</LinkTo>
			<PostPreviewSummary>{frontmatter.summary}</PostPreviewSummary>
			<ExtraInfoWrapper>
				<PreviewMetadata>
					{new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</PreviewMetadata>
			</ExtraInfoWrapper>
			{!frontmatter.published && <PostNotPublishedWarning />}
			<LinkTo ref={hoverRef} href={`/blog/${slug}`}>
				<ReadMorePrompt>Read more</ReadMorePrompt>
			</LinkTo>
		</PreviewCard>
	);
};

type TBlogPostsPreviewProps = { posts: Array<TBlogPostPreviewProps> };
export const BlogPostsPreviews = ({ posts }: TBlogPostsPreviewProps) => (
	<BlogPostsPreviewLayout>
		{posts.map(({ frontmatter, slug }, index) => (
			<BlogPostPreview {...{ frontmatter, slug }} key={index} />
		))}
	</BlogPostsPreviewLayout>
);
