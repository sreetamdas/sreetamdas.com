declare type TFoobarData = {
	visited: boolean;
	visitedPages: Array<string>;
	konami: boolean;
};

declare type TFoobarContext = TFoobarData & {
	updateFoobarDataFromConsumer: (data: Partial<TFoobarData>) => void;
};
