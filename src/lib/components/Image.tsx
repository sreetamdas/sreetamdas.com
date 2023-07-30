import NextImage from "next/image";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";

// export const ImageWrapper = styled.span`
// 	& img {
// 		max-width: var(--max-width);
// 		width: 100%;
// 		height: auto;
// 		border-radius: var(--border-radius);
// 	}
// `;

type SafeNumber = number | `${number}`;
type ImageProps = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const Image = ({ alt = " ", src, height, width }: ImageProps) => {
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
			<span>
				<NextImage
					alt={alt}
					src={src}
					height={height as SafeNumber}
					width={width as SafeNumber}
					quality="100"
				/>
			</span>
		);
	}

	// for external images
	return (
		<span>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={src} alt={alt} loading="lazy" />
		</span>
	);
};
