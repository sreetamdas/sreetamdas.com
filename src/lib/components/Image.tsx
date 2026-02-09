export type ImageProps = Required<Pick<HTMLImageElement, "src">> & Partial<HTMLImageElement>;
export const Image = (props: ImageProps) => {
	const { alt = " ", src, height, width } = props;

	if (typeof src === "undefined") return null;

	return (
		<span className="[&_img]:rounded-global flex justify-center [&_img]:h-auto [&_img]:w-full">
			<img src={src} alt={alt} height={height} width={width} loading="lazy" />
		</span>
	);
	// );
};
