export type KeebDetails = {
	name: string;
	tags: Array<{ name: string }>;
	image: {
		url: string;
		height: number;
		width: number;
	};
};
