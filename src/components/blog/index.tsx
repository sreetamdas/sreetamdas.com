import { RefObject } from "react";
import { FaLongArrowAltUp, FaTwitter } from "react-icons/fa";

import { ButtonUnstyled } from "@/components/Button/styles";
import { SITE_URL } from "@/config";
import { LinkedIcon } from "@/styles/blog";
import { FrontmatterProps, MDXBundledResultProps } from "@/typings/blog";

type TShareLinksProps = Pick<MDXBundledResultProps, "slug"> & Pick<FrontmatterProps, "title">;
export const ShareLinks = ({ title, slug }: TShareLinksProps) => {
	const tweetShareURL = `https://twitter.com/intent/tweet?text=Check out: ${title}&url=${SITE_URL}/blog/${slug}%0D%0A&via=_SreetamDas`;

	return (
		<LinkedIcon href={tweetShareURL}>
			<FaTwitter aria-label="Share on Twitter" />
			<span>Share via Twitter</span>
		</LinkedIcon>
	);
};

export const ScrollToTop = ({ topRef }: { topRef: RefObject<HTMLDivElement> }) => {
	function scrollToTop() {
		if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
	}
	return (
		<ButtonUnstyled onClick={scrollToTop}>
			<FaLongArrowAltUp style={{ fontSize: "20px" }} />
			Back to the top
		</ButtonUnstyled>
	);
};
