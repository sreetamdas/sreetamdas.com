declare module "*.svg" {
	const value: any;
	export default value;
}
declare module "*.mdx" {
	let MDXComponent: (props: any) => JSX.Element;
	export default MDXComponent;
}
