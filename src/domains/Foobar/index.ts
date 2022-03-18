import { merge } from "lodash-es";
import create, { StateCreator } from "zustand";
import { persist } from "zustand/middleware";

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

export type FoobarDataType = {
	visitedPages: Array<string>;
	konami: boolean;
	unlocked: boolean;
	completed: Array<TFoobarPage>;
	allAchievements: boolean;
};

export const initialFoobarData: FoobarDataType = {
	visitedPages: [],
	konami: false,
	unlocked: false,
	completed: [],
	allAchievements: false,
};

export type FoobarStoreType = {
	foobarData: FoobarDataType;
	setFoobarData: (data: Partial<FoobarDataType>) => void;
};

const foobarStore: StateCreator<FoobarStoreType> = (set) => ({
	foobarData: initialFoobarData,
	setFoobarData: (data) => set((state) => ({ foobarData: merge(state.foobarData, data) })),
});

export const useFoobarStore = create(persist(foobarStore, { name: "foobar-data-zustand" }));
