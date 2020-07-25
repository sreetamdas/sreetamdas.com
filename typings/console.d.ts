declare type TFoobarData = {
	visitedPages: Array<string>;
	konami?: boolean;
	unlocked: boolean;
	completed: Array<TFoobarPages>;
};

declare type TFoobarContext = Partial<TFoobarData> & {
	dataLoaded: boolean;
	updateFoobarDataPartially: (data: Partial<TFoobarData>) => void;
};

declare type TFoobarPagesImported = import("pages/foobar").FOOBAR_PAGES;

declare type TFoobarPages = typeof TFoobarPagesImported[keyof typeof TFoobarPagesImported];

declare type TFoobarSchrodingerProps = {
	completedPage?: TFoobarPages;
};
