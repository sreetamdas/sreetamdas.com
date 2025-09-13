export const Image = (props: HTMLImageElement) => {
	const { alt = " ", src, height, width } = props;

	if (typeof src === "undefined") return null;

	return (
		<span className="[&_img]:rounded-global [&_img]:h-auto [&_img]:w-full [&_img]:max-w-[--max-width]">
			<img src={src} alt={alt} height={height} width={width} loading="lazy" />
		</span>
	);
	// );
};
