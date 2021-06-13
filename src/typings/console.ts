export const FOOBAR_PAGES = {
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
	localforage: "localforage",
	teapot: "teapot",
} as const;

export type TFoobarPage = typeof FOOBAR_PAGES[keyof typeof FOOBAR_PAGES];

export type TFoobarData = {
	visitedPages: Array<string>;
	konami: boolean;
	unlocked: boolean;
	completed: Array<TFoobarPage>;
	allAchievements: boolean;
};

export type TFoobarContext = TFoobarData & {
	dataLoaded: boolean;
	updateFoobarDataPartially: (data: Partial<TFoobarData>) => void;
};

export type TFoobarSchrodingerProps = {
	completedPage?: TFoobarPage;
	unlocked?: boolean;
};
