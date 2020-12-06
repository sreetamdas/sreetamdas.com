declare const TFOOBAR_PAGES = {
	sourceCode: "source-code",
	headers: "headers",
	DNS_TXT: "dns-txt",
	easterEgg: "easter-egg",
	index: "/",
	devtools: "devtools",
	navigator: "navigator",
	konami: "konami",
	offline: "offline",
	hack: "hack",
	notFound: "error404",
	dogs: "dogs",
} as const;

declare type TFoobarPages = typeof TFOOBAR_PAGES[keyof typeof TFOOBAR_PAGES];

declare type TFoobarData = {
	visitedPages: Array<string>;
	konami?: boolean;
	unlocked: boolean;
	completed: Array<TFoobarPages>;
};

declare type TFoobarContext = TFoobarData & {
	dataLoaded: boolean;
	updateFoobarDataPartially: (data: Partial<TFoobarData>) => void;
};

declare type TFoobarSchrodingerProps = {
	completedPage?: TFoobarPages;
};
