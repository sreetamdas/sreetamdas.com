import NextImage from "next/image";
import { DetailedHTMLProps, ImgHTMLAttributes } from "react";
import styled from "styled-components";

export const ImageWrapper = styled.span`
	& img {
		max-width: var(--max-width);
		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
	}
`;

type SafeNumber = number | `${number}`;
type ImageProps = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
export const CustomImage = ({ alt = " ", src, height, width }: ImageProps) => {
	if (typeof src === "undefined") return null;
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
	if (typeof height !== "undefined" && typeof width !== "undefined") {
		return (
			<ImageWrapper>
				<NextImage
					alt={alt}
					src={src}
					height={height as SafeNumber}
					width={width as SafeNumber}
					quality="100"
				/>
			</ImageWrapper>
		);
	}

	// for external images
	return (
		<ImageWrapper>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={src} alt={alt} loading="lazy" />
		</ImageWrapper>
	);
};
