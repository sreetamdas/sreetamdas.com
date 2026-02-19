declare module "@/generated/rwc.json" {
	type RwcSolution = {
		html: string;
		slug: string;
		filename: string | undefined;
		lang: string;
	};

	const data: {
		all_solutions: Array<RwcSolution>;
		background_color: string;
	};

	export default data;
}
