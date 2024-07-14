import { isObject } from "lodash-es";
import type { PlaceholderValue, StaticImport } from "next/dist/shared/lib/get-img-props";
import NextImage from "next/image";
import type { DetailedHTMLProps, ImgHTMLAttributes, RefAttributes } from "react";

type SafeNumber = number | `${number}`;
type CustomImageProps = {
	isWrapped?: boolean;
};
type ImageProps = Omit<
	DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
	"height" | "width" | "loading" | "ref" | "alt" | "src" | "srcSet"
> & {
	src?: string | StaticImport;
	alt?: string;
	width?: SafeNumber;
	height?: SafeNumber;
	quality?: SafeNumber;
	priority?: boolean;
	loading?: "eager" | "lazy";
	placeholder?: PlaceholderValue;
	unoptimized?: boolean;
} & RefAttributes<HTMLImageElement> &
	CustomImageProps;
export const Image = (props: ImageProps) => {
	const { alt = " ", src, height, width, isWrapped = false, ...restProps } = props;

	if (typeof src === "undefined") return null;

	if ((typeof height !== "undefined" && typeof width !== "undefined") || isObject(src)) {
		return isWrapped ? (
			<NextImage alt={alt} src={src} height={height} width={width} quality="100" {...restProps} />
		) : (
			<span className="[&_img]:h-auto [&_img]:w-full [&_img]:max-w-[--max-width] [&_img]:rounded-global">
				<NextImage alt={alt} src={src} height={height} width={width} quality="100" {...restProps} />
			</span>
		);
	}

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

	// for external images
	return isWrapped ? (
		// biome-ignore lint/a11y/useAltText: Next.js Image
		<img src={src} alt={alt} loading="lazy" {...restProps} />
	) : (
		<span className="[&_img]:h-auto [&_img]:w-full [&_img]:max-w-[--max-width] [&_img]:rounded-global">
			{/* biome-ignore lint/a11y/useAltText: Next.js Image */}
			<img src={src} alt={alt} loading="lazy" {...restProps} />
		</span>
	);
};
