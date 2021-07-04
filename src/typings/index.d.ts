declare module "*.svg" {
	const value: unknown;
	export default value;
}
declare module "*.jpg" {
	const value: unknown;
	export default value;
}
declare module "*.mdx" {
	let MDXComponent: (props: unknown) => JSX.Element;
	export default MDXComponent;
}
