import NextImage from "next/image";
import styled from "styled-components";

const ImageWrapper = styled.span`
	& > span > img {
		border-radius: var(--border-radius);
	}
`;

export const CustomImage = ({
	alt,
	src,
	height,
	width,
}: {
	alt: string;
	src: string;
	height?: string;
	width?: string;
}) => {
	const type = src.slice(-3);

	if (type === "mp4") {
		return (
			<video
				autoPlay
				loop
				muted
				controls
				style={{
					maxWidth: "var(--max-width)",
					width: "100%",
					borderRadius: "var(--border-radius)",
				}}
			>
				<source {...{ src }} />
				{alt}
			</video>
		);
	}
	return (
		<ImageWrapper>
			<NextImage {...{ alt, src, height, width }} quality="100" />
		</ImageWrapper>
	);
};
