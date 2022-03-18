import { merge } from "lodash-es";
import create, { StateCreator } from "zustand";
import { persist } from "zustand/middleware";

import { TFoobarData } from "@/typings/console";

const initialFoobarData: TFoobarData = {
	visitedPages: [],
	konami: false,
	unlocked: false,
	completed: [],
	allAchievements: false,
};

export type FoobarStoreType = {
	foobarData: TFoobarData;
	setFoobarData: (data: Partial<TFoobarData>) => void;
};

const foobarStore: StateCreator<FoobarStoreType> = (set) => ({
	foobarData: initialFoobarData,
	setFoobarData: (data) => set((state) => ({ foobarData: merge(state.foobarData, data) })),
});

export const useFoobarStore = create(persist(foobarStore, { name: "foobar-data-zustand" }));
