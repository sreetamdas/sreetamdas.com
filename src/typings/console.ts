// TODO move these to domains/foobar
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

export type TFoobarSchrodingerProps = {
	completedPage?: TFoobarPage;
	unlocked?: boolean;
};
