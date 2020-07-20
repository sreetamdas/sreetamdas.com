declare type TFoobarData = {
	visitedPages: Array<string>;
	konami?: boolean;
	unlocked: boolean;
	completed: Array<string>;
};

declare type TFoobarContext = Partial<TFoobarData> & {
	dataLoaded: boolean;
	updateFoobarDataPartially: (data: Partial<TFoobarData>) => void;
};
