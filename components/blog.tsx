import { FaTwitter } from "react-icons/fa";

import { IconContainer } from "styles/blog";

export const ShareLinks = (post: TBlogPost) => {
	const tweetShareURL = `https://twitter.com/intent/tweet?text=Check out: ${post.title}&url=${process.env.SITE_URL}/blog/${post.slug}%0D%0A&via=_SreetamDas`;

	return (
		<IconContainer
			href={tweetShareURL}
			target="_blank"
			rel="noopener noreferrer"
		>
			<FaTwitter />
		</IconContainer>
	);
};
