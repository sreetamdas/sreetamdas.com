declare const FOOBAR_PAGES = {
	sourceCode: "source-code",
	headers: "headers",
	DNS_TXT: "dns-txt",
	easterEgg: "easter-egg",
	index: "/",
	devtools: "devtools",
	navigator: "navigator",
	konami: "konami",
	offline: "offline",
} as const;

declare type TFoobarPages = typeof FOOBAR_PAGES[keyof typeof FOOBAR_PAGES];

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

declare type TFoobarSchrodingerProps = {
	completedPage?: TFoobarPages;
};
