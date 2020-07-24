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

declare const FoobarPages = {
	sourceCode: "source-code",
	headers: "headers",
	DNS_TXT: "dns-txt",
	easterEgg: "easter-egg",
} as const;

declare type TFoobarPages = typeof FoobarPages[keyof typeof FoobarPages];

declare type TFoobarSchrodingerProps = {
	completedPage?: TFoobarPages;
};
