declare type TFoobarData = {
	visitedPages: Array<string>;
	konami?: boolean;
	unlocked: boolean;
};

declare type TFoobarContext = Partial<TFoobarData> & {
	dataLoaded: boolean;
	updateFoobarDataPartially: (data: Partial<TFoobarData>) => void;
};
