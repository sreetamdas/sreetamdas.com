import { cn } from "@/lib/helpers/utils";

export type ImageProps = Required<Pick<HTMLImageElement, "src">> &
	Partial<HTMLImageElement> & {
		removeWrapper?: boolean;
	};
export const Image = (props: ImageProps) => {
	const { alt = " ", src, height, width, removeWrapper = false, className } = props;

	if (typeof src === "undefined") return null;

	if (removeWrapper) {
		return (
			<img src={src} alt={alt} height={height} width={width} loading="lazy" className={className} />
		);
	}

	return (
		<span
			className={cn(
				"flex justify-center [&_img]:h-auto [&_img]:w-full [&_img]:rounded-global",
				className,
			)}
		>
			<img src={src} alt={alt} height={height} width={width} loading="lazy" />
		</span>
	);
};
