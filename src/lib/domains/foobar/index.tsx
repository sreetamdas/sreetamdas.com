import { merge } from "lodash-es";
import { StateCreator } from "zustand";

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

export type FoobarPage = (typeof FOOBAR_PAGES)[keyof typeof FOOBAR_PAGES];

export type FoobarSchrodingerProps = {
	completedPage?: FoobarPage;
	unlocked?: boolean;
};

export type FoobarDataType = {
	visitedPages: Array<string>;
	konami: boolean;
	unlocked: boolean;
	completed: Array<FoobarPage>;
	allAchievements: boolean;
};

export const initialFoobarData: FoobarDataType = {
	visitedPages: [],
	konami: false,
	unlocked: false,
	completed: [],
	allAchievements: false,
};

export type FoobarSliceType = {
	foobarData: FoobarDataType;
	setFoobarData: (data: Partial<FoobarDataType>) => void;
};
export const createFoobarSlice: StateCreator<FoobarSliceType> = (set) => ({
	foobarData: initialFoobarData,
	setFoobarData: (data) => set((state) => ({ foobarData: merge(state.foobarData, data) })),
});
