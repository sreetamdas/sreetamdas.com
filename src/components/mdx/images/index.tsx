import NextImage from "next/image";
import styled from "styled-components";

export const ImageWrapper = styled.span`
	& img {
		max-width: var(--max-width);
		width: 100%;
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
				<source src={src} />
				{alt}
			</video>
		);
	}
	if (src[0] === "/") {
		return (
			<ImageWrapper>
				<NextImage {...{ alt, src, height, width }} quality="100" />
			</ImageWrapper>
		);
	}

	return (
		<ImageWrapper>
			{/* for external images */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={src} alt={alt} loading="lazy" />
		</ImageWrapper>
	);
};
